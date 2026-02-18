import type {
  ApiCampaign,
  ApiRewardType,
} from "@torque-labs/torque-ts-sdk"
import type {
  Campaign,
  CampaignProgress,
  CampaignActionType,
  CampaignStatus,
  LoyaltyReward,
  LoyaltyTier,
  LoyaltyMode,
} from "./types"
import {
  SAMPLE_CAMPAIGNS,
  SAMPLE_PROGRESS,
  SAMPLE_REWARDS,
  calculateTier,
} from "./constants"

// ---------------------------------------------------------------------------
// Torque REST API configuration
// ---------------------------------------------------------------------------

const TORQUE_API_BASE = "https://api.torque.so"
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Module-level cache shared across reader instances
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
// Direct Torque API fetch (bypasses SDK wallet requirement)
// ---------------------------------------------------------------------------

/**
 * Attempt a direct REST call to the Torque API.
 * Uses the API key header if available, otherwise tries without auth.
 * Returns null on any failure so callers can fall back to simulation.
 */
async function torqueFetch<T>(
  path: string,
  apiKey?: string
): Promise<T | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (apiKey) {
      headers["x-torque-api-key"] = apiKey
    }

    const response = await fetch(`${TORQUE_API_BASE}${path}`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.warn(
        `[SIP][Torque] API returned ${response.status} for ${path}`
      )
      return null
    }

    const json = await response.json()

    // Torque wraps responses in { status: "SUCCESS", data: ... }
    if (json?.status === "SUCCESS" && json.data) {
      return json.data as T
    }

    // Some endpoints may return data directly
    if (json?.campaigns || json?.offers || Array.isArray(json)) {
      return json as T
    }

    console.warn("[SIP][Torque] Unexpected response shape", json?.status)
    return null
  } catch (error) {
    console.warn(
      "[SIP][Torque] API fetch failed:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return null
  }
}

// ---------------------------------------------------------------------------
// Torque API campaign -> SIP Campaign mapper
// ---------------------------------------------------------------------------

/**
 * Map a Torque ApiCampaign to our internal Campaign type.
 * Infers actionType from campaign requirements and metadata.
 */
function mapTorqueCampaign(tc: ApiCampaign): Campaign {
  const now = Date.now()
  const startMs = new Date(tc.startTime).getTime()
  const endMs = new Date(tc.endTime).getTime()

  // Determine status
  let status: CampaignStatus = "active"
  if (tc.status === "ENDED" || now > endMs) {
    status = tc.remainingConversions <= 0 ? "completed" : "expired"
  }

  // Infer action type from requirements
  const actionType = inferActionType(tc)

  // Parse reward amount
  const rewardAmount = tc.userRewardAmount
    ? parseFloat(tc.userRewardAmount)
    : 0

  // Determine reward token label
  const rewardToken = resolveTokenLabel(tc.userRewardToken, tc.userRewardType)

  // Icon based on action type
  const icon = actionTypeIcon(actionType)

  return {
    id: tc.id,
    name: tc.title,
    description: tc.description || tc.content || tc.title,
    actionType,
    requiredCount: tc.requirements?.length || 1,
    rewardAmount,
    rewardToken,
    status,
    startDate: startMs,
    endDate: endMs,
    participantCount: tc.totalConversions,
    icon,
  }
}

function inferActionType(tc: ApiCampaign): CampaignActionType {
  if (!tc.requirements?.length) return "shielded_transfer"

  // Check the first requirement's event type
  const firstReq = tc.requirements[0]
  const eventType = firstReq?.type?.toLowerCase() ?? ""

  if (eventType.includes("swap") || eventType.includes("pump_fun"))
    return "shielded_transfer"
  if (eventType.includes("nft") || eventType.includes("tensor"))
    return "stealth_identity"
  if (eventType.includes("realms") || eventType.includes("vote"))
    return "private_vote"
  if (eventType.includes("memo") || eventType.includes("form"))
    return "anonymous_post"
  if (
    eventType.includes("stake") ||
    eventType.includes("lend") ||
    eventType.includes("deposit")
  )
    return "private_bridge"
  if (eventType.includes("click")) return "anonymous_post"

  return "shielded_transfer"
}

function resolveTokenLabel(
  tokenAddress?: string,
  rewardType?: ApiRewardType | string
): string {
  if (rewardType === "POINTS") return "PTS"

  // Well-known Solana token mints
  const knownTokens: Record<string, string> = {
    "So11111111111111111111111111111111111111112": "SOL",
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": "BONK",
    "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL": "JTO",
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": "JUP",
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "mSOL",
    "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ": "DUST",
    "RLBxxFkseAZ4RgJH3Sqn8jXxhmGoz9jWxDNJMh8pL7a": "RLBB",
    "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": "stSOL",
  }

  if (tokenAddress && knownTokens[tokenAddress]) {
    return knownTokens[tokenAddress]
  }

  // Short-form address hint if unknown
  if (tokenAddress && tokenAddress.length > 10) {
    return tokenAddress.slice(0, 4) + "..." + tokenAddress.slice(-4)
  }

  return "SOL"
}

function actionTypeIcon(actionType: CampaignActionType): string {
  const icons: Record<CampaignActionType, string> = {
    shielded_transfer: "\u{1F6E1}\uFE0F",
    stealth_identity: "\u{1F3D7}\uFE0F",
    private_bridge: "\u{1F309}",
    private_vote: "\u{1F5F3}\uFE0F",
    anonymous_post: "\u{1F47B}",
  }
  return icons[actionType] || "\u{1F6E1}\uFE0F"
}

// ---------------------------------------------------------------------------
// TorqueReader - reads campaigns from Torque API with simulation fallback
// ---------------------------------------------------------------------------

export class TorqueReader {
  private mode: LoyaltyMode
  private apiKey: string | undefined

  constructor(mode: LoyaltyMode = "simulation") {
    this.mode = mode
    this.apiKey =
      typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_TORQUE_API_KEY
        : undefined
  }

  // -------------------------------------------------------------------------
  // getCampaigns
  // -------------------------------------------------------------------------

  async getCampaigns(): Promise<Campaign[]> {
    if (this.mode === "torque") {
      const cached = getCached<Campaign[]>("torque:campaigns")
      if (cached) return cached

      // Try fetching from Torque REST API
      const result = await torqueFetch<{ campaigns: ApiCampaign[] }>(
        "/campaigns",
        this.apiKey
      )

      if (result?.campaigns?.length) {
        const campaigns = result.campaigns.map(mapTorqueCampaign)
        setCache("torque:campaigns", campaigns)
        console.info(
          `[SIP][Torque] Fetched ${campaigns.length} live campaigns`
        )
        return campaigns
      }

      // Try the offers endpoint as alternative (public listing)
      const offersResult = await torqueFetch<{ campaigns: ApiCampaign[] }>(
        "/offers",
        this.apiKey
      )

      if (offersResult?.campaigns?.length) {
        const campaigns = offersResult.campaigns.map(mapTorqueCampaign)
        setCache("torque:campaigns", campaigns)
        console.info(
          `[SIP][Torque] Fetched ${campaigns.length} campaigns from offers`
        )
        return campaigns
      }

      console.warn(
        "[SIP][Torque] Could not fetch live campaigns, using simulation data"
      )
    }

    return SAMPLE_CAMPAIGNS
  }

  // -------------------------------------------------------------------------
  // getCampaign
  // -------------------------------------------------------------------------

  async getCampaign(id: string): Promise<Campaign | undefined> {
    if (this.mode === "torque") {
      const cacheKey = `torque:campaign:${id}`
      const cached = getCached<Campaign>(cacheKey)
      if (cached) return cached

      // Try direct campaign fetch by ID
      const result = await torqueFetch<ApiCampaign>(
        `/campaigns/${id}`,
        this.apiKey
      )

      if (result?.id) {
        const campaign = mapTorqueCampaign(result)
        setCache(cacheKey, campaign)
        return campaign
      }

      // Fall through: try finding in the full campaigns list
      const allCampaigns = await this.getCampaigns()
      return allCampaigns.find((c) => c.id === id)
    }

    return SAMPLE_CAMPAIGNS.find((c) => c.id === id)
  }

  // -------------------------------------------------------------------------
  // getProgress
  // -------------------------------------------------------------------------

  async getProgress(
    campaignId: string
  ): Promise<CampaignProgress | undefined> {
    if (this.mode === "torque") {
      // Progress requires user authentication (journey endpoint needs wallet)
      // Fall back to simulation data for now
      console.warn(
        "[SIP][Torque] Progress tracking requires wallet auth, using simulation"
      )
    }

    return SAMPLE_PROGRESS.find((p) => p.campaignId === campaignId)
  }

  // -------------------------------------------------------------------------
  // getRewards
  // -------------------------------------------------------------------------

  async getRewards(): Promise<LoyaltyReward[]> {
    if (this.mode === "torque") {
      // Rewards/payouts require user authentication
      // Fall back to simulation data for now
      console.warn(
        "[SIP][Torque] Rewards require wallet auth, using simulation"
      )
    }

    return SAMPLE_REWARDS
  }

  // -------------------------------------------------------------------------
  // getTier
  // -------------------------------------------------------------------------

  async getTier(): Promise<LoyaltyTier> {
    if (this.mode === "torque") {
      // Tier calculation based on user journey data (requires auth)
      // Fall back to simulation-based tier
      console.warn(
        "[SIP][Torque] Tier calculation requires wallet auth, using simulation"
      )
    }

    const completedCount = SAMPLE_PROGRESS.filter((p) => p.isComplete).length
    return calculateTier(completedCount)
  }

  // -------------------------------------------------------------------------
  // Utility: clear cache (useful for manual refresh)
  // -------------------------------------------------------------------------

  clearCache(): void {
    cache.clear()
  }
}
