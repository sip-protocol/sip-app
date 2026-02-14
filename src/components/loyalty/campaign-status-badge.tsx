"use client"

import { cn } from "@/lib/utils"
import type { CampaignStatus } from "@/lib/loyalty/types"

interface CampaignStatusBadgeProps {
  status: CampaignStatus
  className?: string
}

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; color: string; bg: string }
> = {
  active: {
    label: "Active",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  completed: {
    label: "Completed",
    color: "text-sip-green-300",
    bg: "bg-sip-green-500/20 border-sip-green-500/30",
  },
  expired: {
    label: "Expired",
    color: "text-gray-400",
    bg: "bg-gray-500/20 border-gray-500/30",
  },
}

export function CampaignStatusBadge({
  status,
  className,
}: CampaignStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

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
