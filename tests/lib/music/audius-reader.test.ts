import { describe, it, expect, beforeEach, vi } from "vitest"
import { SAMPLE_TRACKS } from "@/lib/music/constants"

// Mock fetch for Audius API calls
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

// Helper to build a mock Audius API response
function audiusResponse<T>(data: T) {
  return {
    ok: true,
    json: async () => ({ data }),
  }
}

// Minimal AudiusTrack fixture
function makeAudiusTrack(overrides: Record<string, unknown> = {}) {
  return {
    id: "abc123",
    title: "Test Track",
    description: "A test track",
    genre: "Electronic",
    artwork: null,
    play_count: 5000,
    favorite_count: 200,
    user: { id: "u1", name: "TestArtist" },
    ...overrides,
  }
}

describe("AudiusReader", () => {
  // We dynamically import to get a fresh module-level cache per describe block
  let AudiusReader: typeof import("@/lib/music/audius-reader").AudiusReader

  beforeEach(async () => {
    vi.clearAllMocks()
    mockFetch.mockReset()
    // Reset modules to clear the module-level cache Map
    vi.resetModules()
    const mod = await import("@/lib/music/audius-reader")
    AudiusReader = mod.AudiusReader
  })

  // ── simulation mode ─────────────────────────────────────────────────────

  describe("simulation mode", () => {
    it("getTracks returns sample data", async () => {
      const reader = new AudiusReader("simulation")
      const tracks = await reader.getTracks()
      expect(tracks).toEqual(SAMPLE_TRACKS)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it("getTrack returns matching sample track", async () => {
      const reader = new AudiusReader("simulation")
      const track = await reader.getTrack("track-privacy-anthem")
      expect(track).toBeDefined()
      expect(track!.title).toBe("Privacy Anthem")
    })

    it("getTrack returns undefined for unknown ID", async () => {
      const reader = new AudiusReader("simulation")
      const track = await reader.getTrack("nonexistent")
      expect(track).toBeUndefined()
    })

    it("searchTracks filters SAMPLE_TRACKS by title", async () => {
      const reader = new AudiusReader("simulation")
      const results = await reader.searchTracks("privacy")
      expect(results.length).toBeGreaterThan(0)
      expect(
        results.every((t) => t.title.toLowerCase().includes("privacy"))
      ).toBe(true)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it("searchTracks filters by description", async () => {
      const reader = new AudiusReader("simulation")
      const results = await reader.searchTracks("stealth")
      // "stealth" appears in descriptions of multiple sample tracks
      expect(results.length).toBeGreaterThan(0)
    })

    it("searchTracks filters by genre", async () => {
      const reader = new AudiusReader("simulation")
      const results = await reader.searchTracks("jazz")
      expect(results.some((t) => t.genre === "jazz")).toBe(true)
    })

    it("searchTracks returns empty for no match", async () => {
      const reader = new AudiusReader("simulation")
      const results = await reader.searchTracks("xyznonexistent999")
      expect(results).toEqual([])
    })

    it("getStreamUrl returns null in simulation mode", () => {
      const reader = new AudiusReader("simulation")
      expect(reader.getStreamUrl("any-id")).toBeNull()
    })
  })

  // ── audius mode ─────────────────────────────────────────────────────────

  describe("audius mode", () => {
    it("getTracks calls /tracks/trending and maps results", async () => {
      const reader = new AudiusReader("audius")
      const rawTracks = [
        makeAudiusTrack({
          id: "t1",
          title: "Trending One",
          genre: "Electronic",
          play_count: 50000,
        }),
        makeAudiusTrack({
          id: "t2",
          title: "Trending Two",
          genre: "Hip Hop/Rap",
          play_count: 200,
        }),
      ]
      mockFetch.mockResolvedValueOnce(audiusResponse(rawTracks))

      const tracks = await reader.getTracks()
      expect(tracks).toHaveLength(2)
      expect(tracks[0].id).toBe("t1")
      expect(tracks[0].title).toBe("Trending One")
      expect(tracks[0].genre).toBe("electronic")
      expect(tracks[0].tier).toBe("premium") // 50000 > 10_000
      expect(tracks[1].genre).toBe("hip_hop")
      expect(tracks[1].tier).toBe("free") // 200 < 1_000
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch.mock.calls[0][0]).toContain("/tracks/trending")
    })

    it("getTrack fetches single track by ID", async () => {
      const reader = new AudiusReader("audius")
      const raw = makeAudiusTrack({ id: "single-1", title: "Solo Track" })
      mockFetch.mockResolvedValueOnce(audiusResponse(raw))

      const track = await reader.getTrack("single-1")
      expect(track).toBeDefined()
      expect(track!.title).toBe("Solo Track")
      expect(mockFetch.mock.calls[0][0]).toContain("/tracks/single-1")
    })

    it("searchTracks calls /tracks/search and maps results", async () => {
      const reader = new AudiusReader("audius")
      const rawTracks = [
        makeAudiusTrack({
          id: "s1",
          title: "Search Result",
          genre: "Jazz",
          play_count: 3000,
        }),
      ]
      mockFetch.mockResolvedValueOnce(audiusResponse(rawTracks))

      const results = await reader.searchTracks("jazz vibes")
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe("s1")
      expect(results[0].genre).toBe("jazz")
      expect(results[0].tier).toBe("supporter") // 3000 > 1_000
      expect(mockFetch.mock.calls[0][0]).toContain("/tracks/search")
      expect(mockFetch.mock.calls[0][0]).toContain("query=jazz%20vibes")
    })

    it("searchTracks caches results by query key", async () => {
      const reader = new AudiusReader("audius")
      const rawTracks = [makeAudiusTrack({ id: "c1", title: "Cached" })]
      mockFetch.mockResolvedValueOnce(audiusResponse(rawTracks))

      const first = await reader.searchTracks("cache-test-query")
      const second = await reader.searchTracks("cache-test-query")

      expect(first).toEqual(second)
      // Only one fetch — second call served from cache
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it("searchTracks falls back to sample on API error", async () => {
      const reader = new AudiusReader("audius")
      mockFetch.mockRejectedValueOnce(new Error("Network failure"))

      const results = await reader.searchTracks("electronic")
      // Falls back to filtering SAMPLE_TRACKS
      expect(results.length).toBeGreaterThan(0)
      expect(
        results.every(
          (t) =>
            t.title.toLowerCase().includes("electronic") ||
            t.description.toLowerCase().includes("electronic") ||
            t.genre.toLowerCase().includes("electronic")
        )
      ).toBe(true)
    })

    it("getTracks falls back to sample on API error", async () => {
      const reader = new AudiusReader("audius")
      mockFetch.mockRejectedValueOnce(new Error("503 Service Unavailable"))

      const tracks = await reader.getTracks()
      expect(tracks).toEqual(SAMPLE_TRACKS)
    })

    it("getTrack falls back to sample on API error", async () => {
      const reader = new AudiusReader("audius")
      mockFetch.mockRejectedValueOnce(new Error("Timeout"))

      const track = await reader.getTrack("track-privacy-anthem")
      expect(track).toBeDefined()
      expect(track!.title).toBe("Privacy Anthem")
    })

    it("getStreamUrl returns correct URL format", () => {
      const reader = new AudiusReader("audius")
      const url = reader.getStreamUrl("abc123")
      expect(url).toBe(
        "https://discoveryprovider.audius.co/v1/tracks/abc123/stream?app_name=SIP"
      )
    })

    it("getStreamUrl includes track ID in path", () => {
      const reader = new AudiusReader("audius")
      const url = reader.getStreamUrl("my-track-id")
      expect(url).toContain("/tracks/my-track-id/stream")
    })
  })
})
