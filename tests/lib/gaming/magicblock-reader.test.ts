import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import {
  MagicBlockReader,
  getBoltProgramIds,
  getBoltWorldInfo,
} from "@/lib/gaming/magicblock-reader"

// Mock fetch for RPC calls
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

describe("MagicBlockReader", () => {
  let reader: MagicBlockReader

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  afterEach(() => {
    // Clear any cached data between tests
  })

  describe("getBoltProgramIds", () => {
    it("exports valid base58 world program ID", async () => {
      const ids = await getBoltProgramIds()
      expect(ids.world).toBeTruthy()
      expect(typeof ids.world).toBe("string")
      // Base58 characters only
      expect(ids.world).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/)
    })

    it("exports valid base58 delegation program ID", async () => {
      const ids = await getBoltProgramIds()
      expect(ids.delegation).toBeTruthy()
      expect(typeof ids.delegation).toBe("string")
      expect(ids.delegation).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/)
    })
  })

  describe("getBoltWorldInfo", () => {
    it("returns world PDA, registry PDA, and program ID", async () => {
      const info = await getBoltWorldInfo()
      expect(info.worldPda).toBeTruthy()
      expect(info.registryPda).toBeTruthy()
      expect(info.worldProgramId).toBeTruthy()
    })

    it("returns different world PDAs for different world IDs", async () => {
      const info0 = await getBoltWorldInfo(0)
      const info1 = await getBoltWorldInfo(1)
      expect(info0.worldPda.toBase58()).not.toBe(info1.worldPda.toBase58())
    })
  })

  describe("simulation mode", () => {
    beforeEach(() => {
      reader = new MagicBlockReader("simulation")
    })

    it("returns sample games", async () => {
      const games = await reader.getGames()
      expect(games.length).toBeGreaterThan(0)
      expect(games[0].id).toContain("game-")
    })

    it("returns sample results", async () => {
      const results = await reader.getResults()
      expect(results.length).toBeGreaterThan(0)
    })

    it("filters games by type", async () => {
      const commitReveal = await reader.getGamesByType("commit_reveal")
      expect(commitReveal.every((g) => g.gameType === "commit_reveal")).toBe(
        true
      )
    })

    it("returns simulation leaderboard", async () => {
      const lb = await reader.getLeaderboard()
      expect(lb.length).toBeGreaterThan(0)
      expect(lb[0]).toHaveProperty("address")
      expect(lb[0]).toHaveProperty("wins")
    })

    it("finds a game by ID", async () => {
      const game = await reader.getGame("game-stealth-showdown")
      expect(game).toBeDefined()
      expect(game!.title).toBe("Stealth Showdown")
    })

    it("returns undefined for unknown game ID", async () => {
      const game = await reader.getGame("nonexistent")
      expect(game).toBeUndefined()
    })
  })

  describe("magicblock mode", () => {
    beforeEach(() => {
      reader = new MagicBlockReader("magicblock")
      reader.clearCache()
    })

    it("returns curated MagicBlock BOLT games", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: [] }),
      })

      const games = await reader.getGames()
      expect(games.length).toBeGreaterThan(0)
      // MagicBlock games have mb- prefix
      expect(games[0].id).toContain("mb-")
    })

    it("returns curated MagicBlock results", async () => {
      const results = await reader.getResults()
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].gameId).toContain("mb-")
    })

    it("returns MagicBlock leaderboard", async () => {
      const lb = await reader.getLeaderboard()
      expect(lb.length).toBeGreaterThan(0)
      // MagicBlock leaderboard has higher win counts
      expect(lb[0].wins).toBeGreaterThan(50)
    })

    it("caches MagicBlock games", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ result: [] }),
      })

      const first = await reader.getGames()
      const second = await reader.getGames()

      expect(first).toEqual(second)
      // Fetch called only once due to cache
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it("falls back to curated data on RPC failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      const games = await reader.getGames()
      expect(games.length).toBeGreaterThan(0)
      expect(games[0].id).toContain("mb-")
    })

    it("falls back on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 429 })

      const games = await reader.getGames()
      expect(games.length).toBeGreaterThan(0)
    })
  })

  describe("cache behavior", () => {
    it("clearCache resets all cached data", async () => {
      reader = new MagicBlockReader("magicblock")
      reader.clearCache()
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ result: [] }),
      })

      await reader.getGames()
      reader.clearCache()
      await reader.getGames()

      // Fetch called twice since cache was cleared
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
