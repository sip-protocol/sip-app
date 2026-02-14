"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { GovernanceService } from "@/lib/governance/governance-service"
import { useGovernanceHistoryStore } from "@/stores/governance-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type { VoteStep, VoteParams, PrivateVoteRecord } from "@/lib/governance/types"

export type GovernanceVoteStatus = VoteStep | "idle" | "error"

export interface UseGovernanceVoteReturn {
  status: GovernanceVoteStatus
  activeVote: PrivateVoteRecord | null
  error: string | null
  commitVote: (params: VoteParams) => Promise<PrivateVoteRecord | undefined>
  revealVote: (voteId: string) => Promise<PrivateVoteRecord | undefined>
  reset: () => void
}

export function useGovernanceVote(): UseGovernanceVoteReturn {
  const { publicKey } = useWallet()
  const { addVote, updateVote, getVote } = useGovernanceHistoryStore()
  const { trackVote } = useTrackEvent()

  const [status, setStatus] = useState<GovernanceVoteStatus>("idle")
  const [activeVote, setActiveVote] = useState<PrivateVoteRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveVote(null)
    setError(null)
  }, [])

  const commitVote = useCallback(
    async (params: VoteParams): Promise<PrivateVoteRecord | undefined> => {
      if (!publicKey) {
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
        })

        const validationError = service.validate(params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("encrypting")

        const result = await service.commitVote(params)

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
    [publicKey, addVote, trackVote],
  )

  const revealVote = useCallback(
    async (voteId: string): Promise<PrivateVoteRecord | undefined> => {
      if (!publicKey) {
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
          existingVote.encryptedVote,
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
    [publicKey, getVote, updateVote, trackVote],
  )

  return { status, activeVote, error, commitVote, revealVote, reset }
}
