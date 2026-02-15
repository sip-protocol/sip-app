"use client"

import { useState } from "react"
import { cn, truncate, copyToClipboard } from "@/lib/utils"
import { REWARD_TIER_COLORS } from "@/lib/gaming/constants"
import type { RewardTier } from "@/lib/gaming/types"

interface StealthRewardDisplayProps {
  stealthAddress: string
  metaAddress: string
  gameTitle: string
  rewardTier: RewardTier
  className?: string
}

export function StealthRewardDisplay({
  stealthAddress,
  metaAddress,
  gameTitle,
  rewardTier,
  className,
}: StealthRewardDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const tierConfig = REWARD_TIER_COLORS[rewardTier]

  return (
    <div
      className={cn(
        "rounded-xl border border-orange-800/50 bg-orange-900/10 p-4",
        className
      )}
    >
      {/* Reward callout */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{"\u{1F3C6}"}</span>
        <div>
          <p className="text-sm font-medium text-orange-300">
            Reward claimed to stealth address
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Reward unlinkable to your wallet — private by default
          </p>
        </div>
      </div>

      {/* Reward details */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
        <div>
          <span className="text-sm text-[var(--text-secondary)]">{gameTitle}</span>
          <p className="text-xs mt-0.5">
            <span className={cn("font-medium", tierConfig.color)}>
              {tierConfig.label} Reward
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
            <span className="text-xs text-[var(--text-tertiary)]">
              {copied === "stealth" ? "\u2713" : "\u{1F4CB}"}
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
            <span className="text-xs text-[var(--text-tertiary)]">
              {copied === "meta" ? "\u2713" : "\u{1F4CB}"}
            </span>
          </button>
        </div>
      </div>

      {/* Privacy badge */}
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/20 border border-orange-500/30 text-orange-300">
          {"\u{1F512}"} Private Reward
        </span>
      </div>
    </div>
  )
}
