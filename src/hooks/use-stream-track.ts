"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { MusicService } from "@/lib/music/music-service"
import { useMusicHistoryStore } from "@/stores/music-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  MusicStep,
  StreamTrackParams,
  MusicActionRecord,
  Stream,
} from "@/lib/music/types"

export type StreamTrackStatus = MusicStep | "idle" | "error"

export interface UseStreamTrackReturn {
  status: StreamTrackStatus
  activeRecord: MusicActionRecord | null
  error: string | null
  streamTrack: (
    params: StreamTrackParams
  ) => Promise<MusicActionRecord | undefined>
  reset: () => void
}

export function useStreamTrack(): UseStreamTrackReturn {
  const { publicKey } = useWallet()
  const { addAction, addStream } = useMusicHistoryStore()
  const { trackMusic } = useTrackEvent()

  const [status, setStatus] = useState<StreamTrackStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<MusicActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const streamTrack = useCallback(
    async (
      params: StreamTrackParams
    ): Promise<MusicActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new MusicService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
        })

        const validationError = service.validate("stream", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("selecting_track")

        const result = await service.streamTrack(params)

        setActiveRecord(result)
        addAction(result)

        if (result.commitmentHash) {
          const stream: Stream = {
            trackId: params.trackId,
            tier: params.tier,
            commitmentHash: result.commitmentHash,
            streamedAt: Date.now(),
          }
          addStream(stream)
        }

        trackMusic({
          action: "track_stream",
          trackId: params.trackId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Streaming failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, addStream, trackMusic]
  )

  return { status, activeRecord, error, streamTrack, reset }
}
