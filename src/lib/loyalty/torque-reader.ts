import type {
  Campaign,
  CampaignProgress,
  LoyaltyReward,
  LoyaltyTier,
  LoyaltyMode,
} from "./types"
import {
  SAMPLE_CAMPAIGNS,
  SAMPLE_PROGRESS,
  SAMPLE_REWARDS,
  calculateTier,
} from "./constants"

export class TorqueReader {
  private mode: LoyaltyMode

  constructor(mode: LoyaltyMode = "simulation") {
    this.mode = mode
  }

  async getCampaigns(): Promise<Campaign[]> {
    if (this.mode === "simulation") {
      return SAMPLE_CAMPAIGNS
    }
    throw new Error("Torque mode is not yet implemented. Use simulation mode.")
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_CAMPAIGNS.find((c) => c.id === id)
    }
    throw new Error("Torque mode is not yet implemented. Use simulation mode.")
  }

  async getProgress(campaignId: string): Promise<CampaignProgress | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_PROGRESS.find((p) => p.campaignId === campaignId)
    }
    throw new Error("Torque mode is not yet implemented. Use simulation mode.")
  }

  async getRewards(): Promise<LoyaltyReward[]> {
    if (this.mode === "simulation") {
      return SAMPLE_REWARDS
    }
    throw new Error("Torque mode is not yet implemented. Use simulation mode.")
  }

  async getTier(): Promise<LoyaltyTier> {
    if (this.mode === "simulation") {
      const completedCount = SAMPLE_PROGRESS.filter((p) => p.isComplete).length
      return calculateTier(completedCount)
    }
    throw new Error("Torque mode is not yet implemented. Use simulation mode.")
  }
}
