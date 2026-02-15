"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { DeSciService } from "@/lib/desci/desci-service"
import { useDeSciHistoryStore } from "@/stores/desci-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  DeSciStep,
  ReviewProjectParams,
  DeSciActionRecord,
} from "@/lib/desci/types"

export type ReviewProjectStatus = DeSciStep | "idle" | "error"

export interface UseReviewProjectReturn {
  status: ReviewProjectStatus
  activeRecord: DeSciActionRecord | null
  error: string | null
  reviewProject: (
    params: ReviewProjectParams
  ) => Promise<DeSciActionRecord | undefined>
  reset: () => void
}

export function useReviewProject(): UseReviewProjectReturn {
  const { publicKey } = useWallet()
  const { addAction } = useDeSciHistoryStore()
  const { trackDeSci } = useTrackEvent()

  const [status, setStatus] = useState<ReviewProjectStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<DeSciActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const reviewProject = useCallback(
    async (
      params: ReviewProjectParams
    ): Promise<DeSciActionRecord | undefined> => {
      if (!publicKey) {
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
        })

        const validationError = service.validate("review", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_proof")

        const result = await service.reviewProject(params)

        setActiveRecord(result)
        addAction(result)

        trackDeSci({
          action: "project_review",
          projectId: params.projectId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Review failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, trackDeSci]
  )

  return { status, activeRecord, error, reviewProject, reset }
}
