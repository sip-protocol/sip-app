"use client"

import { useState, useCallback, useMemo, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import {
  LockSimpleIcon,
  EyeIcon,
  LockSimpleOpenIcon,
} from "@phosphor-icons/react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { DemoBanner } from "@/components/ui/demo-banner"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useChannelSubscribe } from "@/hooks/use-channel-subscribe"
import { ChannelPrivacyToggle } from "./channel-privacy-toggle"
import { ChannelStatus } from "./channel-status"
import { AccessTierBadge } from "./access-tier-badge"
import { CONTENT_TYPE_LABELS } from "@/lib/channel/constants"
import { resolveDropIcon } from "./drop-icon-map"
import type { Drop } from "@/lib/channel/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface SubscribeFormProps {
  drop: Drop
  onSubscribed?: () => void
}

export function SubscribeForm({ drop, onSubscribed }: SubscribeFormProps) {
  const { connected } = useWallet()
  const { isDemoMode, enableDemo } = useDemoModeStore()

  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    error,
    subscribe,
    reset: resetSubscribe,
  } = useChannelSubscribe()

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
        <LockSimpleIcon size={14} weight="duotone" /> Shielded
      </span>
    ),
    compliant: (
      <span className="inline-flex items-center gap-1">
        <EyeIcon size={14} weight="duotone" /> Compliant
      </span>
    ),
    transparent: (
      <span className="inline-flex items-center gap-1">
        <LockSimpleOpenIcon size={14} weight="duotone" /> Transparent
      </span>
    ),
  }

  const isFormReady = (connected || isDemoMode) && status === "idle"
  const isSubscribing =
    status === "selecting_channel" || status === "subscribing"
  const isSubscribed = status === "subscribed"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await subscribe({
        dropId: drop.id,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, drop.id, privacyLevel, subscribe, privacyMap]
  )

  const handleReset = useCallback(() => {
    resetSubscribe()
    onSubscribed?.()
  }, [resetSubscribe, onSubscribed])

  // Subscribed state
  if (isSubscribed) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <ChannelStatus currentStep="subscribed" mode="subscribe" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Drop</span>
            <span className="text-purple-400 font-medium">{drop.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Type</span>
            <span className="text-[var(--text-primary)]">
              {CONTENT_TYPE_LABELS[drop.contentType]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Tier</span>
            <AccessTierBadge tier={drop.accessTier} />
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-sip-green-500 font-medium">
              {privacyLabel[privacyLevel]}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Back to Drops
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
          <span className="text-purple-400">{resolveDropIcon(drop.icon)}</span>
          <h2 className="text-lg font-semibold">{drop.title}</h2>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">
          {drop.description}
        </p>
      </div>

      {/* Drop details */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-tertiary)]">Content Type</p>
            <p className="font-semibold">
              {CONTENT_TYPE_LABELS[drop.contentType]}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Access Tier</p>
            <AccessTierBadge tier={drop.accessTier} />
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Subscribers</p>
            <p className="font-semibold">{drop.subscriberCount}</p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Encrypted</p>
            <p className="font-semibold text-purple-400">
              {drop.isEncrypted ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <ChannelPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isSubscribing}
        />
      </div>

      {/* Status (during subscribe) */}
      {isSubscribing && (
        <div className="mb-6">
          <ChannelStatus
            currentStep={status as "selecting_channel" | "subscribing"}
            mode="subscribe"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <ChannelStatus currentStep="failed" mode="subscribe" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-400 hover:to-purple-600"
            : "bg-purple-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected && !isDemoMode
          ? "Connect Wallet"
          : isSubscribing
            ? "Subscribing..."
            : drop.accessTier === "free"
              ? "Read Drop"
              : "Subscribe"}
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
          <span className="text-[var(--text-secondary)]">Privacy</span>
          <span className="text-sip-green-500 font-medium">
            {privacyLabel[privacyLevel]}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">DRiP Protocol</span>
        </div>
      </div>
    </form>
  )
}
