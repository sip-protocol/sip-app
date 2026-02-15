"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { DeSciService } from "@/lib/desci/desci-service"
import { useDeSciHistoryStore } from "@/stores/desci-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
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
}

export function useFundProject(): UseFundProjectReturn {
  const { publicKey } = useWallet()
  const { addAction, addContribution } = useDeSciHistoryStore()
  const { trackDeSci } = useTrackEvent()

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

  const fundProject = useCallback(
    async (
      params: FundProjectParams
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
    [publicKey, addAction, addContribution, trackDeSci]
  )

  return { status, activeRecord, error, fundProject, reset }
}
