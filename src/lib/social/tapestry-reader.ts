import { SocialFi } from "socialfi"
import type {
  GetProfilesResponseSchema,
  GetProfileDetailsSchema,
  GetContestsResponseSchema,
  GetProfileFollowersResponseSchema,
} from "socialfi"
import { PrivacyLevel } from "@sip-protocol/types"
import type {
  StealthProfile,
  SocialPost,
  SocialConnection,
  SocialMode,
} from "./types"
import { SAMPLE_PROFILES, SAMPLE_POSTS, SAMPLE_CONNECTIONS } from "./constants"

// ---------------------------------------------------------------------------
// Cache — 5-minute TTL, keyed by method + args
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
// Tapestry client singleton
// ---------------------------------------------------------------------------

let clientInstance: SocialFi<unknown> | null = null

function getApiKey(): string | undefined {
  return (
    process.env.TAPESTRY_API_KEY ??
    process.env.NEXT_PUBLIC_TAPESTRY_API_KEY ??
    undefined
  )
}

function getClient(): SocialFi<unknown> | null {
  const apiKey = getApiKey()
  if (!apiKey) return null

  if (!clientInstance) {
    clientInstance = new SocialFi({
      baseURL: "https://api.usetapestry.dev/api/v1",
    })
  }
  return clientInstance
}

// ---------------------------------------------------------------------------
// Mappers — Tapestry responses → SIP app types
// ---------------------------------------------------------------------------

function deterministicHex(seed: string, pad: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(16).padStart(64, pad)
}

function mapProfile(
  item: GetProfilesResponseSchema["profiles"][number]
): StealthProfile {
  const p = item.profile
  const username = p.username ?? p.id
  return {
    id: p.id,
    username,
    bio: p.bio ?? "",
    stealthAddress: `sip:solana:0x${deterministicHex(username, "a")}`,
    stealthMetaAddress: `st:sol:0x${deterministicHex(username, "b")}`,
    viewingPrivateKey: "0x" + "00".repeat(32),
    spendingPrivateKey: "0x" + "00".repeat(32),
    createdAt: p.created_at ?? Date.now(),
    postCount: 0,
    followerCount: item.socialCounts?.followers ?? 0,
    followingCount: item.socialCounts?.following ?? 0,
  }
}

function mapProfileDetail(detail: GetProfileDetailsSchema): StealthProfile {
  const p = detail.profile
  const username = p.username ?? p.id
  return {
    id: p.id,
    username,
    bio: p.bio ?? "",
    stealthAddress: `sip:solana:0x${deterministicHex(username, "a")}`,
    stealthMetaAddress: `st:sol:0x${deterministicHex(username, "b")}`,
    viewingPrivateKey: "0x" + "00".repeat(32),
    spendingPrivateKey: "0x" + "00".repeat(32),
    createdAt: p.created_at ?? Date.now(),
    postCount: 0,
    followerCount: detail.socialCounts?.followers ?? 0,
    followingCount: detail.socialCounts?.following ?? 0,
  }
}

function mapContentToPost(
  item: GetContestsResponseSchema["contents"][number]
): SocialPost {
  const content = item.content
  const author = item.authorProfile
  return {
    id: content?.id ?? `post-${Date.now()}`,
    authorProfileId: author?.id ?? "unknown",
    authorUsername: author?.username ?? "unknown",
    content: content?.id ?? "",
    timestamp: content?.created_at ?? Date.now(),
    likeCount: item.socialCounts?.likeCount ?? 0,
    commentCount: item.socialCounts?.commentCount ?? 0,
    isEncrypted: false,
    privacyLevel: PrivacyLevel.TRANSPARENT,
  }
}

function mapFollowerToConnection(
  follower: GetProfileFollowersResponseSchema["profiles"][number],
  targetProfileId: string,
  direction: "inbound" | "outbound"
): SocialConnection {
  const fromId = direction === "inbound" ? follower.id : targetProfileId
  const toId = direction === "inbound" ? targetProfileId : follower.id
  const fromUsername = direction === "inbound" ? follower.username : "self"
  const toUsername = direction === "inbound" ? "self" : follower.username

  return {
    id: `conn-${fromId}-${toId}`,
    fromProfileId: fromId,
    fromUsername,
    toProfileId: toId,
    toUsername,
    isEncrypted: false,
    createdAt: follower.created_at ?? Date.now(),
  }
}

// ---------------------------------------------------------------------------
// TapestryReader
// ---------------------------------------------------------------------------

export class TapestryReader {
  private mode: SocialMode

  constructor(mode: SocialMode = "simulation") {
    this.mode = mode
  }

  // ---- Profiles -----------------------------------------------------------

  async getProfiles(): Promise<StealthProfile[]> {
    if (this.mode === "tapestry") {
      const apiKey = getApiKey()
      const client = getClient()

      if (!client || !apiKey) {
        console.warn(
          "[SIP] Tapestry API key not configured, falling back to simulation"
        )
        return SAMPLE_PROFILES
      }

      const cacheKey = "profiles:list"
      const cached = getCached<StealthProfile[]>(cacheKey)
      if (cached) return cached

      try {
        const response = await client.profiles.profilesList({ apiKey })
        const profiles = response.profiles.map(mapProfile)
        setCache(cacheKey, profiles)
        return profiles
      } catch (err) {
        console.warn(
          "[SIP] Tapestry getProfiles failed, using simulation:",
          err
        )
        return SAMPLE_PROFILES
      }
    }

    return SAMPLE_PROFILES
  }

  async getProfile(id: string): Promise<StealthProfile | undefined> {
    if (this.mode === "tapestry") {
      const apiKey = getApiKey()
      const client = getClient()

      if (!client || !apiKey) {
        console.warn(
          "[SIP] Tapestry API key not configured, falling back to simulation"
        )
        return SAMPLE_PROFILES.find((p) => p.id === id)
      }

      const cacheKey = `profiles:detail:${id}`
      const cached = getCached<StealthProfile>(cacheKey)
      if (cached) return cached

      try {
        const detail = await client.profiles.profilesDetail({ apiKey, id })
        const profile = mapProfileDetail(detail)
        setCache(cacheKey, profile)
        return profile
      } catch (err) {
        console.warn("[SIP] Tapestry getProfile failed, using simulation:", err)
        return SAMPLE_PROFILES.find((p) => p.id === id)
      }
    }

    return SAMPLE_PROFILES.find((p) => p.id === id)
  }

  // ---- Posts / Content ----------------------------------------------------

  async getPosts(profileId?: string): Promise<SocialPost[]> {
    if (this.mode === "tapestry") {
      const apiKey = getApiKey()
      const client = getClient()

      if (!client || !apiKey) {
        console.warn(
          "[SIP] Tapestry API key not configured, falling back to simulation"
        )
        return profileId
          ? SAMPLE_POSTS.filter((p) => p.authorProfileId === profileId)
          : SAMPLE_POSTS
      }

      const cacheKey = `contents:list:${profileId ?? "all"}`
      const cached = getCached<SocialPost[]>(cacheKey)
      if (cached) return cached

      try {
        const params: Parameters<typeof client.contents.contentsList>[0] = {
          apiKey,
        }
        if (profileId) {
          params.profileId = profileId
        }
        const response = await client.contents.contentsList(params)
        const posts = response.contents.map(mapContentToPost)
        setCache(cacheKey, posts)
        return posts
      } catch (err) {
        console.warn("[SIP] Tapestry getPosts failed, using simulation:", err)
        return profileId
          ? SAMPLE_POSTS.filter((p) => p.authorProfileId === profileId)
          : SAMPLE_POSTS
      }
    }

    if (profileId) {
      return SAMPLE_POSTS.filter((p) => p.authorProfileId === profileId)
    }
    return SAMPLE_POSTS
  }

  // ---- Connections --------------------------------------------------------

  async getConnections(profileId: string): Promise<SocialConnection[]> {
    if (this.mode === "tapestry") {
      const apiKey = getApiKey()
      const client = getClient()

      if (!client || !apiKey) {
        console.warn(
          "[SIP] Tapestry API key not configured, falling back to simulation"
        )
        return SAMPLE_CONNECTIONS.filter(
          (c) => c.fromProfileId === profileId || c.toProfileId === profileId
        )
      }

      const cacheKey = `connections:${profileId}`
      const cached = getCached<SocialConnection[]>(cacheKey)
      if (cached) return cached

      try {
        const [followersRes, followingRes] = await Promise.all([
          client.profiles.followersList({ apiKey, id: profileId }),
          client.profiles.followingList({ apiKey, id: profileId }),
        ])

        const inbound = followersRes.profiles.map((f) =>
          mapFollowerToConnection(f, profileId, "inbound")
        )
        const outbound = followingRes.profiles.map((f) =>
          mapFollowerToConnection(f, profileId, "outbound")
        )

        const connections = [...inbound, ...outbound]
        setCache(cacheKey, connections)
        return connections
      } catch (err) {
        console.warn(
          "[SIP] Tapestry getConnections failed, using simulation:",
          err
        )
        return SAMPLE_CONNECTIONS.filter(
          (c) => c.fromProfileId === profileId || c.toProfileId === profileId
        )
      }
    }

    return SAMPLE_CONNECTIONS.filter(
      (c) => c.fromProfileId === profileId || c.toProfileId === profileId
    )
  }

  // ---- Feed ---------------------------------------------------------------

  async getFeed(): Promise<SocialPost[]> {
    if (this.mode === "tapestry") {
      const apiKey = getApiKey()
      const client = getClient()

      if (!client || !apiKey) {
        console.warn(
          "[SIP] Tapestry API key not configured, falling back to simulation"
        )
        return [...SAMPLE_POSTS].sort((a, b) => b.timestamp - a.timestamp)
      }

      const cacheKey = "feed:global"
      const cached = getCached<SocialPost[]>(cacheKey)
      if (cached) return cached

      try {
        // Feed requires a username — try fetching content list as global feed
        const response = await client.contents.contentsList({ apiKey })
        const posts = response.contents
          .map(mapContentToPost)
          .sort((a, b) => b.timestamp - a.timestamp)
        setCache(cacheKey, posts)
        return posts
      } catch {
        // Content-based feed failed — fall back to simulation
        console.warn("[SIP] Tapestry getFeed failed, using simulation")
        return [...SAMPLE_POSTS].sort((a, b) => b.timestamp - a.timestamp)
      }
    }

    return [...SAMPLE_POSTS].sort((a, b) => b.timestamp - a.timestamp)
  }
}
