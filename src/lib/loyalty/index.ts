export { LoyaltyService } from "./loyalty-service"
export type { LoyaltyServiceOptions } from "./loyalty-service"

export { TorqueReader } from "./torque-reader"

export { generateLoyaltyStealthAddress } from "./stealth-loyalty"
export type { StealthLoyaltyResult } from "./stealth-loyalty"

export {
  SAMPLE_CAMPAIGNS,
  SAMPLE_PROGRESS,
  SAMPLE_REWARDS,
  SIMULATION_DELAYS,
  MAX_LOYALTY_HISTORY,
  TIER_CONFIG,
  getCampaign,
  getActiveCampaigns,
  getProgressForCampaign,
  getRewardsForProfile,
  calculateTier,
} from "./constants"

export type {
  JoinStep,
  ActionStep,
  ClaimStep,
  LoyaltyStep,
  CampaignStatus,
  LoyaltyTier,
  CampaignActionType,
  Campaign,
  CampaignProgress,
  LoyaltyReward,
  LoyaltyActionRecord,
  JoinCampaignParams,
  CompleteActionParams,
  ClaimRewardParams,
  LoyaltyStepChangeCallback,
  LoyaltyMode,
} from "./types"
