"use client"

import { useState, useCallback } from "react"
import { GamingStats } from "@/components/gaming/gaming-stats"
import { GameList } from "@/components/gaming/game-list"
import { PlayForm } from "@/components/gaming/play-form"
import type { Game } from "@/lib/gaming/types"

type View = "arena" | "play"

export function GamingPageClient() {
  const [view, setView] = useState<View>("arena")
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const handlePlay = useCallback((game: Game) => {
    setSelectedGame(game)
    setView("play")
  }, [])

  const handleBack = useCallback(() => {
    setView("arena")
    setSelectedGame(null)
  }, [])

  // Play view
  if (view === "play" && selectedGame) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to arena
        </button>
        <PlayForm game={selectedGame} onResolved={handleBack} />
      </div>
    )
  }

  // Arena view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Arena</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Hidden moves, sealed bids, private rewards — game theory powered by
          real cryptography. Commit your move, reveal after your opponent.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <GamingStats />
      </div>

      {/* Game List */}
      <GameList onPlay={handlePlay} />

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-orange-900/20 border border-orange-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\u{1F3AE}"}</span>
          <div>
            <p className="font-medium text-orange-100">
              Powered by MagicBlock
            </p>
            <p className="text-sm text-orange-300 mt-1">
              Games use Pedersen commitments for hidden moves, viewing keys for
              fog-of-war, and stealth addresses for private reward claims. All
              cryptography is real — powered by @sip-protocol/sdk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
