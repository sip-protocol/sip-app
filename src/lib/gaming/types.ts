import type { PrivacyLevel } from "@sip-protocol/types"

export type PlayStep =
  | "committing_move"
  | "generating_commitment"
  | "revealing"
  | "resolved"
  | "failed"

export type ClaimStep =
  | "generating_stealth"
  | "claiming_reward"
  | "claimed"
  | "failed"

export type GamingStep = PlayStep | ClaimStep

export type GameType =
  | "commit_reveal"
  | "sealed_bid"
  | "number_guess"
  | "fog_of_war"
  | "tournament"

export type Difficulty = "casual" | "ranked" | "tournament"

export type RewardTier = "bronze" | "silver" | "gold" | "diamond"

export interface Game {
  id: string
  title: string
  description: string
  gameType: GameType
  difficulty: Difficulty
  rewardTier: RewardTier
  playerCount: number
  isActive: boolean
  icon: string
}

export interface GameResult {
  gameId: string
  won: boolean
  rewardTier: RewardTier
  commitmentHash: string
  revealedAt: number
}

export interface GamingActionRecord {
  id: string
  type: "play" | "claim"
  gameId: string
  status: GamingStep
  privacyLevel: PrivacyLevel
  // Play-specific
  gameTitle?: string
  gameType?: GameType
  difficulty?: Difficulty
  commitmentHash?: string
  won?: boolean
  // Claim-specific
  rewardTier?: RewardTier
  stealthAddress?: string
  stealthMetaAddress?: string
  // Timestamps
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<GamingStep, number>>
}

export interface PlayGameParams {
  gameId: string
  move: string
  privacyLevel: PrivacyLevel
}

export interface ClaimRewardParams {
  gameId: string
  rewardTier: RewardTier
  privacyLevel: PrivacyLevel
}

export type GamingStepChangeCallback = (
  step: GamingStep,
  record: GamingActionRecord
) => void

export type GamingMode = "simulation" | "magicblock"
