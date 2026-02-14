"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { DropCard } from "./drop-card"
import { SAMPLE_DROPS, SAMPLE_SUBSCRIPTIONS } from "@/lib/channel/constants"
import type { Drop, AccessTier } from "@/lib/channel/types"

type DropFilter = "all" | AccessTier

const FILTER_TABS: { value: DropFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "subscriber", label: "Subscriber" },
  { value: "premium", label: "Premium" },
]

interface DropListProps {
  onSubscribe?: (drop: Drop) => void
}

export function DropList({ onSubscribe }: DropListProps) {
  const [filter, setFilter] = useState<DropFilter>("all")

  const drops =
    filter === "all"
      ? SAMPLE_DROPS
      : SAMPLE_DROPS.filter((d) => d.accessTier === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === tab.value
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drop grid */}
      {drops.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">{"\u{1F4E1}"}</p>
          <h3 className="text-lg font-semibold mb-2">No drops found</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === "all"
              ? "No drops available yet. Check back soon for new privacy content."
              : `No ${filter} drops. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drops.map((drop) => {
            const isSubscribed = SAMPLE_SUBSCRIPTIONS.some(
              (s) => s.dropId === drop.id
            )
            return (
              <DropCard
                key={drop.id}
                drop={drop}
                isSubscribed={isSubscribed}
                onSubscribe={onSubscribe}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
