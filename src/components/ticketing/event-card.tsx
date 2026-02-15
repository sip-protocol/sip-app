"use client"

import { cn } from "@/lib/utils"
import { TierBadge } from "./tier-badge"
import { EVENT_CATEGORY_LABELS } from "@/lib/ticketing/constants"
import type { Event } from "@/lib/ticketing/types"

interface EventCardProps {
  event: Event
  onPurchase?: (event: Event) => void
  className?: string
}

export function EventCard({ event, onPurchase, className }: EventCardProps) {
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
          <span className="text-2xl">{event.icon}</span>
          <div>
            <h3 className="font-semibold text-sm">{event.title}</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {event.attendeeCount} attendees
            </p>
          </div>
        </div>
        <TierBadge tier={event.tier} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
        {event.description}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-tertiary)]">
          {EVENT_CATEGORY_LABELS[event.category]}
        </span>

        <button
          type="button"
          onClick={() => onPurchase?.(event)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            "bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-400 hover:to-teal-600"
          )}
        >
          Purchase
        </button>
      </div>
    </div>
  )
}
