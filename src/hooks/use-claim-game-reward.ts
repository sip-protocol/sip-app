"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { GamingService } from "@/lib/gaming/gaming-service"
import { useGamingHistoryStore } from "@/stores/gaming-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  GamingStep,
  ClaimRewardParams,
  GamingActionRecord,
} from "@/lib/gaming/types"

export type ClaimGameRewardStatus = GamingStep | "idle" | "error"

export interface UseClaimGameRewardReturn {
  status: ClaimGameRewardStatus
  activeRecord: GamingActionRecord | null
  error: string | null
  claimReward: (
    params: ClaimRewardParams
  ) => Promise<GamingActionRecord | undefined>
  reset: () => void
}

export function useClaimGameReward(): UseClaimGameRewardReturn {
  const { publicKey } = useWallet()
  const { addAction } = useGamingHistoryStore()
  const { trackGaming } = useTrackEvent()

  const [status, setStatus] = useState<ClaimGameRewardStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<GamingActionRecord | null>(
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
    ): Promise<GamingActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new GamingService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
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

        trackGaming({
          action: "game_claim",
          gameId: params.gameId,
          rewardTier: params.rewardTier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Claim failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, trackGaming]
  )

  return { status, activeRecord, error, claimReward, reset }
}
