import { describe, it, expect, vi, beforeEach } from "vitest"
import { TicketingService } from "@/lib/ticketing/ticketing-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type {
  TicketingStep,
  PurchaseTicketParams,
  VerifyTicketParams,
} from "@/lib/ticketing/types"
import { Transaction } from "@solana/web3.js"

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

  describe("onCommitTransaction callback", () => {
    it("calls onCommitTransaction callback during purchasing step", async () => {
      const mockCallback = vi.fn().mockResolvedValue("mock-tx-signature")
      const service = new TicketingService({
        mode: "simulation",
        onCommitTransaction: mockCallback,
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      expect(mockCallback).toHaveBeenCalledWith(
        "event-solana-breakpoint",
        "vip"
      )
      expect(result.txSignature).toBe("mock-tx-signature")
    })

    it("does not set txSignature when callback returns null", async () => {
      const mockCallback = vi.fn().mockResolvedValue(null)
      const service = new TicketingService({
        mode: "simulation",
        onCommitTransaction: mockCallback,
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      expect(mockCallback).toHaveBeenCalled()
      expect(result.txSignature).toBeUndefined()
    })

    it("still completes the purchase when callback is provided", async () => {
      const mockCallback = vi.fn().mockResolvedValue("mock-sig")
      const steps: TicketingStep[] = []
      const service = new TicketingService({
        mode: "simulation",
        onCommitTransaction: mockCallback,
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
      expect(result.txSignature).toBe("mock-sig")
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

  describe("purchaseTicket (cNFT via Bubblegum)", () => {
    it("calls buildCNFTMint with correct stealth recipient", async () => {
      const mockTx = new Transaction()
      const buildCNFTMint = vi.fn().mockResolvedValue(mockTx)
      const onSendTransaction = vi.fn().mockResolvedValue("mock-tix-sig-abc123")

      const service = new TicketingService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      expect(buildCNFTMint).toHaveBeenCalledOnce()
      expect(buildCNFTMint).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: result.stealthAddress,
        })
      )
      expect(onSendTransaction).toHaveBeenCalledWith(mockTx)
      expect(result.txSignature).toBe("mock-tix-sig-abc123")
    })

    it("includes event name and tier in cNFT name", async () => {
      const buildCNFTMint = vi.fn().mockResolvedValue(new Transaction())
      const onSendTransaction = vi.fn().mockResolvedValue("sig-name-test")

      const service = new TicketingService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      await service.purchaseTicket(validPurchaseParams)

      // Event "Solana Breakpoint", tier "vip" -> "Solana Breakpoint — Vip"
      expect(buildCNFTMint).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining("Solana Breakpoint"),
        })
      )
      expect(buildCNFTMint).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining("Vip"),
        })
      )
    })

    it("falls back when buildCNFTMint returns null", async () => {
      const buildCNFTMint = vi.fn().mockResolvedValue(null)
      const onSendTransaction = vi.fn()

      const service = new TicketingService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      expect(buildCNFTMint).toHaveBeenCalledOnce()
      expect(onSendTransaction).not.toHaveBeenCalled()
      expect(result.status).toBe("purchased")
      expect(result.txSignature).toBeUndefined()
    })

    it("falls back when no onSendTransaction provided", async () => {
      const buildCNFTMint = vi.fn()
      const onSendTransaction = vi.fn()

      // Only buildCNFTMint set (no onSendTransaction), falls back
      const service = new TicketingService({
        mode: "simulation",
        buildCNFTMint,
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      // buildCNFTMint not called because onSendTransaction is missing
      expect(buildCNFTMint).not.toHaveBeenCalled()
      expect(onSendTransaction).not.toHaveBeenCalled()
      expect(result.status).toBe("purchased")
    })

    it("sets txSignature on successful cNFT mint", async () => {
      const mockTx = new Transaction()
      const buildCNFTMint = vi.fn().mockResolvedValue(mockTx)
      const onSendTransaction = vi.fn().mockResolvedValue("tix-cnft-sig-xyz")

      const service = new TicketingService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      expect(result.txSignature).toBe("tix-cnft-sig-xyz")
      expect(result.status).toBe("purchased")
      expect(result.stealthAddress).toBeTruthy()
    })

    it("does not set txSignature when onSendTransaction returns null", async () => {
      const mockTx = new Transaction()
      const buildCNFTMint = vi.fn().mockResolvedValue(mockTx)
      const onSendTransaction = vi.fn().mockResolvedValue(null)

      const service = new TicketingService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      expect(buildCNFTMint).toHaveBeenCalledOnce()
      expect(onSendTransaction).toHaveBeenCalledWith(mockTx)
      expect(result.txSignature).toBeUndefined()
    })

    it("includes metadataUri in cNFT mint call", async () => {
      const buildCNFTMint = vi.fn().mockResolvedValue(new Transaction())
      const onSendTransaction = vi.fn().mockResolvedValue("sig-uri-test")

      const service = new TicketingService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      await service.purchaseTicket(validPurchaseParams)

      expect(buildCNFTMint).toHaveBeenCalledWith(
        expect.objectContaining({
          metadataUri: expect.stringContaining("https://arweave.net/"),
        })
      )
    })

    it("records step timestamps with cNFT flow", async () => {
      const service = new TicketingService({
        mode: "simulation",
        buildCNFTMint: vi.fn().mockResolvedValue(new Transaction()),
        onSendTransaction: vi.fn().mockResolvedValue("sig-timestamps"),
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      expect(result.stepTimestamps.selecting_event).toBeDefined()
      expect(result.stepTimestamps.generating_stealth_ticket).toBeDefined()
      expect(result.stepTimestamps.purchasing).toBeDefined()
      expect(result.stepTimestamps.purchased).toBeDefined()
      expect(result.status).toBe("purchased")
    })

    it("falls back to onCommitTransaction when builder is not available", async () => {
      const mockCallback = vi.fn().mockResolvedValue("commit-fallback-sig")

      const service = new TicketingService({
        mode: "simulation",
        onCommitTransaction: mockCallback,
      })

      const result = await service.purchaseTicket(validPurchaseParams)

      expect(mockCallback).toHaveBeenCalledWith(
        "event-solana-breakpoint",
        "vip"
      )
      expect(result.txSignature).toBe("commit-fallback-sig")
    })
  })
})
