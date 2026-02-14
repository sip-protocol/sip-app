import type {
  SocialActionRecord,
  SocialStepChangeCallback,
  SocialMode,
  CreateProfileParams,
  CreatePostParams,
  FollowParams,
} from "./types"
import { SIMULATION_DELAYS, getProfile } from "./constants"
import { generateSocialStealthAddress, encryptSocialContent } from "./stealth-social"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface SocialServiceOptions {
  mode?: SocialMode
  onStepChange?: SocialStepChangeCallback
}

export class SocialService {
  private mode: SocialMode
  private onStepChange?: SocialStepChangeCallback

  constructor(options: SocialServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
  }

  validate(type: "profile" | "post" | "follow", params: CreateProfileParams | CreatePostParams | FollowParams): string | null {
    switch (type) {
      case "profile": {
        const p = params as CreateProfileParams
        if (!p.username || p.username.trim().length === 0) {
          return "Username is required"
        }
        if (p.username.length > 32) {
          return "Username must be 32 characters or less"
        }
        return null
      }
      case "post": {
        const p = params as CreatePostParams
        if (!p.profileId) {
          return "Profile ID is required"
        }
        if (!p.content || p.content.trim().length === 0) {
          return "Content is required"
        }
        if (p.content.length > 280) {
          return "Content must be 280 characters or less"
        }
        return null
      }
      case "follow": {
        const p = params as FollowParams
        if (!p.fromProfileId) {
          return "From profile ID is required"
        }
        if (!p.toProfileId) {
          return "To profile ID is required"
        }
        if (p.fromProfileId === p.toProfileId) {
          return "Cannot follow yourself"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Create a stealth social profile.
   * generating_stealth (real SDK) -> creating_profile (simulated Tapestry) -> profile_created
   */
  async createProfile(params: CreateProfileParams): Promise<SocialActionRecord> {
    const validationError = this.validate("profile", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const record: SocialActionRecord = {
      id: generateId("profile"),
      type: "profile",
      profileId: "",
      status: "generating_stealth",
      privacyLevel: params.privacyLevel,
      username: params.username,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Generate stealth identity (real SDK)
      record.status = "generating_stealth"
      record.stepTimestamps.generating_stealth = Date.now()
      this.onStepChange?.("generating_stealth", { ...record })

      const stealth = await generateSocialStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress
      record.profileId = generateId("p")

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.generating_stealth))
      }

      // Step 2: Create Tapestry profile (simulated)
      record.status = "creating_profile"
      record.stepTimestamps.creating_profile = Date.now()
      this.onStepChange?.("creating_profile", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.creating_profile))
      }

      // Step 3: Profile created
      record.status = "profile_created"
      record.completedAt = Date.now()
      record.stepTimestamps.profile_created = Date.now()
      this.onStepChange?.("profile_created", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Profile creation failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Create an anonymous post.
   * encrypting_content (real SDK encrypt) -> publishing (simulated) -> published
   */
  async createPost(params: CreatePostParams): Promise<SocialActionRecord> {
    const validationError = this.validate("post", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const record: SocialActionRecord = {
      id: generateId("post"),
      type: "post",
      profileId: params.profileId,
      status: "encrypting_content",
      privacyLevel: params.privacyLevel,
      content: params.content,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Encrypt content (real SDK encryption)
      record.status = "encrypting_content"
      record.stepTimestamps.encrypting_content = Date.now()
      this.onStepChange?.("encrypting_content", { ...record })

      const encrypted = await encryptSocialContent(
        params.content,
        "0x" + "ab".repeat(32),
      )
      record.encryptedContent = encrypted.ciphertext
      record.postId = generateId("sp")

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.encrypting_content))
      }

      // Step 2: Publish to feed (simulated)
      record.status = "publishing"
      record.stepTimestamps.publishing = Date.now()
      this.onStepChange?.("publishing", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.publishing))
      }

      // Step 3: Published
      record.status = "published"
      record.completedAt = Date.now()
      record.stepTimestamps.published = Date.now()
      this.onStepChange?.("published", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Post creation failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Follow a profile with a stealth connection.
   * generating_stealth (real SDK shared secret) -> connecting (simulated) -> connected
   */
  async followProfile(params: FollowParams): Promise<SocialActionRecord> {
    const validationError = this.validate("follow", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const targetProfile = getProfile(params.toProfileId)

    const record: SocialActionRecord = {
      id: generateId("follow"),
      type: "follow",
      profileId: params.fromProfileId,
      status: "generating_stealth",
      privacyLevel: params.privacyLevel,
      targetProfileId: params.toProfileId,
      targetUsername: targetProfile?.username,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Generate shared secret (real SDK)
      record.status = "generating_stealth"
      record.stepTimestamps.generating_stealth = Date.now()
      this.onStepChange?.("generating_stealth", { ...record })

      const stealth = await generateSocialStealthAddress()
      record.sharedSecret = stealth.sharedSecret

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.generating_stealth))
      }

      // Step 2: Create connection (simulated)
      record.status = "connecting"
      record.stepTimestamps.connecting = Date.now()
      this.onStepChange?.("connecting", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.connecting))
      }

      // Step 3: Connected
      record.status = "connected"
      record.completedAt = Date.now()
      record.stepTimestamps.connected = Date.now()
      this.onStepChange?.("connected", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Follow failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
