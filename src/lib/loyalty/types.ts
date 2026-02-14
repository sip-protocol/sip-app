import type { PrivacyLevel } from "@sip-protocol/types"

export type JoinStep =
  | "selecting_campaign"
  | "joining"
  | "joined"
  | "failed"

export type ActionStep =
  | "verifying_action"
  | "recording"
  | "recorded"
  | "failed"

export type ClaimStep =
  | "generating_stealth"
  | "claiming"
  | "claimed"
  | "failed"

export type LoyaltyStep = JoinStep | ActionStep | ClaimStep

export type CampaignStatus = "active" | "completed" | "expired"

export type LoyaltyTier = "none" | "bronze" | "silver" | "gold"

export type CampaignActionType =
  | "shielded_transfer"
  | "stealth_identity"
  | "private_bridge"
  | "private_vote"
  | "anonymous_post"

export interface Campaign {
  id: string
  name: string
  description: string
  actionType: CampaignActionType
  requiredCount: number
  rewardAmount: number
  rewardToken: string
  status: CampaignStatus
  startDate: number
  endDate: number
  participantCount: number
  icon: string
}

export interface CampaignProgress {
  campaignId: string
  completedActions: number
  requiredActions: number
  isComplete: boolean
  joinedAt: number
  lastActionAt?: number
}

export interface LoyaltyReward {
  id: string
  campaignId: string
  campaignName: string
  amount: number
  token: string
  stealthAddress?: string
  isClaimed: boolean
}

export interface LoyaltyActionRecord {
  id: string
  type: "join" | "action" | "claim"
  campaignId: string
  status: LoyaltyStep
  privacyLevel: PrivacyLevel
  // Join-specific
  campaignName?: string
  // Action-specific
  actionType?: CampaignActionType
  actionIndex?: number
  // Claim-specific
  rewardAmount?: number
  rewardToken?: string
  stealthAddress?: string
  stealthMetaAddress?: string
  // Timestamps
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<LoyaltyStep, number>>
}

export interface JoinCampaignParams {
  campaignId: string
  privacyLevel: PrivacyLevel
}

export interface CompleteActionParams {
  campaignId: string
  actionType: CampaignActionType
  privacyLevel: PrivacyLevel
}

export interface ClaimRewardParams {
  rewardId: string
  campaignId: string
  amount: number
  token: string
  privacyLevel: PrivacyLevel
}

export type LoyaltyStepChangeCallback = (
  step: LoyaltyStep,
  record: LoyaltyActionRecord,
) => void

export type LoyaltyMode = "simulation" | "torque"
