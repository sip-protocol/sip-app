import { describe, it, expect, vi, beforeEach } from "vitest"
import { MetaverseService } from "@/lib/metaverse/metaverse-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type {
  MetaverseStep,
  ExploreWorldParams,
  TeleportParams,
} from "@/lib/metaverse/types"

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

const validExploreParams: ExploreWorldParams = {
  worldId: "world-crypto-gallery",
  tier: "explorer",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validTeleportParams: TeleportParams = {
  worldId: "world-crypto-gallery",
  tier: "explorer",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("MetaverseService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects empty worldId for explore", () => {
      const service = new MetaverseService()
      const error = service.validate("explore", {
        ...validExploreParams,
        worldId: "",
      })
      expect(error).toBe("World ID is required")
    })

    it("rejects unknown world for explore", () => {
      const service = new MetaverseService()
      const error = service.validate("explore", {
        ...validExploreParams,
        worldId: "nonexistent",
      })
      expect(error).toBe("World not found")
    })

    it("rejects empty tier for explore", () => {
      const service = new MetaverseService()
      const error = service.validate("explore", {
        ...validExploreParams,
        tier: "" as never,
      })
      expect(error).toBe("Avatar tier is required")
    })

    it("accepts valid explore params", () => {
      const service = new MetaverseService()
      const error = service.validate("explore", validExploreParams)
      expect(error).toBeNull()
    })

    it("rejects empty worldId for teleport", () => {
      const service = new MetaverseService()
      const error = service.validate("teleport", {
        ...validTeleportParams,
        worldId: "",
      })
      expect(error).toBe("World ID is required")
    })

    it("accepts valid teleport params", () => {
      const service = new MetaverseService()
      const error = service.validate("teleport", validTeleportParams)
      expect(error).toBeNull()
    })
  })

  describe("exploreWorld (simulation)", () => {
    it("progresses through 4 steps in order", async () => {
      const steps: MetaverseStep[] = []
      const service = new MetaverseService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.exploreWorld(validExploreParams)

      expect(steps).toEqual([
        "selecting_world",
        "generating_stealth_avatar",
        "entering_world",
        "entered",
      ])
      expect(result.status).toBe("entered")
    })

    it("sets world title and category on result", async () => {
      const service = new MetaverseService({ mode: "simulation" })
      const result = await service.exploreWorld(validExploreParams)

      expect(result.worldTitle).toBe("Crypto Gallery")
      expect(result.category).toBe("gallery")
      expect(result.type).toBe("explore")
    })

    it("generates commitment hash and stealth address", async () => {
      const service = new MetaverseService({ mode: "simulation" })
      const result = await service.exploreWorld(validExploreParams)

      expect(result.commitmentHash).toBeTruthy()
      expect(result.commitmentHash).toMatch(/^0x/)
      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
    })
  })

  describe("teleport (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: MetaverseStep[] = []
      const service = new MetaverseService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.teleport(validTeleportParams)

      expect(steps).toEqual(["generating_proof", "teleporting", "arrived"])
      expect(result.status).toBe("arrived")
    })

    it("generates stealth address for teleport", async () => {
      const service = new MetaverseService({ mode: "simulation" })
      const result = await service.teleport(validTeleportParams)

      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
      expect(result.teleportVerified).toBe(true)
    })

    it("records step timestamps", async () => {
      const service = new MetaverseService({ mode: "simulation" })
      const result = await service.teleport(validTeleportParams)

      expect(result.stepTimestamps.generating_proof).toBeDefined()
      expect(result.stepTimestamps.teleporting).toBeDefined()
      expect(result.stepTimestamps.arrived).toBeDefined()
    })
  })
})
