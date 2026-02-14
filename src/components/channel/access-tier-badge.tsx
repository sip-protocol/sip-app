"use client"

import { cn } from "@/lib/utils"
import { TIER_COLORS } from "@/lib/channel/constants"
import type { AccessTier } from "@/lib/channel/types"

interface AccessTierBadgeProps {
  tier: AccessTier
  className?: string
}

export function AccessTierBadge({ tier, className }: AccessTierBadgeProps) {
  const config = TIER_COLORS[tier]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
