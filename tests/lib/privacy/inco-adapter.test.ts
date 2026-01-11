import { describe, it, expect, beforeEach } from "vitest"
import { IncoAdapter } from "@/lib/privacy/backends/inco"
import { TOKENS } from "@/lib/privacy/types"
import { PrivacyLevel } from "@sip-protocol/types"
import type { TransferEvent, QuoteParams, TransferParams } from "@/lib/privacy/types"

describe("IncoAdapter", () => {
  let adapter: IncoAdapter

  beforeEach(() => {
    adapter = new IncoAdapter({
      network: "devnet",
      simulate: true,
    })
  })

  describe("constructor", () => {
    it("should create with default config", () => {
      const defaultAdapter = new IncoAdapter()
      expect(defaultAdapter.name).toBe("inco")
      expect(defaultAdapter.displayName).toBe("Inco Lightning")
    })

    it("should accept custom network config", () => {
      const mainnetAdapter = new IncoAdapter({ network: "mainnet" })
      expect(mainnetAdapter.name).toBe("inco")
    })
  })

  describe("features", () => {
    it("should have correct feature flags for TEE encryption", () => {
      expect(adapter.features.amountHiding).toBe(true) // TEE encryption
      expect(adapter.features.recipientHiding).toBe(true) // Can encrypt recipient
      expect(adapter.features.viewingKeys).toBe(false) // No native viewing keys
      expect(adapter.features.sameChainOnly).toBe(true)
      expect(adapter.features.privacyModel).toBe("encryption")
    })

    it("should indicate fast latency due to TEE processing", () => {
      // ~2 seconds average
      expect(adapter.features.averageLatencyMs).toBe(2000)
    })
  })

  describe("getStatus", () => {
    it("should return available status in simulation mode", async () => {
      const status = await adapter.getStatus()
      expect(status.available).toBe(true)
      expect(status.network).toBe("devnet")
      expect(status.error).toBeUndefined()
      expect(status.latencyMs).toBeDefined()
      expect(status.lastChecked).toBeInstanceOf(Date)
    })
  })

  describe("isAvailable", () => {
    it("should return true in simulation mode", async () => {
      expect(await adapter.isAvailable()).toBe(true)
    })
  })

  describe("getQuote", () => {
    const baseQuoteParams: QuoteParams = {
      fromToken: TOKENS.SOL,
      toToken: TOKENS.SOL,
      amount: BigInt(1_000_000_000), // 1 SOL
      privacyLevel: PrivacyLevel.SHIELDED,
    }

    it("should return a valid quote for 1 SOL", async () => {
      const quote = await adapter.getQuote(baseQuoteParams)

      expect(quote.id).toMatch(/^inco-quote-/)
      expect(quote.backend).toBe("inco")
      expect(quote.inputAmount).toBe(BigInt(1_000_000_000))
      expect(quote.outputAmount).toBeLessThan(quote.inputAmount)
      expect(quote.feeAmount).toBeGreaterThan(BigInt(0))
      expect(quote.feePercent).toBe(0.1)
      expect(quote.isValid).toBe(true)
      expect(quote.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it("should estimate fast completion time", async () => {
      const quote = await adapter.getQuote(baseQuoteParams)

      // Inco is fast - ~2 seconds
      expect(quote.estimatedTimeSeconds).toBe(2)
    })

    it("should calculate fee correctly (0.1% + base fee)", async () => {
      const quote = await adapter.getQuote(baseQuoteParams)

      // 0.1% of 1 SOL = 1,000,000 lamports
      // + 5,000 lamports base fee
      // = 1,005,000 lamports total
      const expectedFee = BigInt(1_000_000) + BigInt(5_000)
      expect(quote.feeAmount).toBe(expectedFee)
    })

    it("should include Inco-specific metadata", async () => {
      const quote = await adapter.getQuote(baseQuoteParams)

      expect(quote.metadata).toBeDefined()
      expect(quote.metadata?.encryptionType).toBe("TEE")
      expect(quote.metadata?.gatewayUrl).toBeDefined()
    })
  })

  describe("transfer", () => {
    const transferParams: TransferParams = {
      fromToken: TOKENS.SOL,
      toToken: TOKENS.SOL,
      amount: BigInt(1_000_000_000), // 1 SOL
      privacyLevel: PrivacyLevel.SHIELDED,
      sender: "sender-address",
      recipient: "recipient-address",
    }

    it("should complete simulated transfer successfully", async () => {
      const result = await adapter.transfer(transferParams)

      expect(result.status).toBe("success")
      expect(result.txHash).toBeDefined()
      expect(result.txHash).toHaveLength(64)
      expect(result.explorerUrl).toContain("explorer.solana.com")
      expect(result.explorerUrl).toContain("devnet")
      expect(result.stealthAddress).toBeDefined()
    })

    it("should include Inco-specific metadata", async () => {
      const result = await adapter.transfer(transferParams)

      expect(result.metadata).toBeDefined()
      expect(result.metadata?.encryptedAmount).toBeDefined()
      expect(result.metadata?.encryptedRecipient).toBeDefined()
      expect(result.metadata?.teeProcessed).toBe(true)
      expect(result.metadata?.gatewayUrl).toBeDefined()
    })

    it("should emit events during transfer", async () => {
      const events: TransferEvent[] = []
      const onEvent = (event: TransferEvent) => events.push(event)

      await adapter.transfer(transferParams, onEvent)

      // Should have emitted multiple events
      expect(events.length).toBeGreaterThanOrEqual(6)

      // Should have status change events
      const statusChanges = events.filter((e) => e.type === "status_change")
      expect(statusChanges.length).toBeGreaterThanOrEqual(6)

      // Check for key status transitions
      const statuses = statusChanges.map((e) => e.status)
      expect(statuses).toContain("pending")
      expect(statuses).toContain("signing")
      expect(statuses).toContain("processing") // TEE processing
      expect(statuses).toContain("confirming")
      expect(statuses).toContain("success")

      // Should have tx_submitted event
      const txSubmitted = events.find((e) => e.type === "tx_submitted")
      expect(txSubmitted).toBeDefined()

      // Should have tx_confirmed event
      const txConfirmed = events.find((e) => e.type === "tx_confirmed")
      expect(txConfirmed).toBeDefined()

      // All events should have timestamps
      for (const event of events) {
        expect(event.timestamp).toBeInstanceOf(Date)
      }
    })
  })

  describe("scanPayments", () => {
    it("should return empty array (requires access control setup)", async () => {
      const payments = await adapter.scanPayments("any-viewing-key")
      expect(payments).toEqual([])
    })
  })

  describe("getBalance", () => {
    it("should return zero (encrypted balance requires SDK)", async () => {
      const balance = await adapter.getBalance("any-address")
      expect(balance).toBe(BigInt(0))
    })
  })

  describe("generateStealthAddress", () => {
    it("should generate a Solana-compatible address", async () => {
      const address = await adapter.generateStealthAddress("meta-address")
      expect(address).toBeDefined()
      expect(address.length).toBeGreaterThan(30) // Base58 Solana addresses are ~44 chars
      // Should only contain valid base58 characters
      expect(address).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/)
    })

    it("should generate unique addresses each time", async () => {
      const addr1 = await adapter.generateStealthAddress("meta-address")
      const addr2 = await adapter.generateStealthAddress("meta-address")
      expect(addr1).not.toBe(addr2)
    })
  })
})
