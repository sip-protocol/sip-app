"use client"

import { cn } from "@/lib/utils"
import { CampaignStatusBadge } from "./campaign-status-badge"
import type { Campaign, CampaignProgress } from "@/lib/loyalty/types"

interface CampaignCardProps {
  campaign: Campaign
  progress?: CampaignProgress
  onJoin?: (campaign: Campaign) => void
  onClaim?: (campaign: Campaign) => void
  className?: string
}

export function CampaignCard({
  campaign,
  progress,
  onJoin,
  onClaim,
  className,
}: CampaignCardProps) {
  const progressPercent = progress
    ? Math.min(100, Math.round((progress.completedActions / progress.requiredActions) * 100))
    : 0
  const isJoined = !!progress
  const isComplete = progress?.isComplete ?? false

  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5",
        "hover:border-[var(--border-hover)] hover:shadow-md transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{campaign.icon}</span>
          <div>
            <h3 className="font-semibold text-sm">{campaign.name}</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {campaign.participantCount} participants
            </p>
          </div>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
        {campaign.description}
      </p>

      {/* Progress bar */}
      {isJoined && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--text-tertiary)]">Progress</span>
            <span className="text-amber-400 font-medium">
              {progress.completedActions}/{progress.requiredActions}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Reward + Action */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--text-tertiary)]">Reward</p>
          <p className="font-bold text-amber-400">
            {campaign.rewardAmount} {campaign.rewardToken}
          </p>
        </div>

        {isComplete ? (
          <button
            type="button"
            onClick={() => onClaim?.(campaign)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-sip-green-500 to-sip-green-700 text-white hover:from-sip-green-400 hover:to-sip-green-600 transition-colors"
          >
            Claim
          </button>
        ) : isJoined ? (
          <span className="text-xs text-amber-400 font-medium">
            {progressPercent}% complete
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onJoin?.(campaign)}
            disabled={campaign.status !== "active"}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              campaign.status === "active"
                ? "bg-gradient-to-r from-amber-500 to-amber-700 text-white hover:from-amber-400 hover:to-amber-600"
                : "bg-gray-700 text-gray-400 cursor-not-allowed",
            )}
          >
            Join
          </button>
        )}
      </div>
    </div>
  )
}
