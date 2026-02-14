"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useGovernanceHistoryStore } from "@/stores/governance-history"
import { VoteHistoryCard } from "./vote-history-card"

type HistoryFilter = "all" | "unrevealed" | "revealed"

interface VoteHistoryListProps {
  onReveal?: (voteId: string) => void
}

export function VoteHistoryList({ onReveal }: VoteHistoryListProps) {
  const { votes } = useGovernanceHistoryStore()
  const [filter, setFilter] = useState<HistoryFilter>("all")

  const filteredVotes = votes.filter((v) => {
    if (filter === "unrevealed") return v.status === "committed"
    if (filter === "revealed") return v.status === "revealed"
    return true
  })

  const tabs: { value: HistoryFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: votes.length },
    {
      value: "unrevealed",
      label: "Unrevealed",
      count: votes.filter((v) => v.status === "committed").length,
    },
    {
      value: "revealed",
      label: "Revealed",
      count: votes.filter((v) => v.status === "revealed").length,
    },
  ]

  if (votes.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl">
        <p className="text-4xl mb-4">🗳️</p>
        <h3 className="text-lg font-semibold mb-2">No votes yet</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Your committed and revealed votes will appear here. Browse proposals
          to cast your first private vote.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === tab.value
                ? "bg-sip-purple-600 text-white"
                : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Vote cards */}
      {filteredVotes.length === 0 ? (
        <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
          No {filter === "unrevealed" ? "unrevealed" : "revealed"} votes
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVotes.map((vote) => (
            <VoteHistoryCard
              key={vote.id}
              vote={vote}
              onReveal={onReveal}
            />
          ))}
        </div>
      )}
    </div>
  )
}
