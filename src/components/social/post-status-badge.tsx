"use client"

import { cn } from "@/lib/utils"
import type { PostStatus } from "@/lib/social/types"

interface PostStatusBadgeProps {
  status: PostStatus
  className?: string
}

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; color: string; bg: string }
> = {
  published: {
    label: "Published",
    color: "text-sip-green-300",
    bg: "bg-sip-green-500/20 border-sip-green-500/30",
  },
  encrypted: {
    label: "Encrypted",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  draft: {
    label: "Draft",
    color: "text-gray-400",
    bg: "bg-gray-500/20 border-gray-500/30",
  },
  deleted: {
    label: "Deleted",
    color: "text-red-400",
    bg: "bg-red-500/20 border-red-500/30",
  },
}

export function PostStatusBadge({ status, className }: PostStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
