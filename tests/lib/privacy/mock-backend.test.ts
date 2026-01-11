import { describe, it, expect, beforeEach } from "vitest"
import { MockBackend } from "@/lib/privacy/backends/mock"
import { TOKENS } from "@/lib/privacy/types"
import { PrivacyLevel } from "@sip-protocol/types"
import type { TransferEvent, QuoteParams, TransferParams } from "@/lib/privacy/types"

describe("MockBackend", () => {
  let backend: MockBackend

  beforeEach(() => {
    backend = new MockBackend({
      latencyMs: 10, // Fast for tests
      failureRate: 0,
      network: "devnet",
      available: true,
    })
  })

  describe("constructor", () => {
    it("should create with default config", () => {
      const defaultBackend = new MockBackend()
      expect(defaultBackend.name).toBe("mock")
      expect(defaultBackend.displayName).toBe("Mock Backend")
    })

    it("should accept custom config", () => {
      const customBackend = new MockBackend({
        latencyMs: 1000,
        failureRate: 0.5,
        network: "mainnet",
      })
      expect(customBackend.name).toBe("mock")
    })
  })

  describe("features", () => {
    it("should have correct feature flags", () => {
      expect(backend.features.amountHiding).toBe(true)
      expect(backend.features.recipientHiding).toBe(true)
      expect(backend.features.viewingKeys).toBe(true)
      expect(backend.features.sameChainOnly).toBe(true)
      expect(backend.features.privacyModel).toBe("cryptographic")
    })
  })

  describe("getStatus", () => {
    it("should return available status when configured as available", async () => {
      const status = await backend.getStatus()
      expect(status.available).toBe(true)
      expect(status.network).toBe("devnet")
      expect(status.error).toBeUndefined()
    })

    it("should return unavailable status when configured as unavailable", async () => {
      backend.configure({ available: false })
      const status = await backend.getStatus()
      expect(status.available).toBe(false)
      expect(status.error).toBeDefined()
    })
  })

  describe("isAvailable", () => {
    it("should return true when available", async () => {
      expect(await backend.isAvailable()).toBe(true)
    })

    it("should return false when unavailable", async () => {
      backend.configure({ available: false })
      expect(await backend.isAvailable()).toBe(false)
    })
  })

  describe("getQuote", () => {
    const quoteParams: QuoteParams = {
      fromToken: TOKENS.SOL,
      toToken: TOKENS.SOL,
      amount: BigInt(1e9), // 1 SOL
      privacyLevel: PrivacyLevel.SHIELDED,
    }

    it("should return a valid quote", async () => {
      const quote = await backend.getQuote(quoteParams)

      expect(quote.id).toMatch(/^mock-quote-/)
      expect(quote.backend).toBe("mock")
      expect(quote.inputAmount).toBe(BigInt(1e9))
      expect(quote.outputAmount).toBeLessThan(quote.inputAmount)
      expect(quote.feeAmount).toBeGreaterThan(BigInt(0))
      expect(quote.feePercent).toBe(0.3)
      expect(quote.isValid).toBe(true)
      expect(quote.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it("should calculate correct fee", async () => {
      const quote = await backend.getQuote(quoteParams)

      // Fee should be 0.3% = 3/1000
      const expectedFee = (BigInt(1e9) * BigInt(30)) / BigInt(10000)
      expect(quote.feeAmount).toBe(expectedFee)
      expect(quote.outputAmount).toBe(BigInt(1e9) - expectedFee)
    })

    it("should throw on simulated failure", async () => {
      backend.configure({ failureRate: 1 }) // 100% failure

      await expect(backend.getQuote(quoteParams)).rejects.toThrow(
        "simulated failure"
      )
    })
  })

  describe("transfer", () => {
    const transferParams: TransferParams = {
      fromToken: TOKENS.SOL,
      toToken: TOKENS.SOL,
      amount: BigInt(1e9),
      privacyLevel: PrivacyLevel.SHIELDED,
      sender: "sender-address",
      recipient: "recipient-address",
    }

    it("should complete transfer successfully", async () => {
      const result = await backend.transfer(transferParams)

      expect(result.status).toBe("success")
      expect(result.txHash).toBeDefined()
      expect(result.txHash).toHaveLength(64)
      expect(result.explorerUrl).toContain("explorer.solana.com")
      expect(result.stealthAddress).toBeDefined()
      expect(result.commitment).toBeDefined()
      expect(result.commitment).toMatch(/^0x[0-9a-f]{64}$/)
    })

    it("should emit events during transfer", async () => {
      const events: TransferEvent[] = []
      const onEvent = (event: TransferEvent) => events.push(event)

      await backend.transfer(transferParams, onEvent)

      // Should have emitted status change events
      const statusChanges = events.filter((e) => e.type === "status_change")
      expect(statusChanges.length).toBeGreaterThanOrEqual(3)

      // Should have pending -> signing -> confirming -> success
      const statuses = statusChanges.map((e) => e.status)
      expect(statuses).toContain("pending")
      expect(statuses).toContain("signing")
      expect(statuses).toContain("confirming")
      expect(statuses).toContain("success")

      // Should have tx_submitted event
      const txSubmitted = events.find((e) => e.type === "tx_submitted")
      expect(txSubmitted).toBeDefined()
      expect(txSubmitted?.txHash).toBeDefined()

      // Should have tx_confirmed event
      const txConfirmed = events.find((e) => e.type === "tx_confirmed")
      expect(txConfirmed).toBeDefined()

      // Should have proof_generated event for shielded
      const proofGenerated = events.find((e) => e.type === "proof_generated")
      expect(proofGenerated).toBeDefined()
    })

    it("should include viewing key for compliant transfers", async () => {
      const compliantParams: TransferParams = {
        ...transferParams,
        privacyLevel: PrivacyLevel.COMPLIANT,
        viewingKey: "test-viewing-key",
      }

      const result = await backend.transfer(compliantParams)

      expect(result.status).toBe("success")
      expect(result.viewingKey).toBe("test-viewing-key")
    })

    it("should not include viewing key for shielded transfers", async () => {
      const result = await backend.transfer(transferParams)

      expect(result.status).toBe("success")
      expect(result.viewingKey).toBeUndefined()
    })

    it("should return failed status on simulated failure", async () => {
      backend.configure({ failureRate: 1 })

      const events: TransferEvent[] = []
      const result = await backend.transfer(transferParams, (e) => events.push(e))

      expect(result.status).toBe("failed")
      expect(result.error).toContain("simulated failure")

      // Should have error event
      const errorEvent = events.find((e) => e.type === "error")
      expect(errorEvent).toBeDefined()
    })
  })

  describe("scanPayments", () => {
    it("should return empty array initially", async () => {
      const payments = await backend.scanPayments("viewing-key")
      expect(payments).toEqual([])
    })

    it("should return payments after transfer", async () => {
      // Execute a transfer first
      await backend.transfer({
        fromToken: TOKENS.SOL,
        toToken: TOKENS.SOL,
        amount: BigInt(1e9),
        privacyLevel: PrivacyLevel.SHIELDED,
        sender: "sender",
        recipient: "recipient",
      })

      const payments = await backend.scanPayments("viewing-key")
      expect(payments).toHaveLength(1)
      expect(payments[0].amount).toBe(BigInt(1e9))
      expect(payments[0].token.symbol).toBe("SOL")
    })

    it("should allow adding mock payments", async () => {
      backend.addMockPayment({
        id: "test-payment",
        amount: BigInt(5e8),
        token: TOKENS.USDC,
        stealthAddress: "stealth-addr",
        txHash: "0".repeat(64),
        timestamp: new Date(),
        claimed: false,
      })

      const payments = await backend.scanPayments("key")
      expect(payments).toHaveLength(1)
      expect(payments[0].id).toBe("test-payment")
    })

    it("should clear mock payments", async () => {
      backend.addMockPayment({
        id: "test",
        amount: BigInt(1),
        token: TOKENS.SOL,
        stealthAddress: "addr",
        txHash: "hash",
        timestamp: new Date(),
        claimed: false,
      })

      backend.clearMockPayments()
      const payments = await backend.scanPayments("key")
      expect(payments).toHaveLength(0)
    })
  })

  describe("getBalance", () => {
    it("should return a mock balance", async () => {
      const balance = await backend.getBalance("any-address")
      expect(balance).toBeGreaterThanOrEqual(BigInt(0))
    })
  })

  describe("generateStealthAddress", () => {
    it("should generate a stealth address", async () => {
      const address = await backend.generateStealthAddress("meta-address")
      expect(address).toBeDefined()
      expect(address.length).toBe(44) // Base58 Solana address length
    })
  })

  describe("configure", () => {
    it("should update configuration", async () => {
      backend.configure({ network: "mainnet" })
      const status = await backend.getStatus()
      expect(status.network).toBe("mainnet")
    })
  })
})
