import type { World, WorldCategory, MetaverseMode } from "./types"
import { SAMPLE_WORLDS } from "./constants"

// ---------------------------------------------------------------------------
// Portals metaverse data (theportal.to)
// ---------------------------------------------------------------------------
// Portals is a Solana-native metaverse platform with 3D browser-based spaces.
// Features: NFT-gated rooms, spatial audio, avatar customization, token-gated
// experiences, and embedded DeFi. We attempt to fetch from their API, falling
// back to curated data referencing real Portals features and world concepts.
// ---------------------------------------------------------------------------

const PORTALS_API_BASE = "https://theportal.to/api"
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// ---------------------------------------------------------------------------
// Portals-specific world data
// ---------------------------------------------------------------------------

const PORTALS_WORLDS: World[] = [
  {
    id: "portals-nft-gallery",
    title: "Portals NFT Gallery",
    description:
      "Curated 3D art gallery in Portals. NFT-gated entry with stealth avatar identity — browse collections without linking your wallet history. Spatial audio guides walk you through exhibitions.",
    category: "gallery",
    tier: "explorer",
    visitorCount: 4800,
    isActive: true,
    icon: "\u{1F5BC}\uFE0F",
  },
  {
    id: "portals-pvp-arena",
    title: "Portals PvP Arena",
    description:
      "Multiplayer game room in a 3D Portals space. Avatar-to-avatar combat with hidden stats via Pedersen commitments. Spatial audio for directional cues — hear opponents before you see them.",
    category: "game_room",
    tier: "warrior",
    visitorCount: 2300,
    isActive: true,
    icon: "\u2694\uFE0F",
  },
  {
    id: "portals-social-lounge",
    title: "Portals Social Lounge",
    description:
      "Community gathering space with voice chat and avatar emotes. Token-gated rooms for DAO members. Stealth presence lets you join anonymously without revealing your on-chain identity.",
    category: "social",
    tier: "citizen",
    visitorCount: 7200,
    isActive: true,
    icon: "\u{1F30D}",
  },
  {
    id: "portals-bazaar",
    title: "Portals Bazaar",
    description:
      "3D marketplace built in Portals. Browse and trade NFTs in spatial storefronts. Stealth transfers for private purchases — sellers see payment, not buyer identity. Embedded Jupiter swap widget.",
    category: "marketplace",
    tier: "merchant",
    visitorCount: 3100,
    isActive: true,
    icon: "\u{1F6D2}",
  },
  {
    id: "portals-concert-venue",
    title: "Portals Live Stage",
    description:
      "Virtual concert venue with spatial audio for immersive 3D sound. VIP sections gated by viewing key — prove your ticket tier without revealing your wallet. Avatar dance emotes synced to music.",
    category: "concert_hall",
    tier: "vip",
    visitorCount: 5600,
    isActive: true,
    icon: "\u{1F3B6}",
  },
  {
    id: "portals-dao-headquarters",
    title: "DAO Headquarters",
    description:
      "Persistent 3D governance space for DAOs in Portals. Token-gated meeting rooms with spatial voice. Anonymous voting via SIP commitments — participate without revealing delegation size.",
    category: "social",
    tier: "citizen",
    visitorCount: 1900,
    isActive: true,
    icon: "\u{1F3DB}\uFE0F",
  },
  {
    id: "portals-defi-floor",
    title: "DeFi Trading Floor",
    description:
      "3D trading floor experience in Portals. Real-time charts on virtual screens, voice chat with fellow traders. Stealth swaps via SIP ensure your positions stay private in a social setting.",
    category: "marketplace",
    tier: "merchant",
    visitorCount: 2700,
    isActive: true,
    icon: "\u{1F4C8}",
  },
]

const PORTALS_VISITORS = [
  { address: "PRT...a3f", worlds: 28, tier: "vip" },
  { address: "S1P...x7a", worlds: 19, tier: "vip" },
  { address: "7Kz...m3b", worlds: 14, tier: "merchant" },
  { address: "Fg2...p9c", worlds: 10, tier: "citizen" },
  { address: "Bx8...k1d", worlds: 7, tier: "warrior" },
  { address: "Qm5...r4e", worlds: 4, tier: "explorer" },
  { address: "Mn3...w2d", worlds: 2, tier: "explorer" },
]

// ---------------------------------------------------------------------------
// Attempt to fetch worlds from Portals API
// ---------------------------------------------------------------------------

interface PortalsApiWorld {
  id?: string
  slug?: string
  name?: string
  title?: string
  description?: string
  category?: string
  type?: string
  visitor_count?: number
  visitors?: number
  online_count?: number
  is_active?: boolean
  status?: string
  image_url?: string
  features?: string[]
  nft_gated?: boolean
  token_gated?: boolean
}

function inferWorldCategory(
  world: PortalsApiWorld
): WorldCategory {
  const text = `${world.category || ""} ${world.type || ""} ${world.name || ""} ${world.description || ""}`.toLowerCase()

  if (text.includes("gallery") || text.includes("art") || text.includes("museum"))
    return "gallery"
  if (text.includes("game") || text.includes("arena") || text.includes("pvp"))
    return "game_room"
  if (text.includes("market") || text.includes("shop") || text.includes("trade") || text.includes("bazaar"))
    return "marketplace"
  if (text.includes("concert") || text.includes("music") || text.includes("stage") || text.includes("venue"))
    return "concert_hall"
  return "social"
}

function inferAvatarTier(
  world: PortalsApiWorld
): "explorer" | "warrior" | "citizen" | "merchant" | "vip" {
  if (world.nft_gated || world.token_gated) return "vip"

  const category = inferWorldCategory(world)
  const tierMap: Record<WorldCategory, "explorer" | "warrior" | "citizen" | "merchant" | "vip"> = {
    gallery: "explorer",
    game_room: "warrior",
    social: "citizen",
    marketplace: "merchant",
    concert_hall: "vip",
  }
  return tierMap[category]
}

function worldCategoryIcon(category: WorldCategory): string {
  const icons: Record<WorldCategory, string> = {
    gallery: "\u{1F5BC}\uFE0F",
    game_room: "\u2694\uFE0F",
    social: "\u{1F30D}",
    marketplace: "\u{1F6D2}",
    concert_hall: "\u{1F3B6}",
  }
  return icons[category]
}

function mapPortalsWorld(raw: PortalsApiWorld): World {
  const category = inferWorldCategory(raw)
  return {
    id: raw.id || raw.slug || `portals-${Date.now()}`,
    title: raw.name || raw.title || "Portals World",
    description:
      raw.description ||
      "3D browser-based space in the Portals metaverse with spatial audio and NFT displays.",
    category,
    tier: inferAvatarTier(raw),
    visitorCount:
      raw.visitor_count || raw.visitors || raw.online_count || 0,
    isActive:
      raw.is_active ?? (raw.status ? raw.status === "active" : true),
    icon: worldCategoryIcon(category),
  }
}

/**
 * Attempt a direct REST call to Portals API.
 * Returns null on any failure so callers can fall back to curated data.
 */
async function portalsFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${PORTALS_API_BASE}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.warn(
        `[SIP][Portals] API returned ${response.status} for ${path}`
      )
      return null
    }

    const json = await response.json()

    // Handle various response shapes
    if (Array.isArray(json)) return json as T
    if (json?.data) return json.data as T
    if (json?.worlds) return json.worlds as T
    if (json?.spaces) return json.spaces as T
    if (json?.results) return json.results as T

    return json as T
  } catch (error) {
    console.warn(
      "[SIP][Portals] API fetch failed:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return null
  }
}

// ---------------------------------------------------------------------------
// PortalsReader
// ---------------------------------------------------------------------------

export class PortalsReader {
  private mode: MetaverseMode

  constructor(mode: MetaverseMode = "simulation") {
    this.mode = mode
  }

  async getWorlds(): Promise<World[]> {
    if (this.mode === "portals") {
      const cached = getCached<World[]>("portals:worlds")
      if (cached) return cached

      // Try fetching from Portals API
      const result = await portalsFetch<PortalsApiWorld[]>("/worlds")

      if (result?.length) {
        const worlds = result.map(mapPortalsWorld)
        setCache("portals:worlds", worlds)
        console.info(
          `[SIP][Portals] Fetched ${worlds.length} live worlds`
        )
        return worlds
      }

      // Try alternative endpoints
      const altResult = await portalsFetch<PortalsApiWorld[]>("/v1/spaces")

      if (altResult?.length) {
        const worlds = altResult.map(mapPortalsWorld)
        setCache("portals:worlds", worlds)
        console.info(
          `[SIP][Portals] Fetched ${worlds.length} worlds from v1 API`
        )
        return worlds
      }

      // Fall back to curated Portals world data
      console.warn(
        "[SIP][Portals] Could not fetch live worlds, using curated 3D space data"
      )
      setCache("portals:worlds", PORTALS_WORLDS)
      return PORTALS_WORLDS
    }

    return SAMPLE_WORLDS
  }

  async getWorld(id: string): Promise<World | undefined> {
    if (this.mode === "portals") {
      const cacheKey = `portals:world:${id}`
      const cached = getCached<World>(cacheKey)
      if (cached) return cached

      // Try direct world fetch
      const result = await portalsFetch<PortalsApiWorld>(`/worlds/${id}`)

      if (result?.id || result?.slug) {
        const world = mapPortalsWorld(result)
        setCache(cacheKey, world)
        return world
      }

      // Fall through to finding in full list
      const allWorlds = await this.getWorlds()
      return allWorlds.find((w) => w.id === id)
    }

    return SAMPLE_WORLDS.find((w) => w.id === id)
  }

  async getVisitors(): Promise<
    { address: string; worlds: number; tier: string }[]
  > {
    if (this.mode === "portals") {
      const cached = getCached<typeof PORTALS_VISITORS>("portals:visitors")
      if (cached) return cached

      setCache("portals:visitors", PORTALS_VISITORS)
      return PORTALS_VISITORS
    }

    return [
      { address: "S1P...x7a", worlds: 15, tier: "vip" },
      { address: "7Kz...m3b", worlds: 11, tier: "merchant" },
      { address: "Fg2...p9c", worlds: 8, tier: "citizen" },
      { address: "Bx8...k1d", worlds: 5, tier: "warrior" },
      { address: "Qm5...r4e", worlds: 3, tier: "explorer" },
    ]
  }

  async getWorldsByCategory(category: WorldCategory): Promise<World[]> {
    const worlds = await this.getWorlds()
    return worlds.filter((w) => w.category === category)
  }

  clearCache(): void {
    cache.clear()
  }
}
