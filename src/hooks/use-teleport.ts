"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { MetaverseService } from "@/lib/metaverse/metaverse-service"
import { useMetaverseHistoryStore } from "@/stores/metaverse-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  MetaverseStep,
  TeleportParams,
  MetaverseActionRecord,
} from "@/lib/metaverse/types"

export type TeleportStatus = MetaverseStep | "idle" | "error"

export interface UseTeleportReturn {
  status: TeleportStatus
  activeRecord: MetaverseActionRecord | null
  error: string | null
  teleport: (
    params: TeleportParams
  ) => Promise<MetaverseActionRecord | undefined>
  reset: () => void
}

export function useTeleport(): UseTeleportReturn {
  const { publicKey } = useWallet()
  const { addAction } = useMetaverseHistoryStore()
  const { trackMetaverse } = useTrackEvent()

  const [status, setStatus] = useState<TeleportStatus>("idle")
  const [activeRecord, setActiveRecord] =
    useState<MetaverseActionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const teleport = useCallback(
    async (
      params: TeleportParams
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

        const validationError = service.validate("teleport", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_proof")

        const result = await service.teleport(params)

        setActiveRecord(result)
        addAction(result)

        trackMetaverse({
          action: "world_teleport",
          worldId: params.worldId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Teleport failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, trackMetaverse]
  )

  return { status, activeRecord, error, teleport, reset }
}
