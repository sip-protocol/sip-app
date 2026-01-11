import { describe, it, expect, beforeEach } from "vitest"
import { PrivacyCashAdapter } from "@/lib/privacy/backends/privacycash"
import { TOKENS } from "@/lib/privacy/types"
import { PrivacyLevel } from "@sip-protocol/types"
import type { TransferEvent, QuoteParams, TransferParams } from "@/lib/privacy/types"

describe("PrivacyCashAdapter", () => {
  let adapter: PrivacyCashAdapter

  beforeEach(() => {
    adapter = new PrivacyCashAdapter({
      network: "devnet",
      simulate: true,
    })
  })

  describe("constructor", () => {
    it("should create with default config", () => {
      const defaultAdapter = new PrivacyCashAdapter()
      expect(defaultAdapter.name).toBe("privacycash")
      expect(defaultAdapter.displayName).toBe("PrivacyCash")
    })

    it("should accept custom network config", () => {
      const mainnetAdapter = new PrivacyCashAdapter({ network: "mainnet" })
      expect(mainnetAdapter.name).toBe("privacycash")
    })
  })

  describe("features", () => {
    it("should have correct feature flags for pool mixing", () => {
      expect(adapter.features.amountHiding).toBe(false) // Pool sizes are public
      expect(adapter.features.recipientHiding).toBe(true) // Pool breaks link
      expect(adapter.features.viewingKeys).toBe(false) // No compliance
      expect(adapter.features.sameChainOnly).toBe(true)
      expect(adapter.features.privacyModel).toBe("statistical")
    })

    it("should indicate high latency due to pool waiting", () => {
      // 1 hour average wait time for anonymity set
      expect(adapter.features.averageLatencyMs).toBe(3600000)
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

      expect(quote.id).toMatch(/^privacycash-quote-/)
      expect(quote.backend).toBe("privacycash")
      expect(quote.inputAmount).toBe(BigInt(1_000_000_000))
      expect(quote.outputAmount).toBeLessThan(quote.inputAmount)
      expect(quote.feeAmount).toBeGreaterThan(BigInt(0))
      expect(quote.feePercent).toBe(0.35)
      expect(quote.isValid).toBe(true)
      expect(quote.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it("should match to appropriate pool size", async () => {
      const quote = await adapter.getQuote(baseQuoteParams)

      // 1 SOL should match the 1 SOL pool
      expect(quote.metadata?.poolSize).toBe("1000000000")
    })

    it("should calculate fee correctly (0.35% + 0.006 SOL base)", async () => {
      const quote = await adapter.getQuote(baseQuoteParams)

      // 0.35% of 1 SOL = 3,500,000 lamports
      // + 6,000,000 lamports base fee
      // = 9,500,000 lamports total
      const expectedFee = BigInt(3_500_000) + BigInt(6_000_000)
      expect(quote.feeAmount).toBe(expectedFee)
    })

    it("should throw for amount below minimum pool size", async () => {
      const smallParams: QuoteParams = {
        ...baseQuoteParams,
        amount: BigInt(10_000_000), // 0.01 SOL - below 0.1 SOL minimum
      }

      await expect(adapter.getQuote(smallParams)).rejects.toThrow(
        "below minimum pool size"
      )
    })

    it("should add warning when amount exceeds pool size", async () => {
      const largeParams: QuoteParams = {
        ...baseQuoteParams,
        amount: BigInt(1_500_000_000), // 1.5 SOL - between 1 and 10 SOL pools
      }

      const quote = await adapter.getQuote(largeParams)

      // Should use 1 SOL pool, leaving 0.5 SOL remainder
      expect(quote.metadata?.poolSize).toBe("1000000000")
      expect(quote.metadata?.warnings).toBeDefined()
    })

    it("should handle USDC quotes with different pool sizes", async () => {
      const usdcParams: QuoteParams = {
        ...baseQuoteParams,
        fromToken: TOKENS.USDC,
        toToken: TOKENS.USDC,
        amount: BigInt(1_000_000_000), // 1000 USDC
      }

      const quote = await adapter.getQuote(usdcParams)

      expect(quote.backend).toBe("privacycash")
      expect(quote.metadata?.poolSize).toBe("1000000000") // 1000 USDC pool
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
      expect(result.stealthAddress).toBe("recipient-address")
    })

    it("should include PrivacyCash-specific metadata", async () => {
      const result = await adapter.transfer(transferParams)

      expect(result.metadata).toBeDefined()
      expect(result.metadata?.depositTxHash).toBeDefined()
      expect(result.metadata?.poolSize).toBe("1000000000")
      expect(result.metadata?.outputAmount).toBeDefined()
      expect(result.metadata?.fee).toBeDefined()
      expect(result.metadata?.anonymitySet).toBe(100)
    })

    it("should emit events during transfer", async () => {
      const events: TransferEvent[] = []
      const onEvent = (event: TransferEvent) => events.push(event)

      await adapter.transfer(transferParams, onEvent)

      // Should have emitted multiple events
      expect(events.length).toBeGreaterThanOrEqual(6)

      // Should have status change events
      const statusChanges = events.filter((e) => e.type === "status_change")
      expect(statusChanges.length).toBeGreaterThanOrEqual(5)

      // Check for key status transitions
      const statuses = statusChanges.map((e) => e.status)
      expect(statuses).toContain("signing")
      expect(statuses).toContain("confirming")
      expect(statuses).toContain("success")

      // Should have tx_submitted events (deposit + withdrawal)
      const txSubmitted = events.filter((e) => e.type === "tx_submitted")
      expect(txSubmitted.length).toBeGreaterThanOrEqual(2)

      // Should have proof_generated event
      const proofGenerated = events.find((e) => e.type === "proof_generated")
      expect(proofGenerated).toBeDefined()

      // All events should have timestamps
      for (const event of events) {
        expect(event.timestamp).toBeInstanceOf(Date)
      }
    })

    it("should fail for amount below minimum pool size", async () => {
      const smallParams: TransferParams = {
        ...transferParams,
        amount: BigInt(10_000_000), // 0.01 SOL
      }

      const result = await adapter.transfer(smallParams)

      expect(result.status).toBe("failed")
      expect(result.error).toContain("below minimum pool size")
    })
  })

  describe("scanPayments", () => {
    it("should return empty array (not supported)", async () => {
      const payments = await adapter.scanPayments("any-viewing-key")
      expect(payments).toEqual([])
    })
  })

  describe("getBalance", () => {
    it("should return zero (requires off-chain tracking)", async () => {
      const balance = await adapter.getBalance("any-address")
      expect(balance).toBe(BigInt(0))
    })
  })

  describe("generateStealthAddress", () => {
    it("should throw (not supported by PrivacyCash)", async () => {
      await expect(adapter.generateStealthAddress("meta")).rejects.toThrow(
        "does not support stealth addresses"
      )
    })
  })

  describe("getPoolSizes", () => {
    it("should return SOL pool sizes", () => {
      const pools = adapter.getPoolSizes(TOKENS.SOL)
      expect(pools).toHaveLength(4)
      expect(pools[0]).toBe(BigInt(100_000_000)) // 0.1 SOL
      expect(pools[3]).toBe(BigInt(100_000_000_000)) // 100 SOL
    })

    it("should return USDC/USDT pool sizes", () => {
      const pools = adapter.getPoolSizes(TOKENS.USDC)
      expect(pools).toHaveLength(4)
      expect(pools[0]).toBe(BigInt(100_000_000)) // 100 USDC
      expect(pools[3]).toBe(BigInt(100_000_000_000)) // 100,000 USDC
    })
  })

  describe("getProgramId", () => {
    it("should return PrivacyCash program ID", () => {
      const programId = adapter.getProgramId()
      expect(programId).toBe("9fhQBbumKEFuXtMBDw8AaQyAjCorLGJQiS3skWZdQyQD")
    })
  })
})
