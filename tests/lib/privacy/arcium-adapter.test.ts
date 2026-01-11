import { describe, it, expect, beforeEach } from "vitest"
import { ArciumAdapter } from "@/lib/privacy/backends/arcium"
import { TOKENS } from "@/lib/privacy/types"
import { PrivacyLevel } from "@sip-protocol/types"
import type { TransferEvent, QuoteParams, TransferParams } from "@/lib/privacy/types"

describe("ArciumAdapter", () => {
  let adapter: ArciumAdapter

  beforeEach(() => {
    adapter = new ArciumAdapter({
      network: "devnet",
      simulate: true,
    })
  })

  describe("constructor", () => {
    it("should create with default config", () => {
      const defaultAdapter = new ArciumAdapter()
      expect(defaultAdapter.name).toBe("arcium")
      expect(defaultAdapter.displayName).toBe("Arcium")
    })

    it("should accept custom network config", () => {
      const mainnetAdapter = new ArciumAdapter({ network: "mainnet" })
      expect(mainnetAdapter.name).toBe("arcium")
    })
  })

  describe("features", () => {
    it("should have correct feature flags for MPC computation", () => {
      expect(adapter.features.amountHiding).toBe(true) // MPC-encrypted amounts
      expect(adapter.features.recipientHiding).toBe(false) // C-SPL keeps recipients public
      expect(adapter.features.viewingKeys).toBe(false) // No native viewing keys
      expect(adapter.features.sameChainOnly).toBe(true)
      expect(adapter.features.privacyModel).toBe("mpc")
    })

    it("should indicate moderate latency due to MPC rounds", () => {
      // ~3 seconds for MPC rounds
      expect(adapter.features.averageLatencyMs).toBe(3000)
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

      expect(quote.id).toMatch(/^arcium-quote-/)
      expect(quote.backend).toBe("arcium")
      expect(quote.inputAmount).toBe(BigInt(1_000_000_000))
      expect(quote.outputAmount).toBeLessThan(quote.inputAmount)
      expect(quote.feeAmount).toBeGreaterThan(BigInt(0))
      expect(quote.feePercent).toBe(0.2)
      expect(quote.isValid).toBe(true)
      expect(quote.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it("should estimate completion time for MPC rounds", async () => {
      const quote = await adapter.getQuote(baseQuoteParams)

      // Arcium MPC requires ~3 seconds
      expect(quote.estimatedTimeSeconds).toBe(3)
    })

    it("should calculate fee correctly (0.2% + base fee)", async () => {
      const quote = await adapter.getQuote(baseQuoteParams)

      // 0.2% of 1 SOL = 2,000,000 lamports
      // + 10,000 lamports base fee
      // = 2,010,000 lamports total
      const expectedFee = BigInt(2_000_000) + BigInt(10_000)
      expect(quote.feeAmount).toBe(expectedFee)
    })

    it("should include Arcium-specific metadata", async () => {
      const quote = await adapter.getQuote(baseQuoteParams)

      expect(quote.metadata).toBeDefined()
      expect(quote.metadata?.computationType).toBe("MPC")
      expect(quote.metadata?.mxeClusterUrl).toBeDefined()
      expect(quote.metadata?.confidentialToken).toBe(true)
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
      expect(result.commitment).toMatch(/^0x[0-9a-f]{64}$/)
      // C-SPL keeps recipient public
      expect(result.stealthAddress).toBe("recipient-address")
    })

    it("should include Arcium-specific metadata", async () => {
      const result = await adapter.transfer(transferParams)

      expect(result.metadata).toBeDefined()
      expect(result.metadata?.encryptedAmount).toBeDefined()
      expect(result.metadata?.mpcComputed).toBe(true)
      expect(result.metadata?.mxeClusterUrl).toBeDefined()
      expect(result.metadata?.confidentialTokenStandard).toBe("C-SPL")
      expect(result.metadata?.mpcRounds).toBe(3)
    })

    it("should emit events during transfer including MPC rounds", async () => {
      const events: TransferEvent[] = []
      const onEvent = (event: TransferEvent) => events.push(event)

      await adapter.transfer(transferParams, onEvent)

      // Should have emitted multiple events
      expect(events.length).toBeGreaterThanOrEqual(10)

      // Should have status change events
      const statusChanges = events.filter((e) => e.type === "status_change")
      expect(statusChanges.length).toBeGreaterThanOrEqual(9)

      // Check for key status transitions
      const statuses = statusChanges.map((e) => e.status)
      expect(statuses).toContain("pending")
      expect(statuses).toContain("signing")
      expect(statuses).toContain("processing") // MPC processing
      expect(statuses).toContain("confirming")
      expect(statuses).toContain("success")

      // Should show MPC rounds in processing events
      const processingEvents = statusChanges.filter((e) => e.status === "processing")
      expect(processingEvents.length).toBeGreaterThanOrEqual(4) // Initial + 3 rounds

      // Should have proof_generated event (MPC computation)
      const proofGenerated = events.find((e) => e.type === "proof_generated")
      expect(proofGenerated).toBeDefined()
      expect(proofGenerated?.data?.proofType).toBe("mpc_computation")

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
    it("should return empty array (amounts encrypted, needs decryption)", async () => {
      const payments = await adapter.scanPayments("any-viewing-key")
      expect(payments).toEqual([])
    })
  })

  describe("getBalance", () => {
    it("should return zero (encrypted balance requires MXE decryption)", async () => {
      const balance = await adapter.getBalance("any-address")
      expect(balance).toBe(BigInt(0))
    })
  })

  describe("generateStealthAddress", () => {
    it("should return input address (C-SPL keeps recipients public)", async () => {
      const address = await adapter.generateStealthAddress("my-public-key")
      // Arcium C-SPL doesn't hide recipients, so returns input address
      expect(address).toBe("my-public-key")
    })
  })
})
