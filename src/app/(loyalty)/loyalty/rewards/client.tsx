"use client"

import { useState, useCallback } from "react"
import { RewardList } from "@/components/loyalty/reward-list"
import { ClaimRewardForm } from "@/components/loyalty/claim-reward-form"
import type { LoyaltyReward } from "@/lib/loyalty/types"

type View = "list" | "claim"

export function RewardsPageClient() {
  const [view, setView] = useState<View>("list")
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null)

  const handleClaim = useCallback((reward: LoyaltyReward) => {
    setSelectedReward(reward)
    setView("claim")
  }, [])

  const handleBack = useCallback(() => {
    setView("list")
    setSelectedReward(null)
  }, [])

  // Claim view
  if (view === "claim" && selectedReward) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to rewards
        </button>
        <ClaimRewardForm reward={selectedReward} onClaimed={handleBack} />
      </div>
    )
  }

  // List view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Claim Rewards</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Claim your earned rewards to a stealth address. Only you can access
          them — completely unlinkable to your wallet.
        </p>
      </div>

      <RewardList onClaim={handleClaim} />
    </div>
  )
}
