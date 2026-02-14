import { describe, it, expect } from "vitest"
import { TapestryReader } from "@/lib/social/tapestry-reader"

describe("TapestryReader", () => {
  describe("simulation mode", () => {
    const reader = new TapestryReader("simulation")

    it("returns sample profiles", async () => {
      const profiles = await reader.getProfiles()
      expect(profiles.length).toBeGreaterThanOrEqual(5)
      expect(profiles[0]).toHaveProperty("id")
      expect(profiles[0]).toHaveProperty("username")
      expect(profiles[0]).toHaveProperty("stealthAddress")
    })

    it("returns a specific profile by id", async () => {
      const profile = await reader.getProfile("profile-dolphin")
      expect(profile).toBeDefined()
      expect(profile?.username).toBe("anon_dolphin")
    })

    it("returns undefined for unknown profile", async () => {
      const profile = await reader.getProfile("nonexistent")
      expect(profile).toBeUndefined()
    })

    it("returns all posts", async () => {
      const posts = await reader.getPosts()
      expect(posts.length).toBeGreaterThanOrEqual(10)
    })

    it("filters posts by profileId", async () => {
      const posts = await reader.getPosts("profile-dolphin")
      expect(posts.length).toBeGreaterThanOrEqual(3)
      expect(posts.every((p) => p.authorProfileId === "profile-dolphin")).toBe(true)
    })

    it("returns connections for a profile", async () => {
      const connections = await reader.getConnections("profile-dolphin")
      expect(connections.length).toBeGreaterThanOrEqual(2)
      expect(
        connections.every(
          (c) =>
            c.fromProfileId === "profile-dolphin" ||
            c.toProfileId === "profile-dolphin",
        ),
      ).toBe(true)
    })

    it("returns feed sorted by timestamp (newest first)", async () => {
      const feed = await reader.getFeed()
      expect(feed.length).toBeGreaterThanOrEqual(10)
      for (let i = 1; i < feed.length; i++) {
        expect(feed[i - 1].timestamp).toBeGreaterThanOrEqual(feed[i].timestamp)
      }
    })

    it("feed posts have required fields", async () => {
      const feed = await reader.getFeed()
      const post = feed[0]
      expect(post).toHaveProperty("id")
      expect(post).toHaveProperty("authorUsername")
      expect(post).toHaveProperty("timestamp")
      expect(post).toHaveProperty("likeCount")
    })

    it("includes encrypted and public posts", async () => {
      const posts = await reader.getPosts()
      const encrypted = posts.filter((p) => p.isEncrypted)
      const publicPosts = posts.filter((p) => !p.isEncrypted)
      expect(encrypted.length).toBeGreaterThanOrEqual(1)
      expect(publicPosts.length).toBeGreaterThanOrEqual(1)
    })

    it("encrypted posts have encryptedContent", async () => {
      const posts = await reader.getPosts()
      const encrypted = posts.filter((p) => p.isEncrypted)
      expect(encrypted.every((p) => p.encryptedContent)).toBe(true)
    })

    it("returns empty connections for profile with no connections", async () => {
      // ghost_trader only has conn-007 where they follow dolphin
      const connections = await reader.getConnections("profile-artist")
      expect(connections.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe("tapestry mode", () => {
    const reader = new TapestryReader("tapestry")

    it("throws not implemented for getProfiles", async () => {
      await expect(reader.getProfiles()).rejects.toThrow("Tapestry mode is not yet implemented")
    })

    it("throws not implemented for getProfile", async () => {
      await expect(reader.getProfile("any")).rejects.toThrow("Tapestry mode is not yet implemented")
    })

    it("throws not implemented for getPosts", async () => {
      await expect(reader.getPosts()).rejects.toThrow("Tapestry mode is not yet implemented")
    })

    it("throws not implemented for getConnections", async () => {
      await expect(reader.getConnections("any")).rejects.toThrow("Tapestry mode is not yet implemented")
    })

    it("throws not implemented for getFeed", async () => {
      await expect(reader.getFeed()).rejects.toThrow("Tapestry mode is not yet implemented")
    })
  })
})
