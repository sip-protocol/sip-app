import { describe, it, expect, vi, beforeEach } from "vitest"
import { LoyaltyService } from "@/lib/loyalty/loyalty-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type { LoyaltyStep, JoinCampaignParams, CompleteActionParams, ClaimRewardParams } from "@/lib/loyalty/types"

// Mock the SDK to avoid WASM/crypto deps in tests
vi.mock("@sip-protocol/sdk", () => ({
  generateStealthMetaAddress: () => ({
    metaAddress: {
      spendingPublicKey: "0x" + "aa".repeat(32),
      viewingPublicKey: "0x" + "bb".repeat(32),
    },
    spendingPrivateKey: "0x" + "cc".repeat(32),
    viewingPrivateKey: "0x" + "dd".repeat(32),
  }),
  generateStealthAddress: () => ({
    stealthAddress: { address: "0x" + "ee".repeat(32) },
    sharedSecret: "0x" + "ff".repeat(32),
  }),
  encodeStealthMetaAddress: () => "st:sol:0x" + "ab".repeat(32),
}))

vi.mock("@/lib/sip-client", () => ({
  getSDK: async () => {
    const sdk = await import("@sip-protocol/sdk")
    return sdk
  },
}))

const validJoinParams: JoinCampaignParams = {
  campaignId: "camp-privacy-pioneer",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validActionParams: CompleteActionParams = {
  campaignId: "camp-privacy-pioneer",
  actionType: "shielded_transfer",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validClaimParams: ClaimRewardParams = {
  rewardId: "reward-stealth-builder",
  campaignId: "camp-stealth-builder",
  amount: 0.3,
  token: "SOL",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("LoyaltyService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects empty campaignId for join", () => {
      const service = new LoyaltyService()
      const error = service.validate("join", { ...validJoinParams, campaignId: "" })
      expect(error).toBe("Campaign ID is required")
    })

    it("rejects unknown campaign for join", () => {
      const service = new LoyaltyService()
      const error = service.validate("join", { ...validJoinParams, campaignId: "nonexistent" })
      expect(error).toBe("Campaign not found")
    })

    it("accepts valid join params", () => {
      const service = new LoyaltyService()
      const error = service.validate("join", validJoinParams)
      expect(error).toBeNull()
    })

    it("rejects empty campaignId for action", () => {
      const service = new LoyaltyService()
      const error = service.validate("action", { ...validActionParams, campaignId: "" })
      expect(error).toBe("Campaign ID is required")
    })

    it("rejects empty actionType for action", () => {
      const service = new LoyaltyService()
      const error = service.validate("action", { ...validActionParams, actionType: "" as never })
      expect(error).toBe("Action type is required")
    })

    it("accepts valid action params", () => {
      const service = new LoyaltyService()
      const error = service.validate("action", validActionParams)
      expect(error).toBeNull()
    })

    it("rejects empty rewardId for claim", () => {
      const service = new LoyaltyService()
      const error = service.validate("claim", { ...validClaimParams, rewardId: "" })
      expect(error).toBe("Reward ID is required")
    })

    it("rejects zero amount for claim", () => {
      const service = new LoyaltyService()
      const error = service.validate("claim", { ...validClaimParams, amount: 0 })
      expect(error).toBe("Reward amount must be positive")
    })

    it("rejects empty token for claim", () => {
      const service = new LoyaltyService()
      const error = service.validate("claim", { ...validClaimParams, token: "" })
      expect(error).toBe("Token is required")
    })
  })

  describe("joinCampaign (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: LoyaltyStep[] = []
      const service = new LoyaltyService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.joinCampaign(validJoinParams)

      expect(steps).toEqual(["selecting_campaign", "joining", "joined"])
      expect(result.status).toBe("joined")
    })

    it("sets campaign name on result", async () => {
      const service = new LoyaltyService({ mode: "simulation" })
      const result = await service.joinCampaign(validJoinParams)

      expect(result.campaignName).toBe("Privacy Pioneer")
      expect(result.type).toBe("join")
    })

    it("records step timestamps", async () => {
      const service = new LoyaltyService({ mode: "simulation" })
      const result = await service.joinCampaign(validJoinParams)

      expect(result.stepTimestamps.selecting_campaign).toBeDefined()
      expect(result.stepTimestamps.joining).toBeDefined()
      expect(result.stepTimestamps.joined).toBeDefined()
    })
  })

  describe("completeAction (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: LoyaltyStep[] = []
      const service = new LoyaltyService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.completeAction(validActionParams)

      expect(steps).toEqual(["verifying_action", "recording", "recorded"])
      expect(result.status).toBe("recorded")
    })

    it("sets action type on result", async () => {
      const service = new LoyaltyService({ mode: "simulation" })
      const result = await service.completeAction(validActionParams)

      expect(result.actionType).toBe("shielded_transfer")
      expect(result.type).toBe("action")
    })

    it("records step timestamps", async () => {
      const service = new LoyaltyService({ mode: "simulation" })
      const result = await service.completeAction(validActionParams)

      expect(result.stepTimestamps.verifying_action).toBeDefined()
      expect(result.stepTimestamps.recording).toBeDefined()
      expect(result.stepTimestamps.recorded).toBeDefined()
    })
  })

  describe("claimReward (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: LoyaltyStep[] = []
      const service = new LoyaltyService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.claimReward(validClaimParams)

      expect(steps).toEqual(["generating_stealth", "claiming", "claimed"])
      expect(result.status).toBe("claimed")
    })

    it("generates stealth address for reward", async () => {
      const service = new LoyaltyService({ mode: "simulation" })
      const result = await service.claimReward(validClaimParams)

      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
      expect(result.rewardAmount).toBe(0.3)
      expect(result.rewardToken).toBe("SOL")
    })

    it("records step timestamps", async () => {
      const service = new LoyaltyService({ mode: "simulation" })
      const result = await service.claimReward(validClaimParams)

      expect(result.stepTimestamps.generating_stealth).toBeDefined()
      expect(result.stepTimestamps.claiming).toBeDefined()
      expect(result.stepTimestamps.claimed).toBeDefined()
    })
  })
})
