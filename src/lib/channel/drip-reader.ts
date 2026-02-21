import type {
  Drop,
  ChannelSubscription,
  AccessTier,
  ContentType,
  ChannelMode,
} from "./types"
import { SAMPLE_DROPS, SAMPLE_SUBSCRIPTIONS } from "./constants"

// ---------------------------------------------------------------------------
// Cache — 5-minute TTL
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ---------------------------------------------------------------------------
// Helius DAS API — fetch real DRiP NFT collections from Solana mainnet
// ---------------------------------------------------------------------------

// DRiP verified creator address on Solana mainnet
const DRIP_CREATOR = "DRiPPP2LytGnVb8oRGENnQBWnKCuaeGkJdMtfFhAHBJi"

// Known DRiP collection addresses for targeted lookups
const DRIP_COLLECTIONS = [
  "DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WvJtDVSBX9EHVwC1", // DRiP Season 1
  "DRiPsaveraNf3SSdVGHEV7GQPoSCASWYkzjBatUvbRiA", // DRiP Season 2
  "DRiPDDo9LqFCQMFXZ6hfErzvJQN7c7jvSbfbuFP7hoFC", // DRiP Featured
]

function getHeliusUrl(): string | null {
  const key =
    (typeof process !== "undefined" &&
      (process.env?.NEXT_PUBLIC_HELIUS_API_KEY ||
        process.env?.HELIUS_API_KEY)) ||
    null
  if (!key) return null
  return `https://mainnet.helius-rpc.com/?api-key=${key}`
}

// Helius DAS asset shape (subset we use)
interface HeliusAsset {
  id: string
  content?: {
    metadata?: {
      name?: string
      description?: string
      symbol?: string
    }
    links?: {
      image?: string
      external_url?: string
    }
    json_uri?: string
  }
  authorities?: { address: string }[]
  creators?: { address: string; verified: boolean }[]
  grouping?: { group_key: string; group_value: string }[]
  ownership?: {
    owner: string
  }
}

interface HeliusDASResponse {
  result?: {
    items?: HeliusAsset[]
    total?: number
  }
  error?: { message: string }
}

// Map a Helius DAS asset to our Drop interface
function mapAssetToDrop(asset: HeliusAsset, index: number): Drop {
  const meta = asset.content?.metadata
  const name = meta?.name ?? `DRiP Drop #${index + 1}`
  const description = meta?.description ?? "A DRiP NFT collectible on Solana"

  // Derive content type and access tier from metadata heuristics
  const lowerName = name.toLowerCase()
  const lowerDesc = description.toLowerCase()

  let contentType: ContentType = "article"
  if (lowerName.includes("tutorial") || lowerDesc.includes("tutorial")) {
    contentType = "tutorial"
  } else if (lowerName.includes("deep") || lowerDesc.includes("deep dive")) {
    contentType = "deep_dive"
  } else if (lowerName.includes("alpha") || lowerDesc.includes("exclusive")) {
    contentType = "alpha"
  }

  let accessTier: AccessTier = "free"
  if (contentType === "alpha") {
    accessTier = "premium"
  } else if (contentType === "tutorial" || contentType === "deep_dive") {
    accessTier = "subscriber"
  }

  // Derive a stable subscriber count from the asset id
  let hash = 0
  for (let i = 0; i < asset.id.length; i++) {
    hash = ((hash << 5) - hash + asset.id.charCodeAt(i)) | 0
  }
  const subscriberCount = 50 + (Math.abs(hash) % 500)

  return {
    id: asset.id,
    title: name,
    description,
    contentType,
    accessTier,
    author: meta?.symbol ?? "DRiP",
    publishedAt: Date.now() - (index + 1) * 86400_000,
    subscriberCount,
    isEncrypted: accessTier !== "free",
    icon:
      accessTier === "premium"
        ? "\u{1F48E}"
        : accessTier === "subscriber"
          ? "\u{1F510}"
          : "\u{1F4E6}",
  }
}

// Fetch DRiP NFT drops via Helius DAS API (getAssetsByCreator)
async function fetchDripDropsFromHelius(): Promise<Drop[] | null> {
  const heliusUrl = getHeliusUrl()
  if (!heliusUrl) return null

  // Try fetching by creator first (most reliable for DRiP)
  const response = await fetch(heliusUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "drip-drops",
      method: "getAssetsByCreator",
      params: {
        creatorAddress: DRIP_CREATOR,
        onlyVerified: true,
        page: 1,
        limit: 10,
        sortBy: { sortBy: "created", sortDirection: "desc" },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Helius API returned ${response.status}`)
  }

  const data: HeliusDASResponse = await response.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  const items = data.result?.items
  if (!items || items.length === 0) {
    // Fallback: try fetching by collection group
    return fetchDripDropsByCollection(heliusUrl)
  }

  return items.map(mapAssetToDrop)
}

// Fallback: fetch by known DRiP collection address
async function fetchDripDropsByCollection(
  heliusUrl: string
): Promise<Drop[] | null> {
  for (const collectionAddr of DRIP_COLLECTIONS) {
    try {
      const response = await fetch(heliusUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "drip-collection",
          method: "getAssetsByGroup",
          params: {
            groupKey: "collection",
            groupValue: collectionAddr,
            page: 1,
            limit: 10,
            sortBy: { sortBy: "created", sortDirection: "desc" },
          },
        }),
      })

      if (!response.ok) continue

      const data: HeliusDASResponse = await response.json()
      const items = data.result?.items
      if (items && items.length > 0) {
        return items.map(mapAssetToDrop)
      }
    } catch {
      // Try next collection
      continue
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// DripReader
// ---------------------------------------------------------------------------

export class DripReader {
  private mode: ChannelMode

  constructor(mode: ChannelMode = "simulation") {
    this.mode = mode
  }

  async getDrops(): Promise<Drop[]> {
    if (this.mode !== "drip") {
      return SAMPLE_DROPS
    }

    const cacheKey = "drip:drops"
    const cached = getCached<Drop[]>(cacheKey)
    if (cached) return cached

    try {
      const drops = await fetchDripDropsFromHelius()
      if (drops && drops.length > 0) {
        setCache(cacheKey, drops)
        return drops
      }
      console.warn(
        "[SIP] DRiP Helius fetch returned no results, using simulation data"
      )
      return SAMPLE_DROPS
    } catch (err) {
      console.warn(
        "[SIP] DRiP live fetch failed, using simulation data:",
        err instanceof Error ? err.message : err
      )
      return SAMPLE_DROPS
    }
  }

  async getDrop(id: string): Promise<Drop | undefined> {
    if (this.mode !== "drip") {
      return SAMPLE_DROPS.find((d) => d.id === id)
    }

    // Check single-item cache
    const singleKey = `drip:drop:${id}`
    const cached = getCached<Drop>(singleKey)
    if (cached) return cached

    // Try to find in the list cache first
    const listCached = getCached<Drop[]>("drip:drops")
    if (listCached) {
      const found = listCached.find((d) => d.id === id)
      if (found) {
        setCache(singleKey, found)
        return found
      }
    }

    // If the id looks like a Solana address, try fetching directly via Helius
    const heliusUrl = getHeliusUrl()
    if (heliusUrl && id.length >= 32) {
      try {
        const response = await fetch(heliusUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "drip-single",
            method: "getAsset",
            params: { id },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.result) {
            const drop = mapAssetToDrop(data.result, 0)
            setCache(singleKey, drop)
            return drop
          }
        }
      } catch (err) {
        console.warn(
          "[SIP] DRiP single asset fetch failed:",
          err instanceof Error ? err.message : err
        )
      }
    }

    // Fall back to simulation
    return SAMPLE_DROPS.find((d) => d.id === id)
  }

  async getSubscriptions(): Promise<ChannelSubscription[]> {
    // Subscriptions are local state — no live API equivalent
    return SAMPLE_SUBSCRIPTIONS
  }

  async getDropsByTier(tier: AccessTier): Promise<Drop[]> {
    const drops = await this.getDrops()
    return drops.filter((d) => d.accessTier === tier)
  }

  clearCache(): void {
    cache.clear()
  }
}
