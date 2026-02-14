"use client"

import { useState, useCallback } from "react"
import { LoyaltyStats } from "@/components/loyalty/loyalty-stats"
import { CampaignList } from "@/components/loyalty/campaign-list"
import { JoinCampaignForm } from "@/components/loyalty/join-campaign-form"
import type { Campaign } from "@/lib/loyalty/types"

type View = "dashboard" | "join-campaign"

export function LoyaltyPageClient() {
  const [view, setView] = useState<View>("dashboard")
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  const handleJoin = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setView("join-campaign")
  }, [])

  const handleBack = useCallback(() => {
    setView("dashboard")
    setSelectedCampaign(null)
  }, [])

  // Join campaign view
  if (view === "join-campaign" && selectedCampaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to campaigns
        </button>
        <JoinCampaignForm campaign={selectedCampaign} onJoined={handleBack} />
      </div>
    )
  }

  // Dashboard view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Privacy Loyalty
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Earn rewards for using privacy features. Complete campaigns, build
          your tier, and claim rewards — all without surveillance.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <LoyaltyStats />
      </div>

      {/* Campaign List */}
      <CampaignList onJoin={handleJoin} />

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-amber-900/20 border border-amber-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\u{1F3C6}"}</span>
          <div>
            <p className="font-medium text-amber-100">
              Powered by Torque Protocol
            </p>
            <p className="text-sm text-amber-300 mt-1">
              Privacy actions are tracked off-chain using Torque events — no
              on-chain footprint. Rewards are distributed to stealth addresses,
              keeping your loyalty activity private.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
