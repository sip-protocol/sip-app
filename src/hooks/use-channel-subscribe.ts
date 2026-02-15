"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ChannelService } from "@/lib/channel/channel-service"
import { useChannelHistoryStore } from "@/stores/channel-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  ChannelStep,
  SubscribeParams,
  ChannelActionRecord,
  ChannelSubscription,
} from "@/lib/channel/types"

export type ChannelSubscribeStatus = ChannelStep | "idle" | "error"

export interface UseChannelSubscribeReturn {
  status: ChannelSubscribeStatus
  activeRecord: ChannelActionRecord | null
  error: string | null
  subscribe: (
    params: SubscribeParams
  ) => Promise<ChannelActionRecord | undefined>
  reset: () => void
}

export function useChannelSubscribe(): UseChannelSubscribeReturn {
  const { publicKey } = useWallet()
  const { addAction, addSubscription } = useChannelHistoryStore()
  const { trackChannel } = useTrackEvent()

  const [status, setStatus] = useState<ChannelSubscribeStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<ChannelActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const subscribe = useCallback(
    async (
      params: SubscribeParams
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

        const validationError = service.validate("subscribe", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("selecting_channel")

        const result = await service.subscribe(params)

        setActiveRecord(result)
        addAction(result)

        const subscription: ChannelSubscription = {
          dropId: params.dropId,
          subscribedAt: Date.now(),
          accessTier: result.accessTier ?? "free",
          isActive: true,
        }
        addSubscription(subscription)

        trackChannel({
          action: "channel_subscribe",
          dropId: params.dropId,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Subscribe failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, addSubscription, trackChannel]
  )

  return { status, activeRecord, error, subscribe, reset }
}
