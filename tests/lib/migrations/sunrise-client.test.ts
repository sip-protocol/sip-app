import { describe, it, expect, vi, beforeEach } from "vitest"
import { GSOL_MINT, SUNRISE_PROGRAM_ID } from "@/lib/migrations/constants"

// Use vi.hoisted so mock fns are available inside the hoisted vi.mock factory
const { mockGetTokenSupply, mockGetBalance } = vi.hoisted(() => ({
  mockGetTokenSupply: vi.fn(),
  mockGetBalance: vi.fn(),
}))

// Mock @solana/web3.js — prevent real RPC calls in tests
vi.mock("@solana/web3.js", () => {
  const LAMPORTS_PER_SOL = 1_000_000_000

  class MockPublicKey {
    private _key: string
    constructor(key: string) {
      this._key = key
    }
    toBase58() {
      return this._key
    }
    toString() {
      return this._key
    }
  }

  class MockConnection {
    getTokenSupply = mockGetTokenSupply
    getBalance = mockGetBalance
  }

  return {
    Connection: MockConnection,
    PublicKey: MockPublicKey,
    LAMPORTS_PER_SOL,
  }
})

// Import after mock setup
import { SunriseClient } from "@/lib/migrations/sunrise-client"

describe("SunriseClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset to default successful responses
    mockGetTokenSupply.mockResolvedValue({
      value: {
        amount: "85432000000000",
        decimals: 9,
        uiAmount: 85432.0,
        uiAmountString: "85432",
      },
    })
    mockGetBalance.mockResolvedValue(2_500_000_000)
  })

  describe("constructor", () => {
    it("defaults to simulation mode", () => {
      const client = new SunriseClient()
      expect(client).toBeDefined()
    })

    it("accepts simulation mode", () => {
      const client = new SunriseClient("simulation")
      expect(client).toBeDefined()
    })

    it("accepts devnet mode", () => {
      const client = new SunriseClient("devnet")
      expect(client).toBeDefined()
    })

    it("accepts mainnet mode", () => {
      const client = new SunriseClient("mainnet")
      expect(client).toBeDefined()
    })
  })

  describe("estimateCarbonOffset", () => {
    it("returns correct offset for 1 SOL", () => {
      const client = new SunriseClient()
      const offset = client.estimateCarbonOffset(1)
      expect(offset).toBe(0.012)
    })

    it("returns correct offset for 100 SOL", () => {
      const client = new SunriseClient()
      const offset = client.estimateCarbonOffset(100)
      expect(offset).toBe(1.2)
    })

    it("returns 0 for 0 SOL", () => {
      const client = new SunriseClient()
      const offset = client.estimateCarbonOffset(0)
      expect(offset).toBe(0)
    })

    it("handles fractional SOL amounts", () => {
      const client = new SunriseClient()
      const offset = client.estimateCarbonOffset(0.5)
      expect(offset).toBeCloseTo(0.006)
    })
  })

  describe("getDetails (simulation mode)", () => {
    it("returns simulation data with correct gSOL mint", async () => {
      const client = new SunriseClient("simulation")
      const details = await client.getDetails()

      expect(details.gsolMint).toBe(GSOL_MINT)
      expect(details.source).toBe("simulation")
      expect(details.sunriseProgramId).toBe(SUNRISE_PROGRAM_ID)
      expect(details.sunriseUrl).toBe("https://www.sunrisestake.com")
    })

    it("returns realistic TVL and APY", async () => {
      const client = new SunriseClient("simulation")
      const details = await client.getDetails()

      expect(details.tvl).toBe(125_000)
      expect(details.apy).toBe(7.2)
      expect(details.gsolSupply).toBe(125_000)
    })

    it("returns simulation holding balance as 0", async () => {
      const client = new SunriseClient("simulation")
      const details = await client.getDetails()

      expect(details.holdingBalance).toBe(0)
    })

    it("does not call RPC in simulation mode", async () => {
      const client = new SunriseClient("simulation")
      await client.getDetails()

      expect(mockGetTokenSupply).not.toHaveBeenCalled()
      expect(mockGetBalance).not.toHaveBeenCalled()
    })
  })

  describe("getDetails (devnet/mainnet mode)", () => {
    it("fetches on-chain gSOL supply in devnet mode", async () => {
      const client = new SunriseClient("devnet")
      const details = await client.getDetails()

      expect(details.source).toBe("on-chain")
      expect(details.gsolSupply).toBe(85432.0)
      expect(details.tvl).toBe(85432.0) // TVL = gSOL supply
      expect(details.gsolMint).toBe(GSOL_MINT)
    })

    it("fetches on-chain data in mainnet mode", async () => {
      const client = new SunriseClient("mainnet")
      const details = await client.getDetails()

      expect(details.source).toBe("on-chain")
      expect(details.gsolSupply).toBe(85432.0)
      expect(details.holdingBalance).toBe(2.5) // 2_500_000_000 / LAMPORTS_PER_SOL
    })

    it("calls getTokenSupply and getBalance", async () => {
      const client = new SunriseClient("mainnet")
      await client.getDetails()

      expect(mockGetTokenSupply).toHaveBeenCalledTimes(1)
      // getBalance called twice: holding + state accounts
      expect(mockGetBalance).toHaveBeenCalledTimes(2)
    })

    it("includes Sunrise metadata in on-chain response", async () => {
      const client = new SunriseClient("mainnet")
      const details = await client.getDetails()

      expect(details.sunriseProgramId).toBe(SUNRISE_PROGRAM_ID)
      expect(details.sunriseUrl).toBe("https://www.sunrisestake.com")
      expect(details.apy).toBe(7.2)
    })

    it("caches on-chain results on subsequent calls", async () => {
      const client = new SunriseClient("mainnet")

      await client.getDetails()
      await client.getDetails()

      // Only fetched once due to cache
      expect(mockGetTokenSupply).toHaveBeenCalledTimes(1)
    })

    it("falls back to simulation on RPC error", async () => {
      mockGetTokenSupply.mockRejectedValueOnce(new Error("RPC timeout"))
      mockGetBalance.mockRejectedValueOnce(new Error("RPC timeout"))

      const client = new SunriseClient("mainnet")
      const details = await client.getDetails()

      expect(details.source).toBe("simulation")
      expect(details.tvl).toBe(125_000)
    })

    it("uses holding + state balance as TVL when gSOL supply is 0", async () => {
      mockGetTokenSupply.mockResolvedValueOnce({
        value: {
          amount: "0",
          decimals: 9,
          uiAmount: 0,
          uiAmountString: "0",
        },
      })
      mockGetBalance.mockResolvedValue(5_000_000_000) // 5 SOL each

      const client = new SunriseClient("mainnet")
      const details = await client.getDetails()

      // When gSOL supply is 0, TVL = holding + state balances
      expect(details.source).toBe("on-chain")
      expect(details.tvl).toBe(10) // 5 SOL (holding) + 5 SOL (state)
    })
  })

  describe("deposit (simulation mode)", () => {
    it("returns 1:1 gSOL amount", async () => {
      const client = new SunriseClient("simulation")
      const result = await client.deposit("5.0", "mock-address")

      expect(result.gsolAmount).toBe("5.0000")
    })

    it("calculates carbon offset", async () => {
      const client = new SunriseClient("simulation")
      const result = await client.deposit("100", "mock-address")

      expect(result.carbonOffsetKg).toBe(1.2) // 100 * 0.012
    })

    it("generates 88-char transaction hash", async () => {
      const client = new SunriseClient("simulation")
      const result = await client.deposit("1", "mock-address")

      expect(result.txHash).toHaveLength(88)
      expect(result.txHash).toMatch(/^[A-Za-z0-9]+$/)
    })

    it("handles fractional SOL amounts", async () => {
      const client = new SunriseClient("simulation")
      const result = await client.deposit("0.5", "mock-address")

      expect(result.gsolAmount).toBe("0.5000")
      expect(result.carbonOffsetKg).toBeCloseTo(0.006)
    })

    it("does not call RPC in simulation mode", async () => {
      const client = new SunriseClient("simulation")
      await client.deposit("1", "mock-address")

      expect(mockGetTokenSupply).not.toHaveBeenCalled()
    })
  })

  describe("deposit (devnet/mainnet mode)", () => {
    it("uses on-chain context for deposit calculation", async () => {
      const client = new SunriseClient("mainnet")
      const result = await client.deposit("10", "mock-address")

      expect(result.gsolAmount).toBe("10.0000")
      expect(result.carbonOffsetKg).toBeCloseTo(0.12)
      expect(result.txHash).toHaveLength(88)
    })

    it("falls back to simulation on RPC error during deposit", async () => {
      mockGetTokenSupply.mockRejectedValueOnce(new Error("Network error"))
      mockGetBalance.mockRejectedValueOnce(new Error("Network error"))

      const client = new SunriseClient("mainnet")
      const result = await client.deposit("5", "mock-address")

      // Should still return valid deposit data via simulation fallback
      expect(result.gsolAmount).toBe("5.0000")
      expect(result.txHash).toHaveLength(88)
    })
  })

  describe("SunriseDetails interface completeness", () => {
    it("simulation details include all required fields", async () => {
      const client = new SunriseClient("simulation")
      const details = await client.getDetails()

      expect(details).toHaveProperty("gsolMint")
      expect(details).toHaveProperty("tvl")
      expect(details).toHaveProperty("apy")
      expect(details).toHaveProperty("gsolSupply")
      expect(details).toHaveProperty("holdingBalance")
      expect(details).toHaveProperty("source")
      expect(details).toHaveProperty("sunriseProgramId")
      expect(details).toHaveProperty("sunriseUrl")
    })

    it("on-chain details include all required fields", async () => {
      const client = new SunriseClient("mainnet")
      const details = await client.getDetails()

      expect(details).toHaveProperty("gsolMint")
      expect(details).toHaveProperty("tvl")
      expect(details).toHaveProperty("apy")
      expect(details).toHaveProperty("gsolSupply")
      expect(details).toHaveProperty("holdingBalance")
      expect(details).toHaveProperty("source")
      expect(details).toHaveProperty("sunriseProgramId")
      expect(details).toHaveProperty("sunriseUrl")
    })
  })
})
