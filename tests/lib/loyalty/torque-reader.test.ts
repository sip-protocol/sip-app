import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { TorqueReader } from "@/lib/loyalty/torque-reader"
import { SAMPLE_CAMPAIGNS } from "@/lib/loyalty/constants"

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

    it("does not attempt API calls in simulation mode", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch")
      await reader.getCampaigns()
      expect(fetchSpy).not.toHaveBeenCalled()
      fetchSpy.mockRestore()
    })
  })

  describe("torque mode", () => {
    let reader: TorqueReader

    beforeEach(() => {
      reader = new TorqueReader("torque")
      reader.clearCache()
    })

    it("falls back to simulation data for getCampaigns", async () => {
      const campaigns = await reader.getCampaigns()
      expect(campaigns.length).toBeGreaterThanOrEqual(1)
    })

    it("falls back to simulation data for getCampaign", async () => {
      const campaign = await reader.getCampaign("camp-privacy-pioneer")
      expect(campaign).toBeDefined()
    })

    it("falls back to simulation data for getProgress", async () => {
      const progress = await reader.getProgress("camp-privacy-pioneer")
      expect(progress).toBeDefined()
    })

    it("falls back to simulation data for getRewards", async () => {
      const rewards = await reader.getRewards()
      expect(rewards.length).toBeGreaterThanOrEqual(1)
    })

    it("falls back to simulation data for getTier", async () => {
      const tier = await reader.getTier()
      expect(tier).toBeDefined()
    })
  })

  describe("torque mode with mocked API", () => {
    let reader: TorqueReader
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      reader = new TorqueReader("torque")
      reader.clearCache()
    })

    afterEach(() => {
      fetchSpy?.mockRestore()
    })

    it("maps Torque API campaigns to SIP Campaign format", async () => {
      const mockApiCampaign = {
        id: "torque-123",
        title: "Swap SOL for BONK",
        description: "Complete a swap on Jupiter",
        pubKey: "abc123",
        advertiserPubKey: "def456",
        startTime: new Date("2026-01-01").toISOString(),
        endTime: new Date("2026-12-31").toISOString(),
        totalConversions: 500,
        remainingConversions: 300,
        status: "RUNNING",
        userRewardAmount: "0.5",
        userRewardToken: "So11111111111111111111111111111111111111112",
        userRewardType: "TOKENS",
        hideRewards: false,
        offerTheme: {},
        asymmetricRewards: [],
        audiences: [],
        requirements: [{ type: "SWAP", eventConfig: {}, id: "req-1" }],
      }

      fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "SUCCESS",
            data: { campaigns: [mockApiCampaign] },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )

      const campaigns = await reader.getCampaigns()

      expect(campaigns).toHaveLength(1)
      expect(campaigns[0].id).toBe("torque-123")
      expect(campaigns[0].name).toBe("Swap SOL for BONK")
      expect(campaigns[0].rewardAmount).toBe(0.5)
      expect(campaigns[0].rewardToken).toBe("SOL")
      expect(campaigns[0].actionType).toBe("shielded_transfer")
      expect(campaigns[0].status).toBe("active")
      expect(campaigns[0].participantCount).toBe(500)
    })

    it("maps POINTS reward type correctly", async () => {
      const mockApiCampaign = {
        id: "torque-points",
        title: "Earn Points",
        pubKey: "abc",
        advertiserPubKey: "def",
        startTime: new Date("2026-01-01").toISOString(),
        endTime: new Date("2026-12-31").toISOString(),
        totalConversions: 100,
        remainingConversions: 50,
        status: "RUNNING",
        userRewardAmount: "100",
        userRewardType: "POINTS",
        hideRewards: false,
        offerTheme: {},
        asymmetricRewards: [],
        audiences: [],
        requirements: [],
      }

      fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "SUCCESS",
            data: { campaigns: [mockApiCampaign] },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )

      const campaigns = await reader.getCampaigns()
      expect(campaigns[0].rewardToken).toBe("PTS")
      expect(campaigns[0].rewardAmount).toBe(100)
    })

    it("determines expired status for ended campaigns", async () => {
      const mockApiCampaign = {
        id: "torque-ended",
        title: "Expired Campaign",
        pubKey: "abc",
        advertiserPubKey: "def",
        startTime: new Date("2025-01-01").toISOString(),
        endTime: new Date("2025-06-01").toISOString(),
        totalConversions: 100,
        remainingConversions: 50,
        status: "ENDED",
        hideRewards: false,
        offerTheme: {},
        asymmetricRewards: [],
        audiences: [],
        requirements: [],
      }

      fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "SUCCESS",
            data: { campaigns: [mockApiCampaign] },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )

      const campaigns = await reader.getCampaigns()
      expect(campaigns[0].status).toBe("expired")
    })

    it("determines completed status when no remaining conversions", async () => {
      const mockApiCampaign = {
        id: "torque-complete",
        title: "Completed Campaign",
        pubKey: "abc",
        advertiserPubKey: "def",
        startTime: new Date("2025-01-01").toISOString(),
        endTime: new Date("2025-06-01").toISOString(),
        totalConversions: 100,
        remainingConversions: 0,
        status: "ENDED",
        hideRewards: false,
        offerTheme: {},
        asymmetricRewards: [],
        audiences: [],
        requirements: [],
      }

      fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "SUCCESS",
            data: { campaigns: [mockApiCampaign] },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )

      const campaigns = await reader.getCampaigns()
      expect(campaigns[0].status).toBe("completed")
    })

    it("caches campaign results for 5 minutes", async () => {
      const makeMockResponse = () =>
        new Response(
          JSON.stringify({
            status: "SUCCESS",
            data: {
              campaigns: [
                {
                  id: "cached-1",
                  title: "Cached",
                  pubKey: "abc",
                  advertiserPubKey: "def",
                  startTime: new Date().toISOString(),
                  endTime: new Date(Date.now() + 86400000).toISOString(),
                  totalConversions: 10,
                  remainingConversions: 5,
                  status: "RUNNING",
                  hideRewards: false,
                  offerTheme: {},
                  asymmetricRewards: [],
                  audiences: [],
                  requirements: [],
                },
              ],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )

      fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockImplementation(() => Promise.resolve(makeMockResponse()))

      // First call -- fetches from API
      const first = await reader.getCampaigns()
      expect(first).toHaveLength(1)
      const callsAfterFirst = fetchSpy.mock.calls.length
      expect(callsAfterFirst).toBeGreaterThanOrEqual(1)

      // Second call -- should use cache, no additional fetch
      const second = await reader.getCampaigns()
      expect(second).toHaveLength(1)
      expect(fetchSpy.mock.calls.length).toBe(callsAfterFirst)
    })

    it("falls back to simulation when API returns non-200", async () => {
      fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("Unauthorized", { status: 401 }))

      const campaigns = await reader.getCampaigns()
      // Should get simulation data
      expect(campaigns).toEqual(SAMPLE_CAMPAIGNS)
    })

    it("falls back to simulation when fetch throws", async () => {
      fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockRejectedValue(new Error("Network error"))

      const campaigns = await reader.getCampaigns()
      expect(campaigns).toEqual(SAMPLE_CAMPAIGNS)
    })

    it("fetches a single campaign by ID from API", async () => {
      const mockApiCampaign = {
        id: "single-123",
        title: "Single Campaign",
        pubKey: "abc",
        advertiserPubKey: "def",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        totalConversions: 50,
        remainingConversions: 25,
        status: "RUNNING",
        hideRewards: false,
        offerTheme: {},
        asymmetricRewards: [],
        audiences: [],
        requirements: [],
      }

      fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ status: "SUCCESS", data: mockApiCampaign }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )

      const campaign = await reader.getCampaign("single-123")
      expect(campaign).toBeDefined()
      expect(campaign?.id).toBe("single-123")
      expect(campaign?.name).toBe("Single Campaign")
    })

    it("infers action types from requirement event types", async () => {
      const makeApiCampaign = (type: string) => ({
        id: `type-${type}`,
        title: `Test ${type}`,
        pubKey: "abc",
        advertiserPubKey: "def",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        totalConversions: 10,
        remainingConversions: 5,
        status: "RUNNING",
        hideRewards: false,
        offerTheme: {},
        asymmetricRewards: [],
        audiences: [],
        requirements: [{ type, eventConfig: {}, id: "req-1" }],
      })

      fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "SUCCESS",
            data: {
              campaigns: [
                makeApiCampaign("SWAP"),
                makeApiCampaign("REALMS_VOTE"),
                makeApiCampaign("MEMO"),
                makeApiCampaign("STAKE_SOL"),
                makeApiCampaign("NFT_COLLECTION_TRADE"),
              ],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )

      const campaigns = await reader.getCampaigns()
      expect(campaigns[0].actionType).toBe("shielded_transfer")
      expect(campaigns[1].actionType).toBe("private_vote")
      expect(campaigns[2].actionType).toBe("anonymous_post")
      expect(campaigns[3].actionType).toBe("private_bridge")
      expect(campaigns[4].actionType).toBe("stealth_identity")
    })

    it("resolves well-known token addresses to labels", async () => {
      const makeWithToken = (token: string, id: string) => ({
        id,
        title: `Token ${id}`,
        pubKey: "abc",
        advertiserPubKey: "def",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        totalConversions: 10,
        remainingConversions: 5,
        status: "RUNNING",
        userRewardAmount: "1",
        userRewardToken: token,
        userRewardType: "TOKENS",
        hideRewards: false,
        offerTheme: {},
        asymmetricRewards: [],
        audiences: [],
        requirements: [],
      })

      fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "SUCCESS",
            data: {
              campaigns: [
                makeWithToken(
                  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
                  "bonk-campaign"
                ),
                makeWithToken(
                  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                  "usdc-campaign"
                ),
                makeWithToken(
                  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
                  "jup-campaign"
                ),
              ],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )

      const campaigns = await reader.getCampaigns()
      expect(campaigns[0].rewardToken).toBe("BONK")
      expect(campaigns[1].rewardToken).toBe("USDC")
      expect(campaigns[2].rewardToken).toBe("JUP")
    })

    it("clearCache resets the internal cache", async () => {
      const makeMockResponse = () =>
        new Response(
          JSON.stringify({
            status: "SUCCESS",
            data: {
              campaigns: [
                {
                  id: "cache-test",
                  title: "Cache Test",
                  pubKey: "abc",
                  advertiserPubKey: "def",
                  startTime: new Date().toISOString(),
                  endTime: new Date(Date.now() + 86400000).toISOString(),
                  totalConversions: 10,
                  remainingConversions: 5,
                  status: "RUNNING",
                  hideRewards: false,
                  offerTheme: {},
                  asymmetricRewards: [],
                  audiences: [],
                  requirements: [],
                },
              ],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )

      fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockImplementation(() => Promise.resolve(makeMockResponse()))

      await reader.getCampaigns()
      const callsAfterFirst = fetchSpy.mock.calls.length

      // Second call should use cache -- no additional fetch
      await reader.getCampaigns()
      expect(fetchSpy.mock.calls.length).toBe(callsAfterFirst)

      reader.clearCache()

      // After clearing cache, should fetch again
      await reader.getCampaigns()
      expect(fetchSpy.mock.calls.length).toBeGreaterThan(callsAfterFirst)
    })
  })
})
