import { describe, it, expect, vi, beforeEach } from "vitest"
import { SocialService } from "@/lib/social/social-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type { SocialStep, CreateProfileParams, CreatePostParams, FollowParams } from "@/lib/social/types"

// Mock the SDK to avoid WASM/crypto deps in tests
vi.mock("@sip-protocol/sdk", () => ({
  generateStealthMetaAddress: () => ({
    metaAddress: {
      spendingPublicKey: "0x" + "aa".repeat(32),
      viewingPublicKey: "0x" + "bb".repeat(32),
    },
    spendingPrivateKey: "0x" + "cc".repeat(32),
    viewingPrivateKey: "0x" + "dd".repeat(32),
  }),
  generateStealthAddress: () => ({
    stealthAddress: { address: "0x" + "ee".repeat(32) },
    sharedSecret: "0x" + "ff".repeat(32),
  }),
  encodeStealthMetaAddress: () => "st:sol:0x" + "ab".repeat(32),
  generateViewingKey: () => ({
    key: "0x" + "ab".repeat(32),
    path: "m/44'/501'/0'/0'",
    hash: "0x" + "cd".repeat(16),
  }),
  encryptForViewing: () => ({
    ciphertext: "0x" + "ab".repeat(48),
    nonce: "0x" + "cd".repeat(12),
    viewingKeyHash: "0x" + "ef".repeat(16),
  }),
}))

vi.mock("@/lib/sip-client", () => ({
  getSDK: async () => {
    const sdk = await import("@sip-protocol/sdk")
    return sdk
  },
}))

const validProfileParams: CreateProfileParams = {
  username: "test_user",
  bio: "A test bio",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validPostParams: CreatePostParams = {
  profileId: "profile-dolphin",
  content: "Hello anonymous world",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validFollowParams: FollowParams = {
  fromProfileId: "profile-dolphin",
  toProfileId: "profile-shadow",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("SocialService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects empty username for profile", () => {
      const service = new SocialService()
      const error = service.validate("profile", { ...validProfileParams, username: "" })
      expect(error).toBe("Username is required")
    })

    it("rejects long username for profile", () => {
      const service = new SocialService()
      const error = service.validate("profile", { ...validProfileParams, username: "a".repeat(33) })
      expect(error).toBe("Username must be 32 characters or less")
    })

    it("accepts valid profile params", () => {
      const service = new SocialService()
      const error = service.validate("profile", validProfileParams)
      expect(error).toBeNull()
    })

    it("rejects empty content for post", () => {
      const service = new SocialService()
      const error = service.validate("post", { ...validPostParams, content: "" })
      expect(error).toBe("Content is required")
    })

    it("rejects long content for post", () => {
      const service = new SocialService()
      const error = service.validate("post", { ...validPostParams, content: "a".repeat(281) })
      expect(error).toBe("Content must be 280 characters or less")
    })

    it("rejects empty profileId for post", () => {
      const service = new SocialService()
      const error = service.validate("post", { ...validPostParams, profileId: "" })
      expect(error).toBe("Profile ID is required")
    })

    it("accepts valid post params", () => {
      const service = new SocialService()
      const error = service.validate("post", validPostParams)
      expect(error).toBeNull()
    })

    it("rejects empty fromProfileId for follow", () => {
      const service = new SocialService()
      const error = service.validate("follow", { ...validFollowParams, fromProfileId: "" })
      expect(error).toBe("From profile ID is required")
    })

    it("rejects empty toProfileId for follow", () => {
      const service = new SocialService()
      const error = service.validate("follow", { ...validFollowParams, toProfileId: "" })
      expect(error).toBe("To profile ID is required")
    })

    it("rejects self-follow", () => {
      const service = new SocialService()
      const error = service.validate("follow", { ...validFollowParams, toProfileId: "profile-dolphin" })
      expect(error).toBe("Cannot follow yourself")
    })

    it("accepts valid follow params", () => {
      const service = new SocialService()
      const error = service.validate("follow", validFollowParams)
      expect(error).toBeNull()
    })
  })

  describe("createProfile (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: SocialStep[] = []
      const service = new SocialService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.createProfile(validProfileParams)

      expect(steps).toEqual(["generating_stealth", "creating_profile", "profile_created"])
      expect(result.status).toBe("profile_created")
    })

    it("sets stealth address on result", async () => {
      const service = new SocialService({ mode: "simulation" })
      const result = await service.createProfile(validProfileParams)

      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
      expect(result.username).toBe("test_user")
    })

    it("records step timestamps", async () => {
      const service = new SocialService({ mode: "simulation" })
      const result = await service.createProfile(validProfileParams)

      expect(result.stepTimestamps.generating_stealth).toBeDefined()
      expect(result.stepTimestamps.creating_profile).toBeDefined()
      expect(result.stepTimestamps.profile_created).toBeDefined()
    })

    it("throws on invalid params", async () => {
      const service = new SocialService({ mode: "simulation" })

      await expect(
        service.createProfile({ ...validProfileParams, username: "" }),
      ).rejects.toThrow("Username is required")
    })
  })

  describe("createPost (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: SocialStep[] = []
      const service = new SocialService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.createPost(validPostParams)

      expect(steps).toEqual(["encrypting_content", "publishing", "published"])
      expect(result.status).toBe("published")
    })

    it("encrypts content", async () => {
      const service = new SocialService({ mode: "simulation" })
      const result = await service.createPost(validPostParams)

      expect(result.encryptedContent).toBeTruthy()
      expect(result.postId).toBeTruthy()
    })

    it("throws on empty content", async () => {
      const service = new SocialService({ mode: "simulation" })

      await expect(
        service.createPost({ ...validPostParams, content: "" }),
      ).rejects.toThrow("Content is required")
    })
  })

  describe("followProfile (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: SocialStep[] = []
      const service = new SocialService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.followProfile(validFollowParams)

      expect(steps).toEqual(["generating_stealth", "connecting", "connected"])
      expect(result.status).toBe("connected")
    })

    it("generates shared secret", async () => {
      const service = new SocialService({ mode: "simulation" })
      const result = await service.followProfile(validFollowParams)

      expect(result.sharedSecret).toBeTruthy()
    })

    it("throws on self-follow", async () => {
      const service = new SocialService({ mode: "simulation" })

      await expect(
        service.followProfile({
          ...validFollowParams,
          toProfileId: "profile-dolphin",
        }),
      ).rejects.toThrow("Cannot follow yourself")
    })
  })
})
