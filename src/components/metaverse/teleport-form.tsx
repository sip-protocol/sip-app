"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useTeleport } from "@/hooks/use-teleport"
import { MetaversePrivacyToggle } from "./metaverse-privacy-toggle"
import { MetaverseStatus } from "./metaverse-status"
import { StealthAvatarDisplay } from "./stealth-avatar-display"
import { SAMPLE_WORLDS, AVATAR_TIER_COLORS } from "@/lib/metaverse/constants"
import type { AvatarTier } from "@/lib/metaverse/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const AVATAR_TIERS: { value: AvatarTier; label: string }[] = [
  { value: "explorer", label: "Explorer" },
  { value: "warrior", label: "Warrior" },
  { value: "citizen", label: "Citizen" },
  { value: "merchant", label: "Merchant" },
  { value: "vip", label: "VIP" },
]

interface TeleportFormProps {
  onTeleported?: () => void
}

export function TeleportForm({ onTeleported }: TeleportFormProps) {
  const { connected } = useWallet()

  const [tier, setTier] = useState<AvatarTier>("explorer")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    teleport,
    reset: resetTeleport,
  } = useTeleport()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  // Use the first world as the teleport destination
  const destination = SAMPLE_WORLDS[0]

  const isFormReady = connected && status === "idle" && destination
  const isTeleporting =
    status === "generating_proof" || status === "teleporting"
  const isArrived = status === "arrived"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || !destination) return

      await teleport({
        worldId: destination.id,
        tier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, destination, tier, privacyLevel, teleport, privacyMap]
  )

  const handleReset = useCallback(() => {
    resetTeleport()
    setTier("explorer")
    onTeleported?.()
  }, [resetTeleport, onTeleported])

  // Arrived state
  if (isArrived && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <MetaverseStatus currentStep="arrived" mode="teleport" />
        <StealthAvatarDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          worldTitle={activeRecord.worldTitle ?? ""}
          tier={activeRecord.tier ?? "explorer"}
        />

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Teleport Again
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
        <h2 className="text-lg font-semibold mb-1">Private Teleport</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Teleport between worlds privately. Stealth identity proofs ensure your
          destination and origin remain unlinkable.
        </p>
      </div>

      {/* Destination */}
      {destination ? (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sip-green-400">
                Destination Available
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                World: {destination.title}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                AVATAR_TIER_COLORS[destination.tier].bg,
                AVATAR_TIER_COLORS[destination.tier].color
              )}
            >
              {AVATAR_TIER_COLORS[destination.tier].label}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No destinations available. Explore a world first!
          </p>
        </div>
      )}

      {/* Tier selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Avatar Tier
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as AvatarTier)}
          disabled={isTeleporting}
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
          disabled={isTeleporting}
        />
      </div>

      {/* Status (during teleport) */}
      {isTeleporting && (
        <div className="mb-6">
          <MetaverseStatus
            currentStep={status as "generating_proof" | "teleporting"}
            mode="teleport"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <MetaverseStatus currentStep="failed" mode="teleport" error={error} />
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
          : isTeleporting
            ? "Teleporting..."
            : "Teleport"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Teleport</span>
          <span className="text-indigo-400 font-medium">
            Stealth Identity Proof
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
