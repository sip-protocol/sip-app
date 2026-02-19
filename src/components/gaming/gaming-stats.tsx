"use client"

import { useState, useEffect } from "react"
import { useGamingHistoryStore } from "@/stores/gaming-history"
import { SAMPLE_GAMES } from "@/lib/gaming/constants"
import { MagicBlockReader } from "@/lib/gaming/magicblock-reader"
import type { Game } from "@/lib/gaming/types"

export function GamingStats() {
  const { results } = useGamingHistoryStore()
  const [allGames, setAllGames] = useState<Game[]>(SAMPLE_GAMES)

  useEffect(() => {
    const reader = new MagicBlockReader("magicblock")
    reader.getGames().then(setAllGames)
  }, [])

  const gamesPlayed = results.length
  const wins = results.filter((r) => r.won).length
  const activeGames = allGames.filter((g) => g.isActive).length
  const bestReward =
    results.length > 0
      ? results.some((r) => r.rewardTier === "diamond")
        ? "Diamond"
        : results.some((r) => r.rewardTier === "gold")
          ? "Gold"
          : results.some((r) => r.rewardTier === "silver")
            ? "Silver"
            : "Bronze"
      : "None"

  const stats = [
    { label: "Games Played", value: gamesPlayed.toString() },
    { label: "Wins", value: wins.toString() },
    { label: "Active Games", value: activeGames.toString() },
    { label: "Best Reward", value: bestReward },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
