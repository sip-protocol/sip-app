"use client"

import { useCallback } from "react"
import type { PrivacyActionType } from "@/hooks/usePrivacyAction"

export interface TrackEventPayload {
  action: PrivacyActionType
  label?: string
  metadata?: Record<string, string | number | boolean>
  timestamp?: number
}

interface UseTrackEventReturn {
  track: (payload: TrackEventPayload) => void
  trackBridge: (metadata?: Record<string, string | number | boolean>) => void
  trackVote: (metadata?: Record<string, string | number | boolean>) => void
  trackSocial: (metadata?: Record<string, string | number | boolean>) => void
  trackLoyalty: (metadata?: Record<string, string | number | boolean>) => void
  trackArt: (metadata?: Record<string, string | number | boolean>) => void
  trackChannel: (metadata?: Record<string, string | number | boolean>) => void
  trackMigration: (metadata?: Record<string, string | number | boolean>) => void
  trackGaming: (metadata?: Record<string, string | number | boolean>) => void
  trackTicketing: (metadata?: Record<string, string | number | boolean>) => void
  trackMetaverse: (metadata?: Record<string, string | number | boolean>) => void
  trackDeSci: (metadata?: Record<string, string | number | boolean>) => void
}

/**
 * Privacy-preserving event tracking.
 * Events are stored locally — never sent to external analytics.
 * Used for privacy score calculation and loyalty campaign verification.
 */
export function useTrackEvent(): UseTrackEventReturn {
  const track = useCallback((payload: TrackEventPayload) => {
    const event: TrackEventPayload = {
      ...payload,
      timestamp: payload.timestamp ?? Date.now(),
    }

    // Store in localStorage for privacy score and loyalty tracking
    try {
      const key = "sip:privacy-events"
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]")
      existing.push(event)

      // Keep last 1000 events
      if (existing.length > 1000) {
        existing.splice(0, existing.length - 1000)
      }

      localStorage.setItem(key, JSON.stringify(existing))
    } catch {
      // Silently fail — localStorage may be unavailable
    }
  }, [])

  const trackBridge = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({ action: "bridge", label: "Cross-chain bridge", metadata })
    },
    [track]
  )

  const trackVote = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({ action: "vote", label: "Private vote", metadata })
    },
    [track]
  )

  const trackSocial = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({ action: "social_post", label: "Social action", metadata })
    },
    [track]
  )

  const trackLoyalty = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({ action: "loyalty_claim", label: "Loyalty claim", metadata })
    },
    [track]
  )

  const trackArt = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({ action: "art_mint", label: "Art mint", metadata })
    },
    [track]
  )

  const trackChannel = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({ action: "channel_subscribe", label: "Channel action", metadata })
    },
    [track]
  )

  const trackMigration = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({ action: "migration", label: "Green migration", metadata })
    },
    [track]
  )

  const trackGaming = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({ action: "game_play", label: "Gaming action", metadata })
    },
    [track]
  )

  const trackTicketing = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({
        action: "ticket_purchase",
        label: "Ticketing action",
        metadata,
      })
    },
    [track]
  )

  const trackMetaverse = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({
        action: "world_explore",
        label: "Metaverse action",
        metadata,
      })
    },
    [track]
  )

  const trackDeSci = useCallback(
    (metadata?: Record<string, string | number | boolean>) => {
      track({
        action: "project_fund",
        label: "DeSci action",
        metadata,
      })
    },
    [track]
  )

  return {
    track,
    trackBridge,
    trackVote,
    trackSocial,
    trackLoyalty,
    trackArt,
    trackChannel,
    trackMigration,
    trackGaming,
    trackTicketing,
    trackMetaverse,
    trackDeSci,
  }
}
