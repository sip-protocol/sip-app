"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { LoyaltyService } from "@/lib/loyalty/loyalty-service"
import { useLoyaltyHistoryStore } from "@/stores/loyalty-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  LoyaltyStep,
  JoinCampaignParams,
  LoyaltyActionRecord,
  CampaignProgress,
} from "@/lib/loyalty/types"

export type LoyaltyCampaignStatus = LoyaltyStep | "idle" | "error"

export interface UseLoyaltyCampaignReturn {
  status: LoyaltyCampaignStatus
  activeRecord: LoyaltyActionRecord | null
  error: string | null
  joinCampaign: (
    params: JoinCampaignParams
  ) => Promise<LoyaltyActionRecord | undefined>
  reset: () => void
}

export function useLoyaltyCampaign(): UseLoyaltyCampaignReturn {
  const { publicKey } = useWallet()
  const { addAction, addCampaign } = useLoyaltyHistoryStore()
  const { trackLoyalty } = useTrackEvent()

  const [status, setStatus] = useState<LoyaltyCampaignStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<LoyaltyActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const joinCampaign = useCallback(
    async (
      params: JoinCampaignParams
    ): Promise<LoyaltyActionRecord | undefined> => {
      if (!publicKey) {
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
        })

        const validationError = service.validate("join", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("selecting_campaign")

        const result = await service.joinCampaign(params)

        setActiveRecord(result)
        addAction(result)

        const progress: CampaignProgress = {
          campaignId: params.campaignId,
          completedActions: 0,
          requiredActions: 0,
          isComplete: false,
          joinedAt: Date.now(),
        }
        addCampaign(progress)

        trackLoyalty({
          action: "join_campaign",
          campaignId: params.campaignId,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Campaign join failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, addCampaign, trackLoyalty]
  )

  return { status, activeRecord, error, joinCampaign, reset }
}
