import type {
  Campaign,
  CampaignProgress,
  LoyaltyReward,
  LoyaltyStep,
  LoyaltyTier,
} from "./types"

const now = Date.now()
const DAY = 24 * 3600_000

export const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-privacy-pioneer",
    name: "Privacy Pioneer",
    description:
      "Complete 5 shielded transfers to prove your commitment to on-chain privacy.",
    actionType: "shielded_transfer",
    requiredCount: 5,
    rewardAmount: 0.5,
    rewardToken: "SOL",
    status: "active",
    startDate: now - 14 * DAY,
    endDate: now + 30 * DAY,
    participantCount: 142,
    icon: "\u{1F6E1}\uFE0F",
  },
  {
    id: "camp-stealth-builder",
    name: "Stealth Builder",
    description:
      "Create 3 stealth identities across different platforms. Build your anonymous presence.",
    actionType: "stealth_identity",
    requiredCount: 3,
    rewardAmount: 0.3,
    rewardToken: "SOL",
    status: "active",
    startDate: now - 7 * DAY,
    endDate: now + 45 * DAY,
    participantCount: 89,
    icon: "\u{1F3D7}\uFE0F",
  },
  {
    id: "camp-bridge-guardian",
    name: "Bridge Guardian",
    description:
      "Complete 2 private cross-chain bridges. Protect your assets across chains.",
    actionType: "private_bridge",
    requiredCount: 2,
    rewardAmount: 0.4,
    rewardToken: "SOL",
    status: "active",
    startDate: now - 3 * DAY,
    endDate: now + 60 * DAY,
    participantCount: 56,
    icon: "\u{1F309}",
  },
  {
    id: "camp-governance-anon",
    name: "Governance Anon",
    description:
      "Cast 3 private votes in DAO governance. Your voice matters, your identity doesn't.",
    actionType: "private_vote",
    requiredCount: 3,
    rewardAmount: 0.25,
    rewardToken: "SOL",
    status: "active",
    startDate: now - 10 * DAY,
    endDate: now + 20 * DAY,
    participantCount: 201,
    icon: "\u{1F5F3}\uFE0F",
  },
  {
    id: "camp-social-ghost",
    name: "Social Ghost",
    description:
      "Post 5 anonymous messages on the social feed. Speak freely, stay hidden.",
    actionType: "anonymous_post",
    requiredCount: 5,
    rewardAmount: 0.35,
    rewardToken: "SOL",
    status: "active",
    startDate: now - 5 * DAY,
    endDate: now + 25 * DAY,
    participantCount: 117,
    icon: "\u{1F47B}",
  },
]

export const SAMPLE_PROGRESS: CampaignProgress[] = [
  {
    campaignId: "camp-privacy-pioneer",
    completedActions: 3,
    requiredActions: 5,
    isComplete: false,
    joinedAt: now - 10 * DAY,
    lastActionAt: now - 1 * DAY,
  },
  {
    campaignId: "camp-stealth-builder",
    completedActions: 3,
    requiredActions: 3,
    isComplete: true,
    joinedAt: now - 5 * DAY,
    lastActionAt: now - 2 * DAY,
  },
]

export const SAMPLE_REWARDS: LoyaltyReward[] = [
  {
    id: "reward-stealth-builder",
    campaignId: "camp-stealth-builder",
    campaignName: "Stealth Builder",
    amount: 0.3,
    token: "SOL",
    isClaimed: false,
  },
]

export const SIMULATION_DELAYS: Record<LoyaltyStep, number> = {
  selecting_campaign: 1000,
  joining: 1500,
  joined: 0,
  verifying_action: 1500,
  recording: 2000,
  recorded: 0,
  generating_stealth: 1500,
  claiming: 2000,
  claimed: 0,
  failed: 0,
}

export const MAX_LOYALTY_HISTORY = 100

export const TIER_CONFIG: Record<
  LoyaltyTier,
  { label: string; color: string; icon: string }
> = {
  none: { label: "No Tier", color: "text-gray-400", icon: "\u2014" },
  bronze: { label: "Bronze", color: "text-amber-600", icon: "\u{1F949}" },
  silver: { label: "Silver", color: "text-gray-300", icon: "\u{1F948}" },
  gold: { label: "Gold", color: "text-yellow-400", icon: "\u{1F947}" },
}

export function getCampaign(id: string): Campaign | undefined {
  return SAMPLE_CAMPAIGNS.find((c) => c.id === id)
}

export function getActiveCampaigns(): Campaign[] {
  return SAMPLE_CAMPAIGNS.filter((c) => c.status === "active")
}

export function getProgressForCampaign(
  campaignId: string,
): CampaignProgress | undefined {
  return SAMPLE_PROGRESS.find((p) => p.campaignId === campaignId)
}

export function getRewardsForProfile(): LoyaltyReward[] {
  return SAMPLE_REWARDS
}

export function calculateTier(completedCampaigns: number): LoyaltyTier {
  if (completedCampaigns >= 5) return "gold"
  if (completedCampaigns >= 3) return "silver"
  if (completedCampaigns >= 1) return "bronze"
  return "none"
}
