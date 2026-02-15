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
      expect(result.commitmentHash).toMatch(/^0x/)
      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
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
