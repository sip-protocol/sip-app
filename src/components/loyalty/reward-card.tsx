"use client"

import { cn, truncate } from "@/lib/utils"
import type { LoyaltyReward } from "@/lib/loyalty/types"

interface RewardCardProps {
  reward: LoyaltyReward
  onClaim?: (reward: LoyaltyReward) => void
  className?: string
}

export function RewardCard({ reward, onClaim, className }: RewardCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5",
        "hover:border-[var(--border-hover)] hover:shadow-md transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">{reward.campaignName}</h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            Campaign reward
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
            reward.isClaimed
              ? "bg-sip-green-500/20 border-sip-green-500/30 text-sip-green-300"
              : "bg-amber-500/20 border-amber-500/30 text-amber-300",
          )}
        >
          {reward.isClaimed ? "Claimed" : "Unclaimed"}
        </span>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-amber-400">
          {reward.amount} {reward.token}
        </p>
      </div>

      {/* Stealth address (if claimed) */}
      {reward.isClaimed && reward.stealthAddress && (
        <div className="mb-4 p-3 rounded-lg bg-amber-900/10 border border-amber-800/30">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Delivered to</p>
          <code className="text-xs font-mono text-amber-300">
            {truncate(reward.stealthAddress, 16, 8)}
          </code>
        </div>
      )}

      {/* Action */}
      {!reward.isClaimed && (
        <button
          type="button"
          onClick={() => onClaim?.(reward)}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-amber-500 to-amber-700 text-white hover:from-amber-400 hover:to-amber-600 transition-colors"
        >
          Claim to Stealth Address
        </button>
      )}
    </div>
  )
}
