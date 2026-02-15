import type {
  ChannelActionRecord,
  ChannelStepChangeCallback,
  ChannelMode,
  SubscribeParams,
  PublishDropParams,
} from "./types"
import { SIMULATION_DELAYS, getDrop } from "./constants"
import { generateChannelStealthAddress } from "./stealth-channel"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface ChannelServiceOptions {
  mode?: ChannelMode
  onStepChange?: ChannelStepChangeCallback
}

export class ChannelService {
  private mode: ChannelMode
  private onStepChange?: ChannelStepChangeCallback

  constructor(options: ChannelServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
  }

  validate(
    type: "subscribe" | "publish",
    params: SubscribeParams | PublishDropParams
  ): string | null {
    switch (type) {
      case "subscribe": {
        const p = params as SubscribeParams
        if (!p.dropId) {
          return "Drop ID is required"
        }
        const drop = getDrop(p.dropId)
        if (!drop) {
          return "Drop not found"
        }
        return null
      }
      case "publish": {
        const p = params as PublishDropParams
        if (!p.title) {
          return "Title is required"
        }
        if (!p.content) {
          return "Content is required"
        }
        if (!p.contentType) {
          return "Content type is required"
        }
        if (!p.accessTier) {
          return "Access tier is required"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Subscribe to a drop.
   * selecting_channel -> subscribing (simulated DRiP) -> subscribed
   */
  async subscribe(params: SubscribeParams): Promise<ChannelActionRecord> {
    const validationError = this.validate("subscribe", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const drop = getDrop(params.dropId)

    const record: ChannelActionRecord = {
      id: generateId("sub"),
      type: "subscribe",
      dropId: params.dropId,
      status: "selecting_channel",
      privacyLevel: params.privacyLevel,
      dropTitle: drop?.title,
      accessTier: drop?.accessTier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Selecting channel
      record.status = "selecting_channel"
      record.stepTimestamps.selecting_channel = Date.now()
      this.onStepChange?.("selecting_channel", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.selecting_channel)
        )
      }

      // Step 2: Subscribing
      record.status = "subscribing"
      record.stepTimestamps.subscribing = Date.now()
      this.onStepChange?.("subscribing", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.subscribing))
      }

      // Step 3: Subscribed
      record.status = "subscribed"
      record.completedAt = Date.now()
      record.stepTimestamps.subscribed = Date.now()
      this.onStepChange?.("subscribed", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Subscribe failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Publish a drop with encryption.
   * encrypting_content -> generating_stealth (real SDK) -> publishing -> published
   */
  async publishDrop(params: PublishDropParams): Promise<ChannelActionRecord> {
    const validationError = this.validate("publish", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const record: ChannelActionRecord = {
      id: generateId("pub"),
      type: "publish",
      dropId: generateId("drop"),
      status: "encrypting_content",
      privacyLevel: params.privacyLevel,
      contentType: params.contentType,
      title: params.title,
      accessTier: params.accessTier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Encrypting content
      record.status = "encrypting_content"
      record.stepTimestamps.encrypting_content = Date.now()
      this.onStepChange?.("encrypting_content", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.encrypting_content)
        )
      }

      // Step 2: Generate stealth address (real SDK)
      record.status = "generating_stealth"
      record.stepTimestamps.generating_stealth = Date.now()
      this.onStepChange?.("generating_stealth", { ...record })

      const stealth = await generateChannelStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_stealth)
        )
      }

      // Step 3: Publishing
      record.status = "publishing"
      record.stepTimestamps.publishing = Date.now()
      this.onStepChange?.("publishing", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.publishing))
      }

      // Step 4: Published
      record.status = "published"
      record.completedAt = Date.now()
      record.stepTimestamps.published = Date.now()
      this.onStepChange?.("published", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Publish failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
