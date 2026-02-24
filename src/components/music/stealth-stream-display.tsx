"use client"

import { useState } from "react"
import { MusicNote, Copy, Check, LockSimple } from "@phosphor-icons/react"
import { cn, truncate, copyToClipboard } from "@/lib/utils"
import { LISTENER_TIER_COLORS } from "@/lib/music/constants"
import type { ListenerTier } from "@/lib/music/types"

interface StealthStreamDisplayProps {
  stealthAddress: string
  metaAddress: string
  trackTitle: string
  tier: ListenerTier
  className?: string
}

export function StealthStreamDisplay({
  stealthAddress,
  metaAddress,
  trackTitle,
  tier,
  className,
}: StealthStreamDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const tierConfig = LISTENER_TIER_COLORS[tier]

  return (
    <div
      className={cn(
        "rounded-xl border border-pink-800/50 bg-pink-900/10 p-4",
        className
      )}
    >
      {/* Stream callout */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-pink-400">
          <MusicNote size={18} weight="duotone" />
        </span>
        <div>
          <p className="text-sm font-medium text-pink-300">
            Stream sent to stealth address
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Listening unlinkable to your wallet — anonymous streaming by default
          </p>
        </div>
      </div>

      {/* Track details */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
        <div>
          <span className="text-sm text-[var(--text-secondary)]">
            {trackTitle}
          </span>
          <p className="text-xs mt-0.5">
            <span className={cn("font-medium", tierConfig.color)}>
              {tierConfig.label} Stream
            </span>
          </p>
        </div>
      </div>

      {/* Address details */}
      <div className="space-y-2">
        {/* Stealth address */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Stealth Address
          </span>
          <button
            type="button"
            onClick={() => handleCopy(stealthAddress, "stealth")}
            className="flex items-center gap-1.5 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(stealthAddress, 12, 6)}
            </code>
            <span className="text-[var(--text-tertiary)]">
              {copied === "stealth" ? (
                <Check size={14} weight="bold" />
              ) : (
                <Copy size={14} weight="duotone" />
              )}
            </span>
          </button>
        </div>

        {/* Meta address */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Meta-Address
          </span>
          <button
            type="button"
            onClick={() => handleCopy(metaAddress, "meta")}
            className="flex items-center gap-1.5 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(metaAddress, 12, 6)}
            </code>
            <span className="text-[var(--text-tertiary)]">
              {copied === "meta" ? (
                <Check size={14} weight="bold" />
              ) : (
                <Copy size={14} weight="duotone" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Privacy badge */}
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-500/20 border border-pink-500/30 text-pink-300">
          <LockSimple size={14} weight="duotone" /> Stealth Stream
        </span>
      </div>
    </div>
  )
}
