"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { SocialService } from "@/lib/social/social-service"
import { useSocialHistoryStore } from "@/stores/social-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type { SocialStep, CreateProfileParams, SocialActionRecord, StealthProfile } from "@/lib/social/types"

export type SocialProfileStatus = SocialStep | "idle" | "error"

export interface UseSocialProfileReturn {
  status: SocialProfileStatus
  activeRecord: SocialActionRecord | null
  error: string | null
  createProfile: (params: CreateProfileParams) => Promise<SocialActionRecord | undefined>
  reset: () => void
}

export function useSocialProfile(): UseSocialProfileReturn {
  const { publicKey } = useWallet()
  const { addAction, addProfile } = useSocialHistoryStore()
  const { trackSocial } = useTrackEvent()

  const [status, setStatus] = useState<SocialProfileStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<SocialActionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const createProfile = useCallback(
    async (params: CreateProfileParams): Promise<SocialActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new SocialService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
        })

        const validationError = service.validate("profile", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_stealth")

        const result = await service.createProfile(params)

        setActiveRecord(result)
        addAction(result)

        // Create a StealthProfile from the result
        const profile: StealthProfile = {
          id: result.profileId,
          username: params.username,
          bio: params.bio,
          stealthAddress: result.stealthAddress ?? "",
          stealthMetaAddress: result.stealthMetaAddress ?? "",
          viewingPrivateKey: "",
          spendingPrivateKey: "",
          createdAt: Date.now(),
          postCount: 0,
          followerCount: 0,
          followingCount: 0,
        }
        addProfile(profile)

        trackSocial({
          action: "create_profile",
          username: params.username,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Profile creation failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, addProfile, trackSocial],
  )

  return { status, activeRecord, error, createProfile, reset }
}
