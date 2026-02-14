"use client"

import { cn } from "@/lib/utils"
import { AccessTierBadge } from "./access-tier-badge"
import { CONTENT_TYPE_LABELS } from "@/lib/channel/constants"
import type { Drop } from "@/lib/channel/types"

interface DropCardProps {
  drop: Drop
  isSubscribed?: boolean
  onSubscribe?: (drop: Drop) => void
  className?: string
}

export function DropCard({
  drop,
  isSubscribed,
  onSubscribe,
  className,
}: DropCardProps) {
  const isLocked = drop.isEncrypted && !isSubscribed

  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5",
        "hover:border-[var(--border-hover)] hover:shadow-md transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{drop.icon}</span>
          <div>
            <h3 className="font-semibold text-sm">{drop.title}</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {drop.subscriberCount} subscribers
            </p>
          </div>
        </div>
        <AccessTierBadge tier={drop.accessTier} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
        {drop.description}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-tertiary)]">
            {CONTENT_TYPE_LABELS[drop.contentType]}
          </span>
          {drop.isEncrypted && (
            <span className="text-xs text-purple-400">
              {isLocked ? "\u{1F512}" : "\u{1F513}"}
            </span>
          )}
        </div>

        {isSubscribed ? (
          <span className="text-xs text-purple-400 font-medium">
            Subscribed
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSubscribe?.(drop)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-400 hover:to-purple-600"
            )}
          >
            {drop.accessTier === "free" ? "Read" : "Subscribe"}
          </button>
        )}
      </div>
    </div>
  )
}
