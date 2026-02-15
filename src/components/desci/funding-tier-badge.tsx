"use client"

import { cn } from "@/lib/utils"
import { FUNDING_TIER_COLORS } from "@/lib/desci/constants"
import type { FundingTier } from "@/lib/desci/types"

interface FundingTierBadgeProps {
  tier: FundingTier
  className?: string
}

export function FundingTierBadge({ tier, className }: FundingTierBadgeProps) {
  const config = FUNDING_TIER_COLORS[tier]

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
