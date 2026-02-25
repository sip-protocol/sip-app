"use client"

import { useState, useCallback, useMemo } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { DemoBanner } from "@/components/ui/demo-banner"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useCreatePlaylist } from "@/hooks/use-create-playlist"
import { useOnChainCommit } from "@/hooks/use-on-chain-commit"
import { TransactionStatus } from "@/components/solana/transaction-status"
import { MusicPrivacyToggle } from "./music-privacy-toggle"
import { MusicStatus } from "./music-status"
import { StealthStreamDisplay } from "./stealth-stream-display"
import { LISTENER_TIER_COLORS, SAMPLE_STREAMS } from "@/lib/music/constants"
import type { ListenerTier } from "@/lib/music/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const LISTENER_TIERS: { value: ListenerTier; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "supporter", label: "Supporter" },
  { value: "premium", label: "Premium" },
  { value: "patron", label: "Patron" },
]

interface PlaylistFormProps {
  onCreated?: () => void
}

export function PlaylistForm({ onCreated }: PlaylistFormProps) {
  const { connected } = useWallet()
  const { isDemoMode, enableDemo } = useDemoModeStore()

  const [tier, setTier] = useState<ListenerTier>("free")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const { commit, tx } = useOnChainCommit("playlist")

  const {
    status,
    activeRecord,
    error,
    createPlaylist,
    reset: resetPlaylist,
  } = useCreatePlaylist({ onCommitTransaction: commit })

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = useMemo(
    () => ({
      shielded: PrivacyLevel.SHIELDED,
      compliant: PrivacyLevel.COMPLIANT,
      transparent: PrivacyLevel.TRANSPARENT,
    }),
    []
  )

  // Use the first stream as the reviewable item
  const reviewableStream = SAMPLE_STREAMS[0]

  const isFormReady =
    (connected || isDemoMode) &&
    (status === "idle" || status === "error") &&
    reviewableStream
  const isCreating =
    status === "generating_proof" || status === "encrypting_playlist"
  const isCreated = status === "created"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || !reviewableStream) return

      await createPlaylist({
        trackId: reviewableStream.trackId,
        tier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [
      isFormReady,
      reviewableStream,
      tier,
      privacyLevel,
      createPlaylist,
      privacyMap,
    ]
  )

  const handleReset = useCallback(() => {
    resetPlaylist()
    setTier("free")
    onCreated?.()
  }, [resetPlaylist, onCreated])

  // Created state
  if (isCreated && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <MusicStatus currentStep="created" mode="playlist" />
        <StealthStreamDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          trackTitle={activeRecord.trackTitle ?? ""}
          tier={activeRecord.tier ?? "free"}
        />

        <TransactionStatus
          status={tx.status}
          txSignature={tx.txSignature}
          explorerUrl={tx.explorerUrl}
          error={tx.error}
        />

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Create Another Playlist
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
        <h2 className="text-lg font-semibold mb-1">Encrypted Playlist</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Create encrypted playlists via stealth identity — playlist contents
          remain private and only you control access
        </p>
      </div>

      {/* Reviewable stream */}
      {reviewableStream ? (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sip-green-400">
                Track Available
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Track:{" "}
                {reviewableStream.trackId
                  .replace("track-", "")
                  .replace(/-/g, " ")}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                LISTENER_TIER_COLORS[reviewableStream.tier].bg,
                LISTENER_TIER_COLORS[reviewableStream.tier].color
              )}
            >
              {LISTENER_TIER_COLORS[reviewableStream.tier].label}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No tracks to playlist. Stream a track first!
          </p>
        </div>
      )}

      {/* Tier selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Listener Tier
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as ListenerTier)}
          disabled={isCreating}
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
          disabled={isCreating}
        />
      </div>

      {/* Status (during playlist creation) */}
      {isCreating && (
        <div className="mb-6">
          <MusicStatus
            currentStep={status as "generating_proof" | "encrypting_playlist"}
            mode="playlist"
          />
        </div>
      )}

      {/* Error state */}
      {(status === "failed" || status === "error") && (
        <div className="mb-6">
          <MusicStatus currentStep="failed" mode="playlist" error={error} />
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
          : isCreating
            ? "Creating..."
            : "Create Playlist"}
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
            Encrypted Playlist
          </span>
          <span className="text-pink-400 font-medium">Encrypted Playlist</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">Audius</span>
        </div>
      </div>
    </form>
  )
}
