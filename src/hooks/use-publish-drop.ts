"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ChannelService } from "@/lib/channel/channel-service"
import { useChannelHistoryStore } from "@/stores/channel-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  ChannelStep,
  PublishDropParams,
  ChannelActionRecord,
} from "@/lib/channel/types"

export type PublishDropStatus = ChannelStep | "idle" | "error"

export interface UsePublishDropReturn {
  status: PublishDropStatus
  activeRecord: ChannelActionRecord | null
  error: string | null
  publishDrop: (
    params: PublishDropParams
  ) => Promise<ChannelActionRecord | undefined>
  reset: () => void
}

export function usePublishDrop(): UsePublishDropReturn {
  const { publicKey } = useWallet()
  const { addAction } = useChannelHistoryStore()
  const { trackChannel } = useTrackEvent()

  const [status, setStatus] = useState<PublishDropStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<ChannelActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const publishDrop = useCallback(
    async (
      params: PublishDropParams
    ): Promise<ChannelActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new ChannelService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
        })

        const validationError = service.validate("publish", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("encrypting_content")

        const result = await service.publishDrop(params)

        setActiveRecord(result)
        addAction(result)

        trackChannel({
          action: "channel_publish",
          contentType: params.contentType,
          accessTier: params.accessTier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Publish failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, trackChannel]
  )

  return { status, activeRecord, error, publishDrop, reset }
}
