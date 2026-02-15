"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { WorldCard } from "./world-card"
import { SAMPLE_WORLDS } from "@/lib/metaverse/constants"
import type { World, WorldCategory } from "@/lib/metaverse/types"

type WorldFilter = "all" | WorldCategory

const FILTER_TABS: { value: WorldFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "gallery", label: "Gallery" },
  { value: "game_room", label: "Game Room" },
  { value: "social", label: "Social" },
  { value: "marketplace", label: "Marketplace" },
  { value: "concert_hall", label: "Concert Hall" },
]

interface WorldListProps {
  onExplore?: (world: World) => void
}

export function WorldList({ onExplore }: WorldListProps) {
  const [filter, setFilter] = useState<WorldFilter>("all")

  const worlds =
    filter === "all"
      ? SAMPLE_WORLDS
      : SAMPLE_WORLDS.filter((w) => w.category === filter)

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
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* World grid */}
      {worlds.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">{"\u{1F30D}"}</p>
          <h3 className="text-lg font-semibold mb-2">No worlds found</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === "all"
              ? "No worlds available yet. Check back soon for new metaverse worlds."
              : `No ${filter.replace("_", " ")} worlds. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {worlds.map((world) => (
            <WorldCard key={world.id} world={world} onExplore={onExplore} />
          ))}
        </div>
      )}
    </div>
  )
}
