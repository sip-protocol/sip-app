"use client"

import { cn } from "@/lib/utils"
import { LISTENER_TIER_COLORS } from "@/lib/music/constants"
import type { ListenerTier } from "@/lib/music/types"

interface ListenerTierBadgeProps {
  tier: ListenerTier
  className?: string
}

export function ListenerTierBadge({ tier, className }: ListenerTierBadgeProps) {
  const config = LISTENER_TIER_COLORS[tier]

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
