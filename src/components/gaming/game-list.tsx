"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { GameCard } from "./game-card"
import { SAMPLE_GAMES } from "@/lib/gaming/constants"
import type { Game, GameType } from "@/lib/gaming/types"

type GameFilter = "all" | GameType

const FILTER_TABS: { value: GameFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "commit_reveal", label: "Commit-Reveal" },
  { value: "sealed_bid", label: "Sealed Bid" },
  { value: "fog_of_war", label: "Fog of War" },
  { value: "tournament", label: "Tournament" },
]

interface GameListProps {
  onPlay?: (game: Game) => void
}

export function GameList({ onPlay }: GameListProps) {
  const [filter, setFilter] = useState<GameFilter>("all")

  const games =
    filter === "all"
      ? SAMPLE_GAMES
      : SAMPLE_GAMES.filter((g) => g.gameType === filter)

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
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Game grid */}
      {games.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">{"\u{1F3AE}"}</p>
          <h3 className="text-lg font-semibold mb-2">No games found</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === "all"
              ? "No games available yet. Check back soon for new privacy games."
              : `No ${filter.replace("_", " ")} games. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlay} />
          ))}
        </div>
      )}
    </div>
  )
}
