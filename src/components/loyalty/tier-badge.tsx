"use client"

import { cn } from "@/lib/utils"
import type { LoyaltyTier } from "@/lib/loyalty/types"
import { TIER_CONFIG } from "@/lib/loyalty/constants"

interface TierBadgeProps {
  tier: LoyaltyTier
  completedCount: number
  size?: "sm" | "md"
  className?: string
}

export function TierBadge({
  tier,
  completedCount,
  size = "md",
  className,
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30",
          size === "sm" ? "w-7 h-7 text-sm" : "w-9 h-9 text-lg",
        )}
      >
        {config.icon}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "font-medium truncate",
            config.color,
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {config.label}
        </p>
        <p
          className={cn(
            "text-[var(--text-tertiary)] truncate",
            size === "sm" ? "text-[10px]" : "text-xs",
          )}
        >
          {completedCount} campaign{completedCount !== 1 ? "s" : ""} completed
        </p>
      </div>
    </div>
  )
}
