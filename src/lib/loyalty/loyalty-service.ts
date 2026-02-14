import type {
  LoyaltyActionRecord,
  LoyaltyStepChangeCallback,
  LoyaltyMode,
  JoinCampaignParams,
  CompleteActionParams,
  ClaimRewardParams,
} from "./types"
import { SIMULATION_DELAYS, getCampaign } from "./constants"
import { generateLoyaltyStealthAddress } from "./stealth-loyalty"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface LoyaltyServiceOptions {
  mode?: LoyaltyMode
  onStepChange?: LoyaltyStepChangeCallback
}

export class LoyaltyService {
  private mode: LoyaltyMode
  private onStepChange?: LoyaltyStepChangeCallback

  constructor(options: LoyaltyServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
  }

  validate(
    type: "join" | "action" | "claim",
    params: JoinCampaignParams | CompleteActionParams | ClaimRewardParams,
  ): string | null {
    switch (type) {
      case "join": {
        const p = params as JoinCampaignParams
        if (!p.campaignId) {
          return "Campaign ID is required"
        }
        const campaign = getCampaign(p.campaignId)
        if (!campaign) {
          return "Campaign not found"
        }
        if (campaign.status !== "active") {
          return "Campaign is not active"
        }
        return null
      }
      case "action": {
        const p = params as CompleteActionParams
        if (!p.campaignId) {
          return "Campaign ID is required"
        }
        if (!p.actionType) {
          return "Action type is required"
        }
        return null
      }
      case "claim": {
        const p = params as ClaimRewardParams
        if (!p.rewardId) {
          return "Reward ID is required"
        }
        if (!p.campaignId) {
          return "Campaign ID is required"
        }
        if (p.amount <= 0) {
          return "Reward amount must be positive"
        }
        if (!p.token) {
          return "Token is required"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Join a campaign.
   * selecting_campaign -> joining (simulated Torque) -> joined
   */
  async joinCampaign(params: JoinCampaignParams): Promise<LoyaltyActionRecord> {
    const validationError = this.validate("join", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const campaign = getCampaign(params.campaignId)

    const record: LoyaltyActionRecord = {
      id: generateId("join"),
      type: "join",
      campaignId: params.campaignId,
      status: "selecting_campaign",
      privacyLevel: params.privacyLevel,
      campaignName: campaign?.name,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Selecting campaign
      record.status = "selecting_campaign"
      record.stepTimestamps.selecting_campaign = Date.now()
      this.onStepChange?.("selecting_campaign", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.selecting_campaign))
      }

      // Step 2: Joining campaign
      record.status = "joining"
      record.stepTimestamps.joining = Date.now()
      this.onStepChange?.("joining", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.joining))
      }

      // Step 3: Joined
      record.status = "joined"
      record.completedAt = Date.now()
      record.stepTimestamps.joined = Date.now()
      this.onStepChange?.("joined", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Join failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Complete an action for a campaign.
   * verifying_action -> recording (simulated Torque) -> recorded
   */
  async completeAction(params: CompleteActionParams): Promise<LoyaltyActionRecord> {
    const validationError = this.validate("action", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const record: LoyaltyActionRecord = {
      id: generateId("action"),
      type: "action",
      campaignId: params.campaignId,
      status: "verifying_action",
      privacyLevel: params.privacyLevel,
      actionType: params.actionType,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Verifying action
      record.status = "verifying_action"
      record.stepTimestamps.verifying_action = Date.now()
      this.onStepChange?.("verifying_action", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.verifying_action))
      }

      // Step 2: Recording to Torque
      record.status = "recording"
      record.stepTimestamps.recording = Date.now()
      this.onStepChange?.("recording", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.recording))
      }

      // Step 3: Recorded
      record.status = "recorded"
      record.completedAt = Date.now()
      record.stepTimestamps.recorded = Date.now()
      this.onStepChange?.("recorded", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Action recording failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Claim a reward to a stealth address.
   * generating_stealth (real SDK) -> claiming (simulated) -> claimed
   */
  async claimReward(params: ClaimRewardParams): Promise<LoyaltyActionRecord> {
    const validationError = this.validate("claim", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const record: LoyaltyActionRecord = {
      id: generateId("claim"),
      type: "claim",
      campaignId: params.campaignId,
      status: "generating_stealth",
      privacyLevel: params.privacyLevel,
      rewardAmount: params.amount,
      rewardToken: params.token,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Generate stealth address for reward claim (real SDK)
      record.status = "generating_stealth"
      record.stepTimestamps.generating_stealth = Date.now()
      this.onStepChange?.("generating_stealth", { ...record })

      const stealth = await generateLoyaltyStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.generating_stealth))
      }

      // Step 2: Claiming reward
      record.status = "claiming"
      record.stepTimestamps.claiming = Date.now()
      this.onStepChange?.("claiming", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.claiming))
      }

      // Step 3: Claimed
      record.status = "claimed"
      record.completedAt = Date.now()
      record.stepTimestamps.claimed = Date.now()
      this.onStepChange?.("claimed", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Claim failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
