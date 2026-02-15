"use client"

import { cn } from "@/lib/utils"
import { DifficultyBadge } from "./difficulty-badge"
import { GAME_TYPE_LABELS } from "@/lib/gaming/constants"
import type { Game } from "@/lib/gaming/types"

interface GameCardProps {
  game: Game
  onPlay?: (game: Game) => void
  className?: string
}

export function GameCard({
  game,
  onPlay,
  className,
}: GameCardProps) {
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
          <span className="text-2xl">{game.icon}</span>
          <div>
            <h3 className="font-semibold text-sm">{game.title}</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {game.playerCount} players
            </p>
          </div>
        </div>
        <DifficultyBadge difficulty={game.difficulty} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
        {game.description}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-tertiary)]">
          {GAME_TYPE_LABELS[game.gameType]}
        </span>

        <button
          type="button"
          onClick={() => onPlay?.(game)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            "bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-400 hover:to-orange-600"
          )}
        >
          Play
        </button>
      </div>
    </div>
  )
}
