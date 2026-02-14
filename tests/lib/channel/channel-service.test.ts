import { describe, it, expect, vi, beforeEach } from "vitest"
import { ChannelService } from "@/lib/channel/channel-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type { ChannelStep, SubscribeParams, PublishDropParams } from "@/lib/channel/types"

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

const validSubscribeParams: SubscribeParams = {
  dropId: "drop-stealth-addresses",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validPublishParams: PublishDropParams = {
  title: "Test Drop",
  content: "Test content about privacy",
  contentType: "article",
  accessTier: "free",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("ChannelService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects empty dropId for subscribe", () => {
      const service = new ChannelService()
      const error = service.validate("subscribe", { ...validSubscribeParams, dropId: "" })
      expect(error).toBe("Drop ID is required")
    })

    it("rejects unknown drop for subscribe", () => {
      const service = new ChannelService()
      const error = service.validate("subscribe", { ...validSubscribeParams, dropId: "nonexistent" })
      expect(error).toBe("Drop not found")
    })

    it("accepts valid subscribe params", () => {
      const service = new ChannelService()
      const error = service.validate("subscribe", validSubscribeParams)
      expect(error).toBeNull()
    })

    it("rejects empty title for publish", () => {
      const service = new ChannelService()
      const error = service.validate("publish", { ...validPublishParams, title: "" })
      expect(error).toBe("Title is required")
    })

    it("rejects empty content for publish", () => {
      const service = new ChannelService()
      const error = service.validate("publish", { ...validPublishParams, content: "" })
      expect(error).toBe("Content is required")
    })
  })

  describe("subscribe (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: ChannelStep[] = []
      const service = new ChannelService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.subscribe(validSubscribeParams)

      expect(steps).toEqual(["selecting_channel", "subscribing", "subscribed"])
      expect(result.status).toBe("subscribed")
    })

    it("sets drop title on result", async () => {
      const service = new ChannelService({ mode: "simulation" })
      const result = await service.subscribe(validSubscribeParams)

      expect(result.dropTitle).toBe("What Are Stealth Addresses?")
      expect(result.type).toBe("subscribe")
    })
  })

  describe("publishDrop (simulation)", () => {
    it("progresses through 4 steps in order", async () => {
      const steps: ChannelStep[] = []
      const service = new ChannelService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.publishDrop(validPublishParams)

      expect(steps).toEqual([
        "encrypting_content",
        "generating_stealth",
        "publishing",
        "published",
      ])
      expect(result.status).toBe("published")
    })

    it("generates stealth address for drop", async () => {
      const service = new ChannelService({ mode: "simulation" })
      const result = await service.publishDrop(validPublishParams)

      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
      expect(result.title).toBe("Test Drop")
      expect(result.contentType).toBe("article")
    })

    it("records step timestamps", async () => {
      const service = new ChannelService({ mode: "simulation" })
      const result = await service.publishDrop(validPublishParams)

      expect(result.stepTimestamps.encrypting_content).toBeDefined()
      expect(result.stepTimestamps.generating_stealth).toBeDefined()
      expect(result.stepTimestamps.publishing).toBeDefined()
      expect(result.stepTimestamps.published).toBeDefined()
    })
  })
})
