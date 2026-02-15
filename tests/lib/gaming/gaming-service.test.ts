import { describe, it, expect, vi, beforeEach } from "vitest"
import { GamingService } from "@/lib/gaming/gaming-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type { GamingStep, PlayGameParams, ClaimRewardParams } from "@/lib/gaming/types"

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

const validPlayParams: PlayGameParams = {
  gameId: "game-stealth-showdown",
  move: "rock",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validClaimParams: ClaimRewardParams = {
  gameId: "game-stealth-showdown",
  rewardTier: "bronze",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("GamingService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects empty gameId for play", () => {
      const service = new GamingService()
      const error = service.validate("play", { ...validPlayParams, gameId: "" })
      expect(error).toBe("Game ID is required")
    })

    it("rejects unknown game for play", () => {
      const service = new GamingService()
      const error = service.validate("play", { ...validPlayParams, gameId: "nonexistent" })
      expect(error).toBe("Game not found")
    })

    it("rejects empty move for play", () => {
      const service = new GamingService()
      const error = service.validate("play", { ...validPlayParams, move: "" })
      expect(error).toBe("Move is required")
    })

    it("accepts valid play params", () => {
      const service = new GamingService()
      const error = service.validate("play", validPlayParams)
      expect(error).toBeNull()
    })

    it("rejects empty gameId for claim", () => {
      const service = new GamingService()
      const error = service.validate("claim", { ...validClaimParams, gameId: "" })
      expect(error).toBe("Game ID is required")
    })

    it("accepts valid claim params", () => {
      const service = new GamingService()
      const error = service.validate("claim", validClaimParams)
      expect(error).toBeNull()
    })
  })

  describe("playGame (simulation)", () => {
    it("progresses through 4 steps in order", async () => {
      const steps: GamingStep[] = []
      const service = new GamingService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.playGame(validPlayParams)

      expect(steps).toEqual([
        "committing_move",
        "generating_commitment",
        "revealing",
        "resolved",
      ])
      expect(result.status).toBe("resolved")
    })

    it("sets game title and type on result", async () => {
      const service = new GamingService({ mode: "simulation" })
      const result = await service.playGame(validPlayParams)

      expect(result.gameTitle).toBe("Stealth Showdown")
      expect(result.gameType).toBe("commit_reveal")
      expect(result.type).toBe("play")
    })

    it("generates commitment hash", async () => {
      const service = new GamingService({ mode: "simulation" })
      const result = await service.playGame(validPlayParams)

      expect(result.commitmentHash).toBeTruthy()
      expect(result.commitmentHash).toMatch(/^0x/)
    })
  })

  describe("claimReward (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: GamingStep[] = []
      const service = new GamingService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.claimReward(validClaimParams)

      expect(steps).toEqual([
        "generating_stealth",
        "claiming_reward",
        "claimed",
      ])
      expect(result.status).toBe("claimed")
    })

    it("generates stealth address for reward", async () => {
      const service = new GamingService({ mode: "simulation" })
      const result = await service.claimReward(validClaimParams)

      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
      expect(result.rewardTier).toBe("bronze")
    })

    it("records step timestamps", async () => {
      const service = new GamingService({ mode: "simulation" })
      const result = await service.claimReward(validClaimParams)

      expect(result.stepTimestamps.generating_stealth).toBeDefined()
      expect(result.stepTimestamps.claiming_reward).toBeDefined()
      expect(result.stepTimestamps.claimed).toBeDefined()
    })
  })
})
