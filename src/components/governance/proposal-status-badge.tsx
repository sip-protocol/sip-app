"use client"

import { cn } from "@/lib/utils"
import type { ProposalStatus } from "@/lib/governance/types"

interface ProposalStatusBadgeProps {
  status: ProposalStatus
  className?: string
}

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; color: string; bg: string }
> = {
  voting: {
    label: "Voting",
    color: "text-blue-300",
    bg: "bg-blue-500/20 border-blue-500/30",
  },
  reveal: {
    label: "Reveal",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  completed: {
    label: "Completed",
    color: "text-sip-green-300",
    bg: "bg-sip-green-500/20 border-sip-green-500/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-gray-400",
    bg: "bg-gray-500/20 border-gray-500/30",
  },
}

export function ProposalStatusBadge({
  status,
  className,
}: ProposalStatusBadgeProps) {
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
