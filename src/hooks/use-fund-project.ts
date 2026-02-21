"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { DeSciService } from "@/lib/desci/desci-service"
import { useDeSciHistoryStore } from "@/stores/desci-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import { useOnChainCommit } from "@/hooks/use-on-chain-commit"
import { createStealthTransfer } from "@/lib/solana/stealth-transfer"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import type {
  DeSciStep,
  FundProjectParams,
  DeSciActionRecord,
  Contribution,
} from "@/lib/desci/types"

export type FundProjectStatus = DeSciStep | "idle" | "error"

export interface UseFundProjectReturn {
  status: FundProjectStatus
  activeRecord: DeSciActionRecord | null
  error: string | null
  fundProject: (
    params: FundProjectParams
  ) => Promise<DeSciActionRecord | undefined>
  reset: () => void
  /** Solana transaction state for on-chain commitment */
  commitTx: ReturnType<typeof useOnChainCommit>["tx"]
  /** Solana transaction state for shielded transfer */
  shieldedTx: ReturnType<typeof useSolanaTransaction>
}

export function useFundProject(): UseFundProjectReturn {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const { addAction, addContribution } = useDeSciHistoryStore()
  const { trackDeSci } = useTrackEvent()
  const { commit, tx: commitTx } = useOnChainCommit("fund")
  const shieldedTx = useSolanaTransaction()

  const [status, setStatus] = useState<FundProjectStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<DeSciActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const defaultShieldedTransfer = useCallback(
    async (amountLamports: number, memo: string): Promise<string | null> => {
      if (!publicKey) return null
      try {
        const viewingKey =
          process.env.NEXT_PUBLIC_RECIPIENT_VIEWING_PUBKEY ??
          "11111111111111111111111111111111"
        const spendingKey =
          process.env.NEXT_PUBLIC_RECIPIENT_SPENDING_PUBKEY ??
          "11111111111111111111111111111111"

        const transfer = await createStealthTransfer({
          amountLamports,
          memo,
          recipientViewingPublicKey: viewingKey,
          recipientSpendingPublicKey: spendingKey,
        })

        const transaction = await transfer.buildTransaction(
          publicKey,
          connection.rpcEndpoint
        )

        return shieldedTx.sendTransaction(transaction)
      } catch {
        return null
      }
    },
    [publicKey, connection, shieldedTx]
  )

  const fundProject = useCallback(
    async (
      params: FundProjectParams
    ): Promise<DeSciActionRecord | undefined> => {
      if (!publicKey && !isDemoMode) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new DeSciService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
          onFundTransaction: async (projectId, tier) => {
            return commit(projectId, tier)
          },
          onShieldedTransfer: defaultShieldedTransfer,
        })

        const validationError = service.validate("fund", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("selecting_project")

        const result = await service.fundProject(params)

        setActiveRecord(result)
        addAction(result)

        if (result.commitmentHash) {
          const contribution: Contribution = {
            projectId: params.projectId,
            tier: params.tier,
            commitmentHash: result.commitmentHash,
            contributedAt: Date.now(),
          }
          addContribution(contribution)
        }

        trackDeSci({
          action: "project_fund",
          projectId: params.projectId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Funding failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [
      publicKey,
      isDemoMode,
      addAction,
      addContribution,
      trackDeSci,
      commit,
      defaultShieldedTransfer,
    ]
  )

  return { status, activeRecord, error, fundProject, reset, commitTx, shieldedTx }
}
