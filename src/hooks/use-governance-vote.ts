"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useDemoModeStore } from "@/stores/demo-mode"
import { GovernanceService } from "@/lib/governance/governance-service"
import { useGovernanceHistoryStore } from "@/stores/governance-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import { buildCastVoteTransaction } from "@/lib/governance/realms-vote-builder"
import type {
  VoteStep,
  VoteParams,
  PrivateVoteRecord,
  RealmVoteData,
} from "@/lib/governance/types"

export type GovernanceVoteStatus = VoteStep | "idle" | "error"

export interface UseGovernanceVoteReturn {
  status: GovernanceVoteStatus
  activeVote: PrivateVoteRecord | null
  error: string | null
  commitVote: (params: VoteParams) => Promise<PrivateVoteRecord | undefined>
  revealVote: (voteId: string) => Promise<PrivateVoteRecord | undefined>
  reset: () => void
}

export interface UseGovernanceVoteOptions {
  onCommitTransaction?: (
    proposalId: string,
    choice: number,
    weight: string
  ) => Promise<string | null>
  /** When true AND realmVoteData is provided, sends a real SPL Governance castVote tx after commitment */
  sendRealmsVote?: boolean
  /** On-chain realm data needed for SPL Governance castVote */
  realmVoteData?: RealmVoteData
}

export function useGovernanceVote(
  options: UseGovernanceVoteOptions = {}
): UseGovernanceVoteReturn {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const { addVote, updateVote, getVote } = useGovernanceHistoryStore()
  const { trackVote } = useTrackEvent()
  const realmsTx = useSolanaTransaction()

  const [status, setStatus] = useState<GovernanceVoteStatus>("idle")
  const [activeVote, setActiveVote] = useState<PrivateVoteRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveVote(null)
    setError(null)
    realmsTx.reset()
  }, [realmsTx])

  const commitVote = useCallback(
    async (params: VoteParams): Promise<PrivateVoteRecord | undefined> => {
      if (!publicKey && !isDemoMode) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new GovernanceService({
          mode: "simulation",
          onStepChange: (step, vote) => {
            setStatus(step)
            setActiveVote({ ...vote })
          },
          onCommitTransaction: options.onCommitTransaction,
        })

        const validationError = service.validate(params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("encrypting")

        const result = await service.commitVote(params)

        // Send real SPL Governance castVote transaction after commitment succeeds
        if (
          options.sendRealmsVote &&
          options.realmVoteData &&
          publicKey
        ) {
          try {
            const tx = await buildCastVoteTransaction(connection, {
              realmPubkey: new PublicKey(options.realmVoteData.realmPubkey),
              governancePubkey: new PublicKey(options.realmVoteData.governancePubkey),
              proposalPubkey: new PublicKey(params.proposalId),
              tokenOwnerRecordPubkey: new PublicKey(options.realmVoteData.tokenOwnerRecordPubkey),
              voterPubkey: publicKey,
              voterWeightRecordPubkey: options.realmVoteData.voterWeightRecordPubkey
                ? new PublicKey(options.realmVoteData.voterWeightRecordPubkey)
                : undefined,
              choice: params.choice,
            })

            const realmsSignature = await realmsTx.sendTransaction(tx)
            if (realmsSignature) {
              result.realmsVoteTxSignature = realmsSignature
            }
          } catch (realmsErr) {
            // Log but don't fail the overall vote — the SIP commitment succeeded
            console.warn(
              "[SIP] Realms castVote failed (commitment still valid):",
              realmsErr instanceof Error ? realmsErr.message : realmsErr
            )
          }
        }

        setActiveVote(result)
        addVote(result)

        trackVote({
          proposalId: params.proposalId,
          choice: params.choice,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Vote commit failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [
      publicKey,
      isDemoMode,
      connection,
      addVote,
      trackVote,
      realmsTx,
      options.onCommitTransaction,
      options.sendRealmsVote,
      options.realmVoteData,
    ]
  )

  const revealVote = useCallback(
    async (voteId: string): Promise<PrivateVoteRecord | undefined> => {
      if (!publicKey && !isDemoMode) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      const existingVote = getVote(voteId)
      if (!existingVote) {
        setError("Vote not found")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new GovernanceService({
          mode: "simulation",
          onStepChange: (step, vote) => {
            setStatus(step)
            setActiveVote({ ...vote })
          },
        })

        setStatus("revealing")

        const result = await service.revealVote(
          voteId,
          existingVote.encryptionKey,
          existingVote.encryptedVote
        )

        setActiveVote(result)
        updateVote(voteId, {
          status: "revealed",
          revealedAt: result.revealedAt,
          revealedChoice: result.revealedChoice,
          revealedWeight: result.revealedWeight,
        })

        trackVote({
          proposalId: existingVote.proposalId,
          action: "reveal",
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Vote reveal failed"
        setError(message)
        setStatus("error")

        updateVote(voteId, {
          status: "failed",
          error: message,
        })

        return undefined
      }
    },
    [publicKey, isDemoMode, getVote, updateVote, trackVote]
  )

  return { status, activeVote, error, commitVote, revealVote, reset }
}
