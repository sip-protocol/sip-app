import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { DripReader } from "@/lib/channel/drip-reader"
import { SAMPLE_DROPS } from "@/lib/channel/constants"

// Mock fetch for Helius DAS calls
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

// Mock Helius API key
const ORIGINAL_ENV = process.env

describe("DripReader", () => {
  let reader: DripReader

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  describe("simulation mode", () => {
    beforeEach(() => {
      reader = new DripReader("simulation")
    })

    it("returns sample drops", async () => {
      const drops = await reader.getDrops()
      expect(drops).toEqual(SAMPLE_DROPS)
    })

    it("finds a drop by ID", async () => {
      const drop = await reader.getDrop("drop-stealth-addresses")
      expect(drop).toBeDefined()
      expect(drop!.title).toBe("What Are Stealth Addresses?")
    })

    it("returns undefined for unknown drop ID", async () => {
      const drop = await reader.getDrop("nonexistent")
      expect(drop).toBeUndefined()
    })

    it("returns sample subscriptions", async () => {
      const subs = await reader.getSubscriptions()
      expect(subs.length).toBeGreaterThan(0)
    })

    it("filters drops by tier", async () => {
      const freeDrops = await reader.getDropsByTier("free")
      expect(freeDrops.every((d) => d.accessTier === "free")).toBe(true)
    })
  })

  describe("drip mode — no API key", () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_HELIUS_API_KEY
      delete process.env.HELIUS_API_KEY
      reader = new DripReader("drip")
      reader.clearCache()
    })

    it("falls back to sample drops when no Helius key", async () => {
      const drops = await reader.getDrops()
      expect(drops).toEqual(SAMPLE_DROPS)
    })
  })

  describe("drip mode — with API key", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_HELIUS_API_KEY = "test-key"
      reader = new DripReader("drip")
      reader.clearCache()
    })

    it("fetches from Helius DAS getAssetsByCreator", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            items: [
              {
                id: "DRiPabc123def456ghi789jkl012mno345pqr678stu",
                content: {
                  metadata: {
                    name: "Privacy Tutorial #1",
                    description: "Learn about stealth addresses",
                    symbol: "DRiP",
                  },
                },
              },
              {
                id: "DRiPxyz987wvu654tsr321qpo098nml765kji432hgf",
                content: {
                  metadata: {
                    name: "Alpha: ZK Integration",
                    description: "Exclusive alpha on ZK proofs",
                    symbol: "DRiP",
                  },
                },
              },
            ],
            total: 2,
          },
        }),
      })

      const drops = await reader.getDrops()
      expect(drops.length).toBe(2)
      expect(drops[0].title).toBe("Privacy Tutorial #1")
      expect(drops[0].id).toContain("DRiP")
    })

    it("maps asset metadata to Drop interface correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            items: [
              {
                id: "abc123def456ghi789jkl012mno345pqr678stu901",
                content: {
                  metadata: {
                    name: "Deep Dive: Cross-Chain",
                    description: "Deep dive into privacy architecture",
                    symbol: "SIP",
                  },
                },
              },
            ],
            total: 1,
          },
        }),
      })

      const drops = await reader.getDrops()
      expect(drops[0].contentType).toBe("deep_dive")
      expect(drops[0].accessTier).toBe("subscriber")
      expect(drops[0].isEncrypted).toBe(true)
      expect(drops[0].author).toBe("SIP")
    })

    it("falls back to sample data on Helius error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Helius API error"))

      const drops = await reader.getDrops()
      expect(drops).toEqual(SAMPLE_DROPS)
    })

    it("falls back on empty result", async () => {
      // First call (getAssetsByCreator) — empty
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { items: [], total: 0 } }),
      })
      // Second call (getAssetsByGroup fallback) — also empty for all collections
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { items: [], total: 0 } }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { items: [], total: 0 } }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { items: [], total: 0 } }),
      })

      const drops = await reader.getDrops()
      expect(drops).toEqual(SAMPLE_DROPS)
    })

    it("caches Helius results", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          result: {
            items: [
              {
                id: "cache123test456data789abc012def345ghi678jkl",
                content: {
                  metadata: { name: "Cached Drop", description: "Test" },
                },
              },
            ],
          },
        }),
      })

      const first = await reader.getDrops()
      const second = await reader.getDrops()
      expect(first).toEqual(second)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it("fetches single drop via getAsset for Solana addresses", async () => {
      const solanaAddress = "DRiPabc123def456ghi789jkl012mno345pqr678stu"

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            id: solanaAddress,
            content: {
              metadata: {
                name: "Single Drop",
                description: "Fetched directly",
              },
            },
          },
        }),
      })

      const drop = await reader.getDrop(solanaAddress)
      expect(drop).toBeDefined()
      expect(drop!.title).toBe("Single Drop")
    })

    it("falls back to simulation for single drop on error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network"))

      const drop = await reader.getDrop("drop-stealth-addresses")
      expect(drop).toBeDefined()
      expect(drop!.title).toBe("What Are Stealth Addresses?")
    })
  })

  describe("content type mapping", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_HELIUS_API_KEY = "test-key"
      reader = new DripReader("drip")
      reader.clearCache()
    })

    it("maps tutorial keyword to tutorial type", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            items: [
              {
                id: "tut123abc456def789ghi012jkl345mno678pqr901s",
                content: {
                  metadata: {
                    name: "Tutorial: Getting Started",
                    description: "Learn the basics",
                  },
                },
              },
            ],
          },
        }),
      })

      const drops = await reader.getDrops()
      expect(drops[0].contentType).toBe("tutorial")
      expect(drops[0].accessTier).toBe("subscriber")
    })

    it("maps alpha keyword to alpha type", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            items: [
              {
                id: "alp123abc456def789ghi012jkl345mno678pqr901s",
                content: {
                  metadata: {
                    name: "Alpha Report",
                    description: "Exclusive insights",
                  },
                },
              },
            ],
          },
        }),
      })

      const drops = await reader.getDrops()
      expect(drops[0].contentType).toBe("alpha")
      expect(drops[0].accessTier).toBe("premium")
      expect(drops[0].isEncrypted).toBe(true)
    })
  })
})
