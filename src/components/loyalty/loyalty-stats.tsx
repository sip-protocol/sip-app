"use client"

import { useCampaigns } from "@/hooks/use-campaigns"
import { useLoyaltyHistoryStore } from "@/stores/loyalty-history"
import { TIER_CONFIG } from "@/lib/loyalty/constants"

export function LoyaltyStats() {
  const { isLoading, tier } = useCampaigns()
  const { joinedCampaigns, actions } = useLoyaltyHistoryStore()

  const joined = joinedCampaigns.length
  const completed = joinedCampaigns.filter((c) => c.isComplete).length
  const rewards = actions.filter((a) => a.type === "claim" && a.status === "claimed").length
  const tierConfig = TIER_CONFIG[tier]

  const stats = [
    { label: "Campaigns Joined", value: joined.toString() },
    { label: "Completed", value: completed.toString() },
    { label: "Rewards Earned", value: rewards.toString() },
    { label: "Tier", value: isLoading ? "..." : `${tierConfig.icon} ${tierConfig.label}` },
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
