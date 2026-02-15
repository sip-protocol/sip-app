"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { MetaverseService } from "@/lib/metaverse/metaverse-service"
import { useMetaverseHistoryStore } from "@/stores/metaverse-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  MetaverseStep,
  ExploreWorldParams,
  MetaverseActionRecord,
  Visit,
} from "@/lib/metaverse/types"

export type ExploreWorldStatus = MetaverseStep | "idle" | "error"

export interface UseExploreWorldReturn {
  status: ExploreWorldStatus
  activeRecord: MetaverseActionRecord | null
  error: string | null
  exploreWorld: (
    params: ExploreWorldParams
  ) => Promise<MetaverseActionRecord | undefined>
  reset: () => void
}

export function useExploreWorld(): UseExploreWorldReturn {
  const { publicKey } = useWallet()
  const { addAction, addVisit } = useMetaverseHistoryStore()
  const { trackMetaverse } = useTrackEvent()

  const [status, setStatus] = useState<ExploreWorldStatus>("idle")
  const [activeRecord, setActiveRecord] =
    useState<MetaverseActionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const exploreWorld = useCallback(
    async (
      params: ExploreWorldParams
    ): Promise<MetaverseActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new MetaverseService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
        })

        const validationError = service.validate("explore", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("selecting_world")

        const result = await service.exploreWorld(params)

        setActiveRecord(result)
        addAction(result)

        if (result.commitmentHash) {
          const visit: Visit = {
            worldId: params.worldId,
            tier: params.tier,
            commitmentHash: result.commitmentHash,
            visitedAt: Date.now(),
          }
          addVisit(visit)
        }

        trackMetaverse({
          action: "world_explore",
          worldId: params.worldId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Exploration failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, addVisit, trackMetaverse]
  )

  return { status, activeRecord, error, exploreWorld, reset }
}
