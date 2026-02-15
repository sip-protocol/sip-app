import { describe, it, expect, vi, beforeEach } from "vitest"
import { TicketingService } from "@/lib/ticketing/ticketing-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type {
  TicketingStep,
  PurchaseTicketParams,
  VerifyTicketParams,
} from "@/lib/ticketing/types"

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

const validPurchaseParams: PurchaseTicketParams = {
  eventId: "event-solana-breakpoint",
  tier: "vip",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validVerifyParams: VerifyTicketParams = {
  eventId: "event-solana-breakpoint",
  tier: "vip",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("TicketingService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects empty eventId for purchase", () => {
      const service = new TicketingService()
      const error = service.validate("purchase", {
        ...validPurchaseParams,
        eventId: "",
      })
      expect(error).toBe("Event ID is required")
    })

    it("rejects unknown event for purchase", () => {
      const service = new TicketingService()
      const error = service.validate("purchase", {
        ...validPurchaseParams,
        eventId: "nonexistent",
      })
      expect(error).toBe("Event not found")
    })

    it("rejects empty tier for purchase", () => {
      const service = new TicketingService()
      const error = service.validate("purchase", {
        ...validPurchaseParams,
        tier: "" as never,
      })
      expect(error).toBe("Ticket tier is required")
    })

    it("accepts valid purchase params", () => {
      const service = new TicketingService()
      const error = service.validate("purchase", validPurchaseParams)
      expect(error).toBeNull()
    })

    it("rejects empty eventId for verify", () => {
      const service = new TicketingService()
      const error = service.validate("verify", {
        ...validVerifyParams,
        eventId: "",
      })
      expect(error).toBe("Event ID is required")
    })

    it("accepts valid verify params", () => {
      const service = new TicketingService()
      const error = service.validate("verify", validVerifyParams)
      expect(error).toBeNull()
    })
  })

  describe("purchaseTicket (simulation)", () => {
    it("progresses through 4 steps in order", async () => {
      const steps: TicketingStep[] = []
      const service = new TicketingService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      expect(steps).toEqual([
        "selecting_event",
        "generating_stealth_ticket",
        "purchasing",
        "purchased",
      ])
      expect(result.status).toBe("purchased")
    })

    it("sets event title and category on result", async () => {
      const service = new TicketingService({ mode: "simulation" })
      const result = await service.purchaseTicket(validPurchaseParams)

      expect(result.eventTitle).toBe("Solana Breakpoint")
      expect(result.category).toBe("conference")
      expect(result.type).toBe("purchase")
    })

    it("generates commitment hash and stealth address", async () => {
      const service = new TicketingService({ mode: "simulation" })
      const result = await service.purchaseTicket(validPurchaseParams)

      expect(result.commitmentHash).toBeTruthy()
      expect(result.commitmentHash).toMatch(/^0x/)
      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
    })
  })

  describe("verifyTicket (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: TicketingStep[] = []
      const service = new TicketingService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.verifyTicket(validVerifyParams)

      expect(steps).toEqual([
        "generating_proof",
        "verifying_attendance",
        "verified",
      ])
      expect(result.status).toBe("verified")
    })

    it("generates stealth address for verification", async () => {
      const service = new TicketingService({ mode: "simulation" })
      const result = await service.verifyTicket(validVerifyParams)

      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
      expect(result.attendanceVerified).toBe(true)
    })

    it("records step timestamps", async () => {
      const service = new TicketingService({ mode: "simulation" })
      const result = await service.verifyTicket(validVerifyParams)

      expect(result.stepTimestamps.generating_proof).toBeDefined()
      expect(result.stepTimestamps.verifying_attendance).toBeDefined()
      expect(result.stepTimestamps.verified).toBeDefined()
    })
  })
})
