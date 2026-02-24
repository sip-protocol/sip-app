"use client"

import type { ReactNode } from "react"
import { useState, useCallback, useMemo } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { LockSimple, Eye, LockSimpleOpen } from "@phosphor-icons/react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { DemoBanner } from "@/components/ui/demo-banner"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useStreamTrack } from "@/hooks/use-stream-track"
import { GENRE_ICON_MAP } from "./track-icon-map"
import { MusicPrivacyToggle } from "./music-privacy-toggle"
import { MusicStatus } from "./music-status"
import { StealthStreamDisplay } from "./stealth-stream-display"
import { ListenerTierBadge } from "./listener-tier-badge"
import { MUSIC_GENRE_LABELS } from "@/lib/music/constants"
import type { Track, ListenerTier } from "@/lib/music/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const LISTENER_TIERS: { value: ListenerTier; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "supporter", label: "Supporter" },
  { value: "premium", label: "Premium" },
  { value: "patron", label: "Patron" },
]

interface StreamFormProps {
  track: Track
  onStreamed?: () => void
}

export function StreamForm({ track, onStreamed }: StreamFormProps) {
  const { connected } = useWallet()
  const { isDemoMode, enableDemo } = useDemoModeStore()

  const [tier, setTier] = useState<ListenerTier>(track.tier)
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    streamTrack,
    reset: resetStream,
  } = useStreamTrack()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = useMemo(
    () => ({
      shielded: PrivacyLevel.SHIELDED,
      compliant: PrivacyLevel.COMPLIANT,
      transparent: PrivacyLevel.TRANSPARENT,
    }),
    []
  )

  const privacyLabel: Record<PrivacyOption, ReactNode> = {
    shielded: (
      <span className="inline-flex items-center gap-1">
        <LockSimple size={14} weight="duotone" /> Shielded
      </span>
    ),
    compliant: (
      <span className="inline-flex items-center gap-1">
        <Eye size={14} weight="duotone" /> Compliant
      </span>
    ),
    transparent: (
      <span className="inline-flex items-center gap-1">
        <LockSimpleOpen size={14} weight="duotone" /> Transparent
      </span>
    ),
  }

  const isFormReady = (connected || isDemoMode) && status === "idle"
  const isStreaming =
    status === "selecting_track" ||
    status === "generating_stealth_listener" ||
    status === "streaming"
  const isStreamed = status === "streamed"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await streamTrack({
        trackId: track.id,
        tier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, track.id, tier, privacyLevel, streamTrack, privacyMap]
  )

  const handleReset = useCallback(() => {
    resetStream()
    onStreamed?.()
  }, [resetStream, onStreamed])

  // Streamed state
  if (isStreamed && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <MusicStatus currentStep="streamed" mode="stream" />
        <StealthStreamDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          trackTitle={activeRecord.trackTitle ?? ""}
          tier={activeRecord.tier ?? "free"}
        />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Track</span>
            <span className="text-pink-400 font-medium">{track.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Genre</span>
            <span className="text-[var(--text-primary)]">
              {MUSIC_GENRE_LABELS[track.genre]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Tier</span>
            <ListenerTierBadge tier={tier} />
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-sip-green-500 font-medium">
              {privacyLabel[privacyLevel]}
            </span>
          </div>
          {activeRecord.commitmentHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Stream ID</span>
              <code className="text-xs font-mono text-[var(--text-tertiary)]">
                {activeRecord.commitmentHash}
              </code>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Back to Tracks
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {isDemoMode && <DemoBanner />}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-pink-400">{GENRE_ICON_MAP[track.genre]}</span>
          <h2 className="text-lg font-semibold">{track.title}</h2>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">
          {track.description}
        </p>
      </div>

      {/* Track details */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-tertiary)]">Genre</p>
            <p className="font-semibold">{MUSIC_GENRE_LABELS[track.genre]}</p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Default Tier</p>
            <ListenerTierBadge tier={track.tier} />
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Listeners</p>
            <p className="font-semibold">{track.listenerCount}</p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Status</p>
            <p className="font-semibold text-pink-400">
              {track.isActive ? "Active" : "Closed"}
            </p>
          </div>
        </div>
      </div>

      {/* Tier selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Listener Tier
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as ListenerTier)}
          disabled={isStreaming}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-pink-500 transition-colors"
        >
          {LISTENER_TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <MusicPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isStreaming}
        />
      </div>

      {/* Status (during stream) */}
      {isStreaming && (
        <div className="mb-6">
          <MusicStatus
            currentStep={
              status as
                | "selecting_track"
                | "generating_stealth_listener"
                | "streaming"
            }
            mode="stream"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <MusicStatus currentStep="failed" mode="stream" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-pink-500 to-pink-700 text-white hover:from-pink-400 hover:to-pink-600"
            : "bg-pink-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected && !isDemoMode
          ? "Connect Wallet"
          : isStreaming
            ? "Streaming..."
            : "Stream Track"}
      </button>

      {!connected && !isDemoMode && (
        <button
          type="button"
          onClick={enableDemo}
          className="w-full mt-3 py-3 px-6 text-sm font-medium rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          Try Demo
        </button>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">
            Stealth Listener Identity
          </span>
          <span className="text-sip-green-500 font-medium">
            {privacyLabel[privacyLevel]}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">Audius</span>
        </div>
      </div>
    </form>
  )
}
