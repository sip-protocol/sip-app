"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { TapestryReader } from "@/lib/social/tapestry-reader"
import { SocialService } from "@/lib/social/social-service"
import { useSocialHistoryStore } from "@/stores/social-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  SocialConnection,
  SocialStep,
  FollowParams,
  SocialActionRecord,
} from "@/lib/social/types"

export type ConnectionStatus = SocialStep | "idle" | "error"

export interface UseConnectionsReturn {
  connections: SocialConnection[]
  isLoading: boolean
  followProfile: (
    params: FollowParams
  ) => Promise<SocialActionRecord | undefined>
  status: ConnectionStatus
  error: string | null
  reset: () => void
}

export function useConnections(profileId: string | null): UseConnectionsReturn {
  const { publicKey } = useWallet()
  const { addAction } = useSocialHistoryStore()
  const { trackSocial } = useTrackEvent()

  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<ConnectionStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profileId) {
      setConnections([])
      return
    }

    const reader = new TapestryReader("simulation")

    async function load() {
      setIsLoading(true)
      try {
        const data = await reader.getConnections(profileId!)
        setConnections(data)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [profileId])

  const reset = useCallback(() => {
    setStatus("idle")
    setError(null)
  }, [])

  const followProfile = useCallback(
    async (params: FollowParams): Promise<SocialActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new SocialService({
          mode: "simulation",
          onStepChange: (step) => {
            setStatus(step)
          },
        })

        const validationError = service.validate("follow", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_stealth")

        const result = await service.followProfile(params)

        addAction(result)

        trackSocial({
          action: "follow",
          targetProfileId: params.toProfileId,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Follow failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, trackSocial]
  )

  return { connections, isLoading, followProfile, status, error, reset }
}
