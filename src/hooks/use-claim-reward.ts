"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { LoyaltyService } from "@/lib/loyalty/loyalty-service"
import { useLoyaltyHistoryStore } from "@/stores/loyalty-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  LoyaltyStep,
  ClaimRewardParams,
  LoyaltyActionRecord,
} from "@/lib/loyalty/types"

export type ClaimRewardStatus = LoyaltyStep | "idle" | "error"

export interface UseClaimRewardOptions {
  onCommitTransaction?: (id: string, data: string) => Promise<string | null>
}

export interface UseClaimRewardReturn {
  status: ClaimRewardStatus
  activeRecord: LoyaltyActionRecord | null
  error: string | null
  claimReward: (
    params: ClaimRewardParams
  ) => Promise<LoyaltyActionRecord | undefined>
  reset: () => void
}

export function useClaimReward(
  options: UseClaimRewardOptions = {}
): UseClaimRewardReturn {
  const { publicKey } = useWallet()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const { addAction } = useLoyaltyHistoryStore()
  const { trackLoyalty } = useTrackEvent()

  const [status, setStatus] = useState<ClaimRewardStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<LoyaltyActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const claimReward = useCallback(
    async (
      params: ClaimRewardParams
    ): Promise<LoyaltyActionRecord | undefined> => {
      if (!publicKey && !isDemoMode) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new LoyaltyService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
          onCommitTransaction: options.onCommitTransaction,
        })

        const validationError = service.validate("claim", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_stealth")

        const result = await service.claimReward(params)

        setActiveRecord(result)
        addAction(result)

        trackLoyalty({
          action: "claim_reward",
          campaignId: params.campaignId,
          amount: params.amount,
          token: params.token,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Reward claim failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [
      publicKey,
      isDemoMode,
      addAction,
      trackLoyalty,
      options.onCommitTransaction,
    ]
  )

  return { status, activeRecord, error, claimReward, reset }
}
