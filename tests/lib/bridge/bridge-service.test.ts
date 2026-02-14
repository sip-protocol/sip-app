import { describe, it, expect, vi, beforeEach } from "vitest"
import { BridgeService } from "@/lib/bridge/bridge-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type { BridgeStep, BridgeParams } from "@/lib/bridge/types"

// Mock the stealth-bridge module
vi.mock("@/lib/bridge/stealth-bridge", () => ({
  generateBridgeStealthAddress: vi.fn().mockResolvedValue({
    stealthAddress: "sip:ethereum:0xstealth123",
    stealthMetaAddress: "sip:ethereum:0xspend:0xview",
    spendingPrivateKey: "0xspendkey",
    viewingPrivateKey: "0xviewkey",
    sharedSecret: "0xshared",
  }),
}))

const validParams: BridgeParams = {
  sourceChain: "solana",
  destChain: "ethereum",
  token: "USDC",
  amount: "100",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("BridgeService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects same source and dest chain", () => {
      const service = new BridgeService()
      const error = service.validate({
        ...validParams,
        destChain: "solana",
      })
      expect(error).toBe("Source and destination chains must be different")
    })

    it("rejects unsupported token for route", () => {
      const service = new BridgeService()
      const error = service.validate({
        ...validParams,
        token: "ETH",
      })
      expect(error).toBe("ETH is not supported on this route")
    })

    it("rejects zero amount", () => {
      const service = new BridgeService()
      const error = service.validate({
        ...validParams,
        amount: "0",
      })
      expect(error).toBe("Amount must be greater than 0")
    })

    it("rejects negative amount", () => {
      const service = new BridgeService()
      const error = service.validate({
        ...validParams,
        amount: "-5",
      })
      expect(error).toBe("Amount must be greater than 0")
    })

    it("rejects invalid amount string", () => {
      const service = new BridgeService()
      const error = service.validate({
        ...validParams,
        amount: "abc",
      })
      expect(error).toBe("Amount must be greater than 0")
    })

    it("accepts valid params", () => {
      const service = new BridgeService()
      const error = service.validate(validParams)
      expect(error).toBeNull()
    })

    it("accepts EVM to EVM route with ETH", () => {
      const service = new BridgeService()
      const error = service.validate({
        ...validParams,
        sourceChain: "ethereum",
        destChain: "base",
        token: "ETH",
      })
      expect(error).toBeNull()
    })
  })

  describe("executeBridge (simulation)", () => {
    it("progresses through all steps in order", async () => {
      const steps: BridgeStep[] = []
      const service = new BridgeService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.executeBridge(validParams)

      expect(steps).toEqual([
        "generating_stealth",
        "initiating_transfer",
        "awaiting_attestation",
        "relaying",
        "complete",
      ])
      expect(result.status).toBe("complete")
    })

    it("populates stealth address from SDK", async () => {
      const service = new BridgeService({ mode: "simulation" })
      const result = await service.executeBridge(validParams)

      expect(result.stealthAddress).toBe("sip:ethereum:0xstealth123")
      expect(result.stealthMetaAddress).toBe("sip:ethereum:0xspend:0xview")
    })

    it("generates source and dest tx hashes", async () => {
      const service = new BridgeService({ mode: "simulation" })
      const result = await service.executeBridge(validParams)

      expect(result.sourceTxHash).toBeTruthy()
      expect(result.sourceTxHash).toHaveLength(64)
      expect(result.destTxHash).toBeTruthy()
      expect(result.destTxHash).toHaveLength(64)
    })

    it("generates wormhole message ID", async () => {
      const service = new BridgeService({ mode: "simulation" })
      const result = await service.executeBridge(validParams)

      expect(result.wormholeMessageId).toBeTruthy()
      expect(result.wormholeMessageId).toContain("/")
    })

    it("records step timestamps", async () => {
      const service = new BridgeService({ mode: "simulation" })
      const result = await service.executeBridge(validParams)

      expect(result.stepTimestamps.generating_stealth).toBeDefined()
      expect(result.stepTimestamps.initiating_transfer).toBeDefined()
      expect(result.stepTimestamps.awaiting_attestation).toBeDefined()
      expect(result.stepTimestamps.relaying).toBeDefined()
      expect(result.stepTimestamps.complete).toBeDefined()
    })

    it("sets completedAt on success", async () => {
      const service = new BridgeService({ mode: "simulation" })
      const result = await service.executeBridge(validParams)

      expect(result.completedAt).toBeDefined()
      expect(result.completedAt).toBeGreaterThanOrEqual(result.startedAt)
    })

    it("sets transfer metadata correctly", async () => {
      const service = new BridgeService({ mode: "simulation" })
      const result = await service.executeBridge(validParams)

      expect(result.sourceChain).toBe("solana")
      expect(result.destChain).toBe("ethereum")
      expect(result.token).toBe("USDC")
      expect(result.amount).toBe("100")
      expect(result.privacyLevel).toBe("shielded")
      expect(result.id).toMatch(/^bridge_/)
    })

    it("throws on invalid params", async () => {
      const service = new BridgeService({ mode: "simulation" })

      await expect(
        service.executeBridge({ ...validParams, amount: "0" }),
      ).rejects.toThrow("Amount must be greater than 0")
    })
  })

  describe("executeBridge (ntt mode)", () => {
    it("throws not implemented error", async () => {
      const service = new BridgeService({ mode: "ntt" })

      await expect(service.executeBridge(validParams)).rejects.toThrow(
        "NTT mode is not yet implemented",
      )
    })
  })
})
