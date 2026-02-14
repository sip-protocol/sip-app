"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { TorqueReader } from "@/lib/loyalty/torque-reader"
import { RewardCard } from "./reward-card"
import type { LoyaltyReward } from "@/lib/loyalty/types"

type RewardFilter = "unclaimed" | "claimed"

const FILTER_TABS: { value: RewardFilter; label: string }[] = [
  { value: "unclaimed", label: "Unclaimed" },
  { value: "claimed", label: "Claimed" },
]

interface RewardListProps {
  onClaim?: (reward: LoyaltyReward) => void
}

export function RewardList({ onClaim }: RewardListProps) {
  const [allRewards, setAllRewards] = useState<LoyaltyReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<RewardFilter>("unclaimed")

  useEffect(() => {
    const reader = new TorqueReader("simulation")

    async function load() {
      setIsLoading(true)
      try {
        const data = await reader.getRewards()
        setAllRewards(data)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const rewards =
    filter === "unclaimed"
      ? allRewards.filter((r) => !r.isClaimed)
      : allRewards.filter((r) => r.isClaimed)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5 animate-pulse"
          >
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-10 bg-gray-700 rounded w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === tab.value
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reward grid */}
      {rewards.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">{"\u{1F381}"}</p>
          <h3 className="text-lg font-semibold mb-2">
            {filter === "unclaimed"
              ? "No rewards to claim"
              : "No claimed rewards"}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === "unclaimed"
              ? "Complete privacy campaigns to earn rewards. Rewards are sent to stealth addresses — only you know they are yours."
              : "Claimed rewards will appear here with their stealth address delivery details."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} onClaim={onClaim} />
          ))}
        </div>
      )}
    </div>
  )
}
