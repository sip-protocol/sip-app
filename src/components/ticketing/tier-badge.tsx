"use client"

import { cn } from "@/lib/utils"
import { TIER_COLORS } from "@/lib/ticketing/constants"
import type { TicketTier } from "@/lib/ticketing/types"

interface TierBadgeProps {
  tier: TicketTier
  className?: string
}

export function TierBadge({ tier, className }: TierBadgeProps) {
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
