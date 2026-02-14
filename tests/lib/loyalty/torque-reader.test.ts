import { describe, it, expect } from "vitest"
import { TorqueReader } from "@/lib/loyalty/torque-reader"

describe("TorqueReader", () => {
  describe("simulation mode", () => {
    const reader = new TorqueReader("simulation")

    it("returns sample campaigns", async () => {
      const campaigns = await reader.getCampaigns()
      expect(campaigns.length).toBeGreaterThanOrEqual(5)
      expect(campaigns[0]).toHaveProperty("id")
      expect(campaigns[0]).toHaveProperty("name")
      expect(campaigns[0]).toHaveProperty("rewardAmount")
    })

    it("returns a specific campaign by id", async () => {
      const campaign = await reader.getCampaign("camp-privacy-pioneer")
      expect(campaign).toBeDefined()
      expect(campaign?.name).toBe("Privacy Pioneer")
    })

    it("returns undefined for unknown campaign", async () => {
      const campaign = await reader.getCampaign("nonexistent")
      expect(campaign).toBeUndefined()
    })

    it("returns progress for a joined campaign", async () => {
      const progress = await reader.getProgress("camp-privacy-pioneer")
      expect(progress).toBeDefined()
      expect(progress?.completedActions).toBe(3)
      expect(progress?.requiredActions).toBe(5)
    })

    it("returns undefined progress for unjoined campaign", async () => {
      const progress = await reader.getProgress("camp-bridge-guardian")
      expect(progress).toBeUndefined()
    })

    it("returns rewards", async () => {
      const rewards = await reader.getRewards()
      expect(rewards.length).toBeGreaterThanOrEqual(1)
      expect(rewards[0]).toHaveProperty("id")
      expect(rewards[0]).toHaveProperty("amount")
      expect(rewards[0]).toHaveProperty("token")
    })

    it("calculates tier based on completed campaigns", async () => {
      const tier = await reader.getTier()
      // With 1 completed campaign in sample data, should be bronze
      expect(tier).toBe("bronze")
    })
  })

  describe("torque mode", () => {
    const reader = new TorqueReader("torque")

    it("throws not implemented for getCampaigns", async () => {
      await expect(reader.getCampaigns()).rejects.toThrow("Torque mode is not yet implemented")
    })

    it("throws not implemented for getCampaign", async () => {
      await expect(reader.getCampaign("any")).rejects.toThrow("Torque mode is not yet implemented")
    })

    it("throws not implemented for getProgress", async () => {
      await expect(reader.getProgress("any")).rejects.toThrow("Torque mode is not yet implemented")
    })

    it("throws not implemented for getRewards", async () => {
      await expect(reader.getRewards()).rejects.toThrow("Torque mode is not yet implemented")
    })

    it("throws not implemented for getTier", async () => {
      await expect(reader.getTier()).rejects.toThrow("Torque mode is not yet implemented")
    })
  })
})
