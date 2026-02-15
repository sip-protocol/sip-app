"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useExploreWorld } from "@/hooks/use-explore-world"
import { MetaversePrivacyToggle } from "./metaverse-privacy-toggle"
import { MetaverseStatus } from "./metaverse-status"
import { StealthAvatarDisplay } from "./stealth-avatar-display"
import { AvatarTierBadge } from "./avatar-tier-badge"
import { WORLD_CATEGORY_LABELS } from "@/lib/metaverse/constants"
import type { World, AvatarTier } from "@/lib/metaverse/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const AVATAR_TIERS: { value: AvatarTier; label: string }[] = [
  { value: "explorer", label: "Explorer" },
  { value: "warrior", label: "Warrior" },
  { value: "citizen", label: "Citizen" },
  { value: "merchant", label: "Merchant" },
  { value: "vip", label: "VIP" },
]

interface ExploreFormProps {
  world: World
  onExplored?: () => void
}

export function ExploreForm({ world, onExplored }: ExploreFormProps) {
  const { connected } = useWallet()

  const [tier, setTier] = useState<AvatarTier>(world.tier)
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    exploreWorld,
    reset: resetExplore,
  } = useExploreWorld()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const privacyLabel: Record<PrivacyOption, string> = {
    shielded: "\u{1F512} Shielded",
    compliant: "\u{1F441}\uFE0F Compliant",
    transparent: "\u{1F513} Transparent",
  }

  const isFormReady = connected && status === "idle"
  const isExploring =
    status === "selecting_world" ||
    status === "generating_stealth_avatar" ||
    status === "entering_world"
  const isEntered = status === "entered"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await exploreWorld({
        worldId: world.id,
        tier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, world.id, tier, privacyLevel, exploreWorld, privacyMap]
  )

  const handleReset = useCallback(() => {
    resetExplore()
    onExplored?.()
  }, [resetExplore, onExplored])

  // Entered state
  if (isEntered && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <MetaverseStatus currentStep="entered" mode="explore" />
        <StealthAvatarDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          worldTitle={activeRecord.worldTitle ?? ""}
          tier={activeRecord.tier ?? "explorer"}
        />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">World</span>
            <span className="text-indigo-400 font-medium">{world.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Category</span>
            <span className="text-[var(--text-primary)]">
              {WORLD_CATEGORY_LABELS[world.category]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Avatar</span>
            <AvatarTierBadge tier={tier} />
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-sip-green-500 font-medium">
              {privacyLabel[privacyLevel]}
            </span>
          </div>
          {activeRecord.commitmentHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Avatar ID</span>
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
          Back to Worlds
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{world.icon}</span>
          <h2 className="text-lg font-semibold">{world.title}</h2>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">
          {world.description}
        </p>
      </div>

      {/* World details */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-tertiary)]">Category</p>
            <p className="font-semibold">
              {WORLD_CATEGORY_LABELS[world.category]}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Default Avatar</p>
            <AvatarTierBadge tier={world.tier} />
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Visitors</p>
            <p className="font-semibold">{world.visitorCount}</p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Status</p>
            <p className="font-semibold text-indigo-400">
              {world.isActive ? "Active" : "Closed"}
            </p>
          </div>
        </div>
      </div>

      {/* Tier selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Avatar Tier
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as AvatarTier)}
          disabled={isExploring}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
        >
          {AVATAR_TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <MetaversePrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isExploring}
        />
      </div>

      {/* Status (during explore) */}
      {isExploring && (
        <div className="mb-6">
          <MetaverseStatus
            currentStep={
              status as
                | "selecting_world"
                | "generating_stealth_avatar"
                | "entering_world"
            }
            mode="explore"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <MetaverseStatus currentStep="failed" mode="explore" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-indigo-500 to-indigo-700 text-white hover:from-indigo-400 hover:to-indigo-600"
            : "bg-indigo-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet"
          : isExploring
            ? "Exploring..."
            : "Explore World"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Privacy</span>
          <span className="text-sip-green-500 font-medium">
            {privacyLabel[privacyLevel]}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">Portals</span>
        </div>
      </div>
    </form>
  )
}
