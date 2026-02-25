import type { Event, Ticket, EventCategory, TicketingMode } from "./types"
import { SAMPLE_EVENTS, SAMPLE_TICKETS } from "./constants"
import { logger } from "@/lib/logger"

// ---------------------------------------------------------------------------
// KYD Labs ticketing data (kyd.so)
// ---------------------------------------------------------------------------
// KYD is a Solana-native ticketing platform that mints compressed NFT (cNFT)
// tickets via Metaplex Bubblegum. Tickets are stored in Merkle trees for
// efficient on-chain distribution. KYD may have a public API but for
// hackathon purposes we use curated data referencing real cNFT ticket
// minting patterns and Solana ecosystem events.
// ---------------------------------------------------------------------------

const KYD_API_BASE = "https://api.kyd.so"
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getHeliusUrl(): string | null {
  const key =
    (typeof process !== "undefined" &&
      (process.env?.NEXT_PUBLIC_HELIUS_API_KEY ||
        process.env?.HELIUS_API_KEY)) ||
    null
  if (!key) return null
  return `https://mainnet.helius-rpc.com/?api-key=${key}`
}

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
// KYD-specific event data (cNFT ticket references)
// ---------------------------------------------------------------------------

export const KYD_EVENTS: Event[] = [
  {
    id: "kyd-breakpoint-2026",
    title: "Solana Breakpoint 2026",
    description:
      "Flagship Solana conference. Tickets minted as cNFTs via Bubblegum — compressed Merkle tree storage for 10,000+ attendees. SIP stealth addresses prevent wallet-based attendee tracking.",
    category: "conference",
    tier: "vip",
    attendeeCount: 10500,
    isActive: true,
    icon: "\u{1F3DF}\uFE0F",
  },
  {
    id: "kyd-hacker-house-dubai",
    title: "Solana Hacker House Dubai",
    description:
      "48-hour build sprint with cNFT access passes. Tickets distributed via Bubblegum concurrent Merkle trees — O(log n) verification. Private attendance proofs via viewing keys.",
    category: "hackathon",
    tier: "general",
    attendeeCount: 450,
    isActive: true,
    icon: "\u{1F4BB}",
  },
  {
    id: "kyd-validator-workshop",
    title: "Validator Operations Workshop",
    description:
      "Hands-on workshop for Solana validators. cNFT tickets with metadata storing workshop tier and skill level. Attendance verified via compressed proof without revealing identity.",
    category: "workshop",
    tier: "early_bird",
    attendeeCount: 180,
    isActive: true,
    icon: "\u{1F9EA}",
  },
  {
    id: "kyd-superteam-meetup",
    title: "Superteam Indonesia Meetup",
    description:
      "Monthly Superteam gathering. Free cNFT tickets minted in batch via Bubblegum — 1000 tickets in a single transaction. Anonymous RSVPs preserve member privacy.",
    category: "meetup",
    tier: "general",
    attendeeCount: 320,
    isActive: true,
    icon: "\u{1F91D}",
  },
  {
    id: "kyd-grizzlython-closing",
    title: "Grizzlython Closing Ceremony",
    description:
      "Live hackathon award ceremony and celebration. VIP backstage cNFT passes with trait-gated access levels. Stealth transfers enable anonymous ticket gifting.",
    category: "concert",
    tier: "backstage",
    attendeeCount: 2800,
    isActive: true,
    icon: "\u{1F3B5}",
  },
  {
    id: "kyd-depin-summit",
    title: "DePIN Infrastructure Summit",
    description:
      "Conference on decentralized physical infrastructure. Early bird cNFT tickets with Bubblegum compressed metadata — cost 100x less than regular NFTs to mint.",
    category: "conference",
    tier: "early_bird",
    attendeeCount: 1200,
    isActive: true,
    icon: "\u{1F4E1}",
  },
  {
    id: "kyd-monke-dao-party",
    title: "MonkeDAO Community Party",
    description:
      "Exclusive MonkeDAO social. NFT-gated cNFT tickets — hold a Solana Monkey Business to claim. Private check-in via SIP viewing keys protects member anonymity.",
    category: "meetup",
    tier: "vip",
    attendeeCount: 500,
    isActive: true,
    icon: "\u{1F435}",
  },
]

const KYD_TICKETS: Ticket[] = [
  {
    eventId: "kyd-breakpoint-2026",
    tier: "vip",
    commitmentHash: "0x8e2f...a1c3",
    purchasedAt: Date.now() - 14 * 24 * 3600_000,
  },
  {
    eventId: "kyd-hacker-house-dubai",
    tier: "general",
    commitmentHash: "0x3b7d...f9e2",
    purchasedAt: Date.now() - 5 * 24 * 3600_000,
  },
  {
    eventId: "kyd-superteam-meetup",
    tier: "general",
    commitmentHash: "0xc4a1...82d7",
    purchasedAt: Date.now() - 2 * 24 * 3600_000,
  },
]

const KYD_ATTENDEES = [
  { address: "KYD...v8a", events: 23, tier: "backstage" },
  { address: "S1P...x7a", events: 17, tier: "vip" },
  { address: "7Kz...m3b", events: 12, tier: "vip" },
  { address: "Fg2...p9c", events: 9, tier: "early_bird" },
  { address: "Bx8...k1d", events: 6, tier: "general" },
  { address: "Qm5...r4e", events: 4, tier: "general" },
  { address: "Mn3...w2d", events: 2, tier: "general" },
]

// ---------------------------------------------------------------------------
// Attempt to fetch events from KYD API
// ---------------------------------------------------------------------------

interface KYDApiEvent {
  id?: string
  slug?: string
  name?: string
  title?: string
  description?: string
  category?: string
  type?: string
  attendee_count?: number
  attendees?: number
  capacity?: number
  is_active?: boolean
  status?: string
  image_url?: string
  tiers?: Array<{ name?: string; price?: number }>
}

function inferCategory(event: KYDApiEvent): EventCategory {
  const text =
    `${event.category || ""} ${event.type || ""} ${event.name || ""} ${event.description || ""}`.toLowerCase()

  if (text.includes("hackathon") || text.includes("hacker house"))
    return "hackathon"
  if (text.includes("workshop") || text.includes("bootcamp")) return "workshop"
  if (
    text.includes("meetup") ||
    text.includes("gathering") ||
    text.includes("community")
  )
    return "meetup"
  if (
    text.includes("concert") ||
    text.includes("party") ||
    text.includes("music")
  )
    return "concert"
  return "conference"
}

function inferTier(
  event: KYDApiEvent
): "general" | "early_bird" | "vip" | "backstage" {
  if (event.tiers?.length) {
    const tierNames = event.tiers.map((t) => (t.name || "").toLowerCase())
    if (tierNames.some((n) => n.includes("backstage"))) return "backstage"
    if (tierNames.some((n) => n.includes("vip"))) return "vip"
    if (tierNames.some((n) => n.includes("early"))) return "early_bird"
  }
  return "general"
}

function categoryIcon(category: EventCategory): string {
  const icons: Record<EventCategory, string> = {
    conference: "\u{1F3DF}\uFE0F",
    hackathon: "\u{1F4BB}",
    workshop: "\u{1F9EA}",
    meetup: "\u{1F91D}",
    concert: "\u{1F3B5}",
  }
  return icons[category]
}

function mapKYDEvent(raw: KYDApiEvent): Event {
  const category = inferCategory(raw)
  return {
    id: raw.id || raw.slug || `kyd-${Date.now()}`,
    title: raw.name || raw.title || "KYD Event",
    description:
      raw.description ||
      "Solana ecosystem event with cNFT tickets minted via Metaplex Bubblegum.",
    category,
    tier: inferTier(raw),
    attendeeCount: raw.attendee_count || raw.attendees || raw.capacity || 0,
    isActive: raw.is_active ?? (raw.status ? raw.status === "active" : true),
    icon: categoryIcon(category),
  }
}

/**
 * Attempt a direct REST call to KYD Labs API.
 * Returns null on any failure so callers can fall back to curated data.
 */
async function kydFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${KYD_API_BASE}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      logger.warn(
        `[SIP][KYD] API returned ${response.status} for ${path}`,
        "KYDReader"
      )
      return null
    }

    const json = await response.json()

    // Handle various response shapes
    if (Array.isArray(json)) return json as T
    if (json?.data) return json.data as T
    if (json?.events) return json.events as T
    if (json?.results) return json.results as T

    return json as T
  } catch (error) {
    logger.warn(
      `[SIP][KYD] API fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "KYDReader"
    )
    return null
  }
}

// ---------------------------------------------------------------------------
// KYDReader
// ---------------------------------------------------------------------------

export class KYDReader {
  private mode: TicketingMode

  constructor(mode: TicketingMode = "simulation") {
    this.mode = mode
  }

  async getEvents(): Promise<Event[]> {
    if (this.mode === "kyd") {
      const cached = getCached<Event[]>("kyd:events")
      if (cached) return cached

      // Try fetching from KYD API
      const result = await kydFetch<KYDApiEvent[]>("/events")

      if (result?.length) {
        const events = result.map(mapKYDEvent)
        setCache("kyd:events", events)
        logger.info(
          `[SIP][KYD] Fetched ${events.length} live events`,
          "KYDReader"
        )
        return events
      }

      // Try alternative endpoints
      const altResult = await kydFetch<KYDApiEvent[]>("/v1/events")

      if (altResult?.length) {
        const events = altResult.map(mapKYDEvent)
        setCache("kyd:events", events)
        logger.info(
          `[SIP][KYD] Fetched ${events.length} events from v1 API`,
          "KYDReader"
        )
        return events
      }

      // Fall back to curated KYD event data
      logger.warn(
        "[SIP][KYD] Could not fetch live events, using curated cNFT ticket data",
        "KYDReader"
      )
      setCache("kyd:events", KYD_EVENTS)
      return KYD_EVENTS
    }

    return SAMPLE_EVENTS
  }

  async getEvent(id: string): Promise<Event | undefined> {
    if (this.mode === "kyd") {
      const cacheKey = `kyd:event:${id}`
      const cached = getCached<Event>(cacheKey)
      if (cached) return cached

      // Try direct event fetch
      const result = await kydFetch<KYDApiEvent>(`/events/${id}`)

      if (result?.id || result?.slug) {
        const event = mapKYDEvent(result)
        setCache(cacheKey, event)
        return event
      }

      // Fall through to finding in full list
      const allEvents = await this.getEvents()
      return allEvents.find((e) => e.id === id)
    }

    return SAMPLE_EVENTS.find((e) => e.id === id)
  }

  async getTickets(): Promise<Ticket[]> {
    if (this.mode === "kyd") {
      const cached = getCached<Ticket[]>("kyd:tickets")
      if (cached) return cached

      // Ticket ownership requires wallet authentication
      // Use curated data referencing cNFT ticket patterns
      logger.warn(
        "[SIP][KYD] Ticket lookup requires wallet auth, using curated data",
        "KYDReader"
      )
      setCache("kyd:tickets", KYD_TICKETS)
      return KYD_TICKETS
    }

    return SAMPLE_TICKETS
  }

  async getEventsByCategory(category: EventCategory): Promise<Event[]> {
    const events = await this.getEvents()
    return events.filter((e) => e.category === category)
  }

  async getAttendees(): Promise<
    { address: string; events: number; tier: string }[]
  > {
    if (this.mode === "kyd") {
      const cached = getCached<typeof KYD_ATTENDEES>("kyd:attendees")
      if (cached) return cached

      setCache("kyd:attendees", KYD_ATTENDEES)
      return KYD_ATTENDEES
    }

    return [
      { address: "S1P...x7a", events: 12, tier: "vip" },
      { address: "7Kz...m3b", events: 9, tier: "vip" },
      { address: "Fg2...p9c", events: 7, tier: "general" },
      { address: "Bx8...k1d", events: 5, tier: "early_bird" },
      { address: "Qm5...r4e", events: 3, tier: "general" },
    ]
  }

  /**
   * Verify a cNFT ticket asset via Helius DAS API (getAsset).
   * KYD mints tickets as compressed NFTs via Metaplex Bubblegum.
   * This method verifies the asset exists on-chain and returns
   * ownership and metadata info.
   */
  async verifyTicketAsset(assetId: string): Promise<{
    verified: boolean
    owner: string | null
    metadata: Record<string, unknown> | null
  }> {
    const heliusUrl = getHeliusUrl()
    if (!heliusUrl) {
      return { verified: false, owner: null, metadata: null }
    }

    const cacheKey = `kyd:asset:${assetId}`
    const cached = getCached<{
      verified: boolean
      owner: string | null
      metadata: Record<string, unknown> | null
    }>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(heliusUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "kyd-verify",
          method: "getAsset",
          params: { id: assetId },
        }),
        signal: AbortSignal.timeout(8000),
      })

      if (!response.ok) {
        logger.warn(
          `[SIP][KYD] Helius DAS returned ${response.status} for asset ${assetId.slice(0, 8)}...`,
          "KYDReader"
        )
        return { verified: false, owner: null, metadata: null }
      }

      const data = await response.json()
      const asset = data?.result

      if (!asset) {
        return { verified: false, owner: null, metadata: null }
      }

      const result = {
        verified: true,
        owner: asset.ownership?.owner ?? null,
        metadata: asset.content?.metadata ?? null,
      }

      setCache(cacheKey, result)
      logger.info(
        `[SIP][KYD] Verified cNFT ticket ${assetId.slice(0, 8)}... owner=${result.owner?.slice(0, 8) ?? "unknown"}`,
        "KYDReader"
      )
      return result
    } catch (err) {
      logger.warn(
        `[SIP][KYD] cNFT verification failed: ${err instanceof Error ? err.message : err}`,
        "KYDReader"
      )
      return { verified: false, owner: null, metadata: null }
    }
  }

  clearCache(): void {
    cache.clear()
  }
}
