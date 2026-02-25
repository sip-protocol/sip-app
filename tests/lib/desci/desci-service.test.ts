import { describe, it, expect, vi, beforeEach } from "vitest"
import { DeSciService } from "@/lib/desci/desci-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type {
  DeSciStep,
  FundProjectParams,
  ReviewProjectParams,
} from "@/lib/desci/types"

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
  createCommitment: () => ({
    value: "0x" + "ab".repeat(32),
    blindingFactor: "0x" + "cd".repeat(32),
  }),
  generateViewingKey: () => ({
    hash: "0xmock_viewing_key_hash",
    publicKey: "0x" + "ee".repeat(32),
    privateKey: "0x" + "ff".repeat(32),
  }),
  encryptForViewing: () => ({
    ciphertext: "mock_ciphertext",
    nonce: "mock_nonce",
  }),
}))

vi.mock("@/lib/sip-client", () => ({
  getSDK: async () => {
    const sdk = await import("@sip-protocol/sdk")
    return sdk
  },
}))

const validFundParams: FundProjectParams = {
  projectId: "project-longevity-dao",
  tier: "grant",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validReviewParams: ReviewProjectParams = {
  projectId: "project-longevity-dao",
  tier: "grant",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("DeSciService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects empty projectId for fund", () => {
      const service = new DeSciService()
      const error = service.validate("fund", {
        ...validFundParams,
        projectId: "",
      })
      expect(error).toBe("Project ID is required")
    })

    it("rejects unknown project for fund", () => {
      const service = new DeSciService()
      const error = service.validate("fund", {
        ...validFundParams,
        projectId: "nonexistent",
      })
      expect(error).toBe("Project not found")
    })

    it("rejects empty tier for fund", () => {
      const service = new DeSciService()
      const error = service.validate("fund", {
        ...validFundParams,
        tier: "" as never,
      })
      expect(error).toBe("Funding tier is required")
    })

    it("accepts valid fund params", () => {
      const service = new DeSciService()
      const error = service.validate("fund", validFundParams)
      expect(error).toBeNull()
    })

    it("rejects empty projectId for review", () => {
      const service = new DeSciService()
      const error = service.validate("review", {
        ...validReviewParams,
        projectId: "",
      })
      expect(error).toBe("Project ID is required")
    })

    it("accepts valid review params", () => {
      const service = new DeSciService()
      const error = service.validate("review", validReviewParams)
      expect(error).toBeNull()
    })
  })

  describe("fundProject (simulation)", () => {
    it("progresses through 4 steps in order", async () => {
      const steps: DeSciStep[] = []
      const service = new DeSciService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.fundProject(validFundParams)

      expect(steps).toEqual([
        "selecting_project",
        "generating_stealth_funding",
        "funding",
        "funded",
      ])
      expect(result.status).toBe("funded")
    })

    it("sets project title and category on result", async () => {
      const service = new DeSciService({ mode: "simulation" })
      const result = await service.fundProject(validFundParams)

      expect(result.projectTitle).toBe("Longevity DAO")
      expect(result.category).toBe("biotech")
      expect(result.type).toBe("fund")
    })

    it("generates commitment hash and stealth address", async () => {
      const service = new DeSciService({ mode: "simulation" })
      const result = await service.fundProject(validFundParams)

      expect(result.commitmentHash).toBeTruthy()
      expect(result.commitmentHash).not.toMatch(/^0x/)
      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
    })
  })

  describe("fundProject (with on-chain callback)", () => {
    it("calls onFundTransaction and stores txSignature", async () => {
      const mockTxCallback = vi.fn().mockResolvedValue("5xMockFundSig")
      const service = new DeSciService({
        mode: "simulation",
        onFundTransaction: mockTxCallback,
      })

      const result = await service.fundProject(validFundParams)

      expect(mockTxCallback).toHaveBeenCalledWith(
        validFundParams.projectId,
        validFundParams.tier,
        expect.any(String)
      )
      expect(result.txSignature).toBe("5xMockFundSig")
    })

    it("falls back to simulation when no callback", async () => {
      const service = new DeSciService({ mode: "simulation" })
      const result = await service.fundProject(validFundParams)

      expect(result.txSignature).toBeUndefined()
      expect(result.status).toBe("funded")
    })

    it("handles null return from callback gracefully", async () => {
      const mockTxCallback = vi.fn().mockResolvedValue(null)
      const service = new DeSciService({
        mode: "simulation",
        onFundTransaction: mockTxCallback,
      })

      const result = await service.fundProject(validFundParams)

      expect(mockTxCallback).toHaveBeenCalled()
      expect(result.txSignature).toBeUndefined()
      expect(result.status).toBe("funded")
    })
  })

  describe("fundProject (with shielded transfer)", () => {
    it("calls onShieldedTransfer during funding step", async () => {
      const mockShielded = vi.fn().mockResolvedValue("5xMockShieldedFund")
      const service = new DeSciService({
        mode: "simulation",
        onShieldedTransfer: mockShielded,
      })

      const result = await service.fundProject(validFundParams)

      expect(mockShielded).toHaveBeenCalledWith(
        10_000_000,
        expect.stringContaining("SIP-FUND")
      )
      expect(result.shieldedTxSignature).toBe("5xMockShieldedFund")
    })

    it("stores shieldedTxSignature on record", async () => {
      const mockShielded = vi.fn().mockResolvedValue("5xShieldedDeSci")
      const service = new DeSciService({
        mode: "simulation",
        onShieldedTransfer: mockShielded,
      })

      const result = await service.fundProject(validFundParams)
      expect(result.shieldedTxSignature).toBe("5xShieldedDeSci")
    })

    it("handles null return from shielded transfer", async () => {
      const mockShielded = vi.fn().mockResolvedValue(null)
      const service = new DeSciService({
        mode: "simulation",
        onShieldedTransfer: mockShielded,
      })

      const result = await service.fundProject(validFundParams)
      expect(mockShielded).toHaveBeenCalled()
      expect(result.shieldedTxSignature).toBeUndefined()
      expect(result.status).toBe("funded")
    })

    it("proceeds without shielded transfer when no callback", async () => {
      const service = new DeSciService({ mode: "simulation" })
      const result = await service.fundProject(validFundParams)

      expect(result.shieldedTxSignature).toBeUndefined()
      expect(result.status).toBe("funded")
    })

    it("does not block funding if shielded transfer errors", async () => {
      const mockShielded = vi.fn().mockRejectedValue(new Error("tx failed"))
      const service = new DeSciService({
        mode: "simulation",
        onShieldedTransfer: mockShielded,
      })

      const result = await service.fundProject(validFundParams)
      expect(result.status).toBe("funded")
    })
  })

  describe("reviewProject (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: DeSciStep[] = []
      const service = new DeSciService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.reviewProject(validReviewParams)

      expect(steps).toEqual([
        "generating_proof",
        "submitting_review",
        "reviewed",
      ])
      expect(result.status).toBe("reviewed")
    })

    it("generates stealth address for review", async () => {
      const service = new DeSciService({ mode: "simulation" })
      const result = await service.reviewProject(validReviewParams)

      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
      expect(result.reviewVerified).toBe(true)
    })

    it("records step timestamps", async () => {
      const service = new DeSciService({ mode: "simulation" })
      const result = await service.reviewProject(validReviewParams)

      expect(result.stepTimestamps.generating_proof).toBeDefined()
      expect(result.stepTimestamps.submitting_review).toBeDefined()
      expect(result.stepTimestamps.reviewed).toBeDefined()
    })
  })
})
