"use client"

import { cn } from "@/lib/utils"
import { AvatarTierBadge } from "./avatar-tier-badge"
import { WORLD_CATEGORY_LABELS } from "@/lib/metaverse/constants"
import type { World } from "@/lib/metaverse/types"

interface WorldCardProps {
  world: World
  onExplore?: (world: World) => void
  className?: string
}

export function WorldCard({ world, onExplore, className }: WorldCardProps) {
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
          <span className="text-2xl">{world.icon}</span>
          <div>
            <h3 className="font-semibold text-sm">{world.title}</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {world.visitorCount} visitors
            </p>
          </div>
        </div>
        <AvatarTierBadge tier={world.tier} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
        {world.description}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-tertiary)]">
          {WORLD_CATEGORY_LABELS[world.category]}
        </span>

        <button
          type="button"
          onClick={() => onExplore?.(world)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            "bg-gradient-to-r from-indigo-500 to-indigo-700 text-white hover:from-indigo-400 hover:to-indigo-600"
          )}
        >
          Explore
        </button>
      </div>
    </div>
  )
}
