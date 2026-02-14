"use client"

import { cn } from "@/lib/utils"
import { useCampaigns, type CampaignFilter } from "@/hooks/use-campaigns"
import { CampaignCard } from "./campaign-card"
import type { Campaign } from "@/lib/loyalty/types"
import { SAMPLE_PROGRESS } from "@/lib/loyalty/constants"

const FILTER_TABS: { value: CampaignFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "joined", label: "Joined" },
  { value: "completed", label: "Completed" },
]

interface CampaignListProps {
  onJoin?: (campaign: Campaign) => void
  onClaim?: (campaign: Campaign) => void
}

export function CampaignList({ onJoin, onClaim }: CampaignListProps) {
  const { campaigns, isLoading, filter, setFilter } = useCampaigns()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5 animate-pulse"
          >
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-3" />
            <div className="h-3 bg-gray-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

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
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaign grid */}
      {campaigns.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">{"\u{1F3AF}"}</p>
          <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === "all"
              ? "No campaigns available yet. Check back soon for new privacy challenges."
              : `No ${filter} campaigns. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {campaigns.map((campaign) => {
            const progress = SAMPLE_PROGRESS.find(
              (p) => p.campaignId === campaign.id,
            )
            return (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                progress={progress}
                onJoin={onJoin}
                onClaim={onClaim}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
