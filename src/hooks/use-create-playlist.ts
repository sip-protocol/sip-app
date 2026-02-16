"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { MusicService } from "@/lib/music/music-service"
import { useMusicHistoryStore } from "@/stores/music-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  MusicStep,
  CreatePlaylistParams,
  MusicActionRecord,
} from "@/lib/music/types"

export type CreatePlaylistStatus = MusicStep | "idle" | "error"

export interface UseCreatePlaylistReturn {
  status: CreatePlaylistStatus
  activeRecord: MusicActionRecord | null
  error: string | null
  createPlaylist: (
    params: CreatePlaylistParams
  ) => Promise<MusicActionRecord | undefined>
  reset: () => void
}

export function useCreatePlaylist(): UseCreatePlaylistReturn {
  const { publicKey } = useWallet()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const { addAction } = useMusicHistoryStore()
  const { trackMusic } = useTrackEvent()

  const [status, setStatus] = useState<CreatePlaylistStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<MusicActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const createPlaylist = useCallback(
    async (
      params: CreatePlaylistParams
    ): Promise<MusicActionRecord | undefined> => {
      if (!publicKey && !isDemoMode) {
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

        const validationError = service.validate("playlist", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_proof")

        const result = await service.createPlaylist(params)

        setActiveRecord(result)
        addAction(result)

        trackMusic({
          action: "playlist_create",
          trackId: params.trackId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Playlist creation failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, isDemoMode, addAction, trackMusic]
  )

  return { status, activeRecord, error, createPlaylist, reset }
}
