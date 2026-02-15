export { GamingService } from "./gaming-service"
export type { GamingServiceOptions } from "./gaming-service"

export { MagicBlockReader } from "./magicblock-reader"

export { generateGamingStealthAddress } from "./stealth-gaming"
export type { StealthGamingResult } from "./stealth-gaming"

export {
  SAMPLE_GAMES,
  SAMPLE_RESULTS,
  SIMULATION_DELAYS,
  MAX_GAMING_HISTORY,
  DIFFICULTY_COLORS,
  REWARD_TIER_COLORS,
  GAME_TYPE_LABELS,
  getGame,
  getGamesByType,
  getAllGames,
  getResult,
} from "./constants"

export type {
  PlayStep,
  ClaimStep,
  GamingStep,
  GameType,
  Difficulty,
  RewardTier,
  Game,
  GameResult,
  GamingActionRecord,
  PlayGameParams,
  ClaimRewardParams,
  GamingStepChangeCallback,
  GamingMode,
} from "./types"
