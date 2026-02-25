import type { Track, MusicGenre, ListenerTier, MusicMode } from "./types"
import { SAMPLE_TRACKS } from "./constants"
import { logger } from "@/lib/logger"
import {
  sdk as createAudiusSdk,
  type AudiusSdk,
} from "@audius/sdk"

// ---------------------------------------------------------------------------
// Audius SDK + Public API config
// ---------------------------------------------------------------------------
const AUDIUS_BASE_URL = "https://discoveryprovider.audius.co/v1"
const AUDIUS_APP_NAME = "SIP"

// Lazy-initialized Audius SDK client (singleton)
let audiusSdkClient: AudiusSdk | null = null

function getAudiusSdk(): AudiusSdk | null {
  if (audiusSdkClient) return audiusSdkClient
  try {
    audiusSdkClient = createAudiusSdk({ appName: AUDIUS_APP_NAME })
    return audiusSdkClient
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// In-memory cache (5-minute TTL)
// ---------------------------------------------------------------------------
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ---------------------------------------------------------------------------
// Audius API response types
// ---------------------------------------------------------------------------
interface AudiusArtwork {
  "150x150"?: string
  "480x480"?: string
  "1000x1000"?: string
}

interface AudiusUser {
  id: string
  name: string
}

interface AudiusTrack {
  id: string
  title: string
  description: string | null
  genre: string
  artwork: AudiusArtwork | null
  play_count: number
  favorite_count: number
  user: AudiusUser
}

interface AudiusResponse<T> {
  data: T
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------
function mapGenre(audiusGenre: string): MusicGenre {
  const g = audiusGenre.toLowerCase()
  if (g.includes("electronic") || g.includes("house") || g.includes("techno"))
    return "electronic"
  if (g.includes("classical") || g.includes("orchestral")) return "classical"
  if (g.includes("hip") || g.includes("rap")) return "hip_hop"
  if (g.includes("jazz")) return "jazz"
  return "ambient"
}

function mapTier(playCount: number): ListenerTier {
  if (playCount > 100_000) return "patron"
  if (playCount > 10_000) return "premium"
  if (playCount > 1_000) return "supporter"
  return "free"
}

function mapIcon(genre: MusicGenre): string {
  const icons: Record<MusicGenre, string> = {
    electronic: "\u{1F3B5}",
    classical: "\u{1F3BB}",
    hip_hop: "\u{1F3A4}",
    jazz: "\u{1F3B7}",
    ambient: "\u{1F3B6}",
  }
  return icons[genre] || "\u{1F3B5}"
}

function mapAudiusTrack(raw: AudiusTrack): Track {
  const genre = mapGenre(raw.genre)
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || `${raw.genre} track by ${raw.user.name}`,
    genre,
    tier: mapTier(raw.play_count),
    listenerCount: raw.play_count,
    isActive: true,
    icon: mapIcon(genre),
  }
}

/**
 * Map an Audius SDK Track model to our internal Track type.
 */
function mapSdkTrack(raw: {
  id: string
  title: string
  description?: string
  genre: string
  playCount: number
  duration: number
  user: { name: string }
}): Track {
  const genre = mapGenre(raw.genre)
  return {
    id: raw.id,
    title: raw.title,
    description:
      raw.description || `${raw.genre} track by ${raw.user.name}`,
    genre,
    tier: mapTier(raw.playCount),
    listenerCount: raw.playCount,
    isActive: true,
    icon: mapIcon(genre),
  }
}

// ---------------------------------------------------------------------------
// Fetch helper with timeout
// ---------------------------------------------------------------------------
async function audiusFetch<T>(path: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?"
  const url = `${AUDIUS_BASE_URL}${path}${separator}app_name=${AUDIUS_APP_NAME}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8_000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
    if (!res.ok) {
      throw new Error(`Audius API ${res.status}: ${res.statusText}`)
    }
    const json = (await res.json()) as AudiusResponse<T>
    return json.data
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// AudiusReader
// ---------------------------------------------------------------------------
export class AudiusReader {
  private mode: MusicMode

  constructor(mode: MusicMode = "simulation") {
    this.mode = mode
  }

  // ── getTracks ───────────────────────────────────────────────────────────
  async getTracks(): Promise<Track[]> {
    if (this.mode === "simulation") return SAMPLE_TRACKS

    const cacheKey = "audius:trending"
    const cached = getCached<Track[]>(cacheKey)
    if (cached) return cached

    // Try official Audius SDK first
    const client = getAudiusSdk()
    if (client) {
      try {
        const response = await client.tracks.getTrendingTracks({ limit: 10 })
        const sdkTracks = response?.data
        if (sdkTracks?.length) {
          const tracks = sdkTracks.map(mapSdkTrack)
          setCache(cacheKey, tracks)
          logger.info(
            `[SIP][Audius] SDK fetched ${tracks.length} trending tracks`,
            "AudiusReader"
          )
          return tracks
        }
      } catch (err) {
        logger.warn(
          `[SIP][Audius] SDK fetch failed, falling back to REST: ${err instanceof Error ? err.message : err}`,
          "AudiusReader"
        )
      }
    }

    // Fallback: direct REST API
    try {
      const raw = await audiusFetch<AudiusTrack[]>("/tracks/trending?limit=10")
      const tracks = raw.map(mapAudiusTrack)
      setCache(cacheKey, tracks)
      return tracks
    } catch (err) {
      logger.warn(
        `[SIP] Audius API fetch failed for getTracks, falling back to simulation: ${err instanceof Error ? err.message : err}`,
        "AudiusReader"
      )
      return SAMPLE_TRACKS
    }
  }

  // ── getTrack ────────────────────────────────────────────────────────────
  async getTrack(id: string): Promise<Track | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_TRACKS.find((t) => t.id === id)
    }

    const cacheKey = `audius:track:${id}`
    const cached = getCached<Track>(cacheKey)
    if (cached) return cached

    // Try official Audius SDK first
    const client = getAudiusSdk()
    if (client) {
      try {
        const response = await client.tracks.getTrack({ trackId: id })
        const sdkTrack = response?.data
        if (sdkTrack) {
          const track = mapSdkTrack(sdkTrack)
          setCache(cacheKey, track)
          return track
        }
      } catch {
        // Fall through to REST
      }
    }

    // Fallback: direct REST API
    try {
      const raw = await audiusFetch<AudiusTrack>(`/tracks/${id}`)
      const track = mapAudiusTrack(raw)
      setCache(cacheKey, track)
      return track
    } catch (err) {
      logger.warn(
        `[SIP] Audius API fetch failed for getTrack(${id}), falling back to simulation: ${err instanceof Error ? err.message : err}`,
        "AudiusReader"
      )
      return SAMPLE_TRACKS.find((t) => t.id === id)
    }
  }

  // ── getListeners ────────────────────────────────────────────────────────
  // Audius public API does not expose per-track listener lists.
  // Always returns simulated listener data.
  async getListeners(): Promise<
    { address: string; tracks: number; tier: string }[]
  > {
    return [
      { address: "S1P...x7a", tracks: 42, tier: "patron" },
      { address: "7Kz...m3b", tracks: 28, tier: "premium" },
      { address: "Fg2...p9c", tracks: 19, tier: "supporter" },
      { address: "Bx8...k1d", tracks: 11, tier: "free" },
      { address: "Qm5...r4e", tracks: 7, tier: "free" },
    ]
  }

  // ── searchTracks ───────────────────────────────────────────────────────
  async searchTracks(query: string): Promise<Track[]> {
    if (this.mode === "simulation") {
      const q = query.toLowerCase()
      return SAMPLE_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q)
      )
    }

    const cacheKey = `audius:search:${query}`
    const cached = getCached<Track[]>(cacheKey)
    if (cached) return cached

    // Try official Audius SDK first
    const client = getAudiusSdk()
    if (client) {
      try {
        const response = await client.tracks.searchTracks({ query })
        const sdkTracks = response?.data
        if (sdkTracks?.length) {
          const tracks = sdkTracks.slice(0, 10).map(mapSdkTrack)
          setCache(cacheKey, tracks)
          logger.info(
            `[SIP][Audius] SDK search returned ${tracks.length} tracks`,
            "AudiusReader"
          )
          return tracks
        }
      } catch {
        // Fall through to REST
      }
    }

    // Fallback: direct REST API
    try {
      const raw = await audiusFetch<AudiusTrack[]>(
        `/tracks/search?query=${encodeURIComponent(query)}&limit=10`
      )
      const tracks = raw.map(mapAudiusTrack)
      setCache(cacheKey, tracks)
      return tracks
    } catch (err) {
      logger.warn(
        `[SIP] Audius API fetch failed for searchTracks("${query}"), falling back to simulation: ${err instanceof Error ? err.message : err}`,
        "AudiusReader"
      )
      const q = query.toLowerCase()
      return SAMPLE_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q)
      )
    }
  }

  // ── getStreamUrl ──────────────────────────────────────────────────────
  async getStreamUrl(trackId: string): Promise<string | null> {
    if (this.mode === "simulation") return null

    // Try official Audius SDK first
    const client = getAudiusSdk()
    if (client) {
      try {
        const url = await client.tracks.getTrackStreamUrl({
          trackId,
        })
        if (url) return url
      } catch {
        // Fall through to manual URL
      }
    }

    return `${AUDIUS_BASE_URL}/tracks/${trackId}/stream?app_name=${AUDIUS_APP_NAME}`
  }

  // ── getTracksByGenre ────────────────────────────────────────────────────
  async getTracksByGenre(genre: MusicGenre): Promise<Track[]> {
    if (this.mode === "simulation") {
      return SAMPLE_TRACKS.filter((t) => t.genre === genre)
    }

    const cacheKey = `audius:genre:${genre}`
    const cached = getCached<Track[]>(cacheKey)
    if (cached) return cached

    try {
      // Audius trending endpoint returns mixed genres — fetch a larger set
      // and filter client-side since there is no genre query param on trending.
      const raw = await audiusFetch<AudiusTrack[]>("/tracks/trending?limit=50")
      const allTracks = raw.map(mapAudiusTrack)
      const filtered = allTracks.filter((t) => t.genre === genre)

      // Cache both the filtered result and the full set for getTracks
      setCache(cacheKey, filtered)
      if (!getCached<Track[]>("audius:trending")) {
        setCache("audius:trending", allTracks.slice(0, 10))
      }

      return filtered.length > 0
        ? filtered
        : SAMPLE_TRACKS.filter((t) => t.genre === genre)
    } catch (err) {
      logger.warn(
        `[SIP] Audius API fetch failed for getTracksByGenre(${genre}), falling back to simulation: ${err instanceof Error ? err.message : err}`,
        "AudiusReader"
      )
      return SAMPLE_TRACKS.filter((t) => t.genre === genre)
    }
  }
}
