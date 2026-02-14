import type {
  StealthProfile,
  SocialPost,
  SocialConnection,
  SocialMode,
} from "./types"
import { SAMPLE_PROFILES, SAMPLE_POSTS, SAMPLE_CONNECTIONS } from "./constants"

export class TapestryReader {
  private mode: SocialMode

  constructor(mode: SocialMode = "simulation") {
    this.mode = mode
  }

  async getProfiles(): Promise<StealthProfile[]> {
    if (this.mode === "simulation") {
      return SAMPLE_PROFILES
    }
    throw new Error(
      "Tapestry mode is not yet implemented. Use simulation mode."
    )
  }

  async getProfile(id: string): Promise<StealthProfile | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_PROFILES.find((p) => p.id === id)
    }
    throw new Error(
      "Tapestry mode is not yet implemented. Use simulation mode."
    )
  }

  async getPosts(profileId?: string): Promise<SocialPost[]> {
    if (this.mode === "simulation") {
      if (profileId) {
        return SAMPLE_POSTS.filter((p) => p.authorProfileId === profileId)
      }
      return SAMPLE_POSTS
    }
    throw new Error(
      "Tapestry mode is not yet implemented. Use simulation mode."
    )
  }

  async getConnections(profileId: string): Promise<SocialConnection[]> {
    if (this.mode === "simulation") {
      return SAMPLE_CONNECTIONS.filter(
        (c) => c.fromProfileId === profileId || c.toProfileId === profileId
      )
    }
    throw new Error(
      "Tapestry mode is not yet implemented. Use simulation mode."
    )
  }

  async getFeed(): Promise<SocialPost[]> {
    if (this.mode === "simulation") {
      return [...SAMPLE_POSTS].sort((a, b) => b.timestamp - a.timestamp)
    }
    throw new Error(
      "Tapestry mode is not yet implemented. Use simulation mode."
    )
  }
}
