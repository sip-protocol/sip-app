"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { TorqueReader } from "@/lib/loyalty/torque-reader"
import type { Campaign, LoyaltyTier } from "@/lib/loyalty/types"

export type CampaignFilter = "all" | "active" | "completed" | "joined"

export interface UseCampaignsReturn {
  campaigns: Campaign[]
  isLoading: boolean
  filter: CampaignFilter
  setFilter: (filter: CampaignFilter) => void
  tier: LoyaltyTier
}

export function useCampaigns(): UseCampaignsReturn {
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<CampaignFilter>("all")
  const [tier, setTier] = useState<LoyaltyTier>("none")

  useEffect(() => {
    const reader = new TorqueReader("simulation")

    async function load() {
      setIsLoading(true)
      try {
        const [campaignData, tierData] = await Promise.all([
          reader.getCampaigns(),
          reader.getTier(),
        ])
        setAllCampaigns(campaignData)
        setTier(tierData)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const campaigns = useMemo(() => {
    if (filter === "all") return allCampaigns
    if (filter === "active")
      return allCampaigns.filter((c) => c.status === "active")
    if (filter === "completed")
      return allCampaigns.filter((c) => c.status === "completed")
    // "joined" — show all for now (would check user progress in real mode)
    return allCampaigns
  }, [allCampaigns, filter])

  const handleSetFilter = useCallback((f: CampaignFilter) => {
    setFilter(f)
  }, [])

  return {
    campaigns,
    isLoading,
    filter,
    setFilter: handleSetFilter,
    tier,
  }
}
