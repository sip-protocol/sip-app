"use client"

import { cn } from "@/lib/utils"
import { AVATAR_TIER_COLORS } from "@/lib/metaverse/constants"
import type { AvatarTier } from "@/lib/metaverse/types"

interface AvatarTierBadgeProps {
  tier: AvatarTier
  className?: string
}

export function AvatarTierBadge({ tier, className }: AvatarTierBadgeProps) {
  const config = AVATAR_TIER_COLORS[tier]

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
