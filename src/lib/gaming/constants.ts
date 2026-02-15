import type {
  Game,
  GameResult,
  GamingStep,
  GameType,
  Difficulty,
  RewardTier,
} from "./types"

const now = Date.now()
const DAY = 24 * 3600_000

export const SAMPLE_GAMES: Game[] = [
  {
    id: "game-stealth-showdown",
    title: "Stealth Showdown",
    description:
      "Rock-paper-scissors with Pedersen commitments. Commit your move, reveal after opponent commits. No cheating possible.",
    gameType: "commit_reveal",
    difficulty: "casual",
    rewardTier: "bronze",
    playerCount: 1247,
    isActive: true,
    icon: "\u{1F94A}",
  },
  {
    id: "game-sealed-auction",
    title: "Sealed Auction",
    description:
      "Place hidden bids using Pedersen commitments. Highest bid wins without revealing losing bids. True sealed-bid privacy.",
    gameType: "sealed_bid",
    difficulty: "ranked",
    rewardTier: "silver",
    playerCount: 834,
    isActive: true,
    icon: "\u{1F4B0}",
  },
  {
    id: "game-number-oracle",
    title: "Number Oracle",
    description:
      "Guess the hidden number. Your guess is committed via Pedersen — prove you knew it without revealing early.",
    gameType: "number_guess",
    difficulty: "casual",
    rewardTier: "bronze",
    playerCount: 2103,
    isActive: true,
    icon: "\u{1F52E}",
  },
  {
    id: "game-shadow-battalion",
    title: "Shadow Battalion",
    description:
      "Fog-of-war strategy game. Unit positions hidden via viewing keys — reveal only what your opponent should see.",
    gameType: "fog_of_war",
    difficulty: "ranked",
    rewardTier: "gold",
    playerCount: 567,
    isActive: true,
    icon: "\u{1F9CA}",
  },
  {
    id: "game-private-tournament",
    title: "Private Tournament",
    description:
      "Multi-round tournament with viewing key auditing. All moves committed, results verifiable, identities shielded.",
    gameType: "tournament",
    difficulty: "tournament",
    rewardTier: "diamond",
    playerCount: 198,
    isActive: true,
    icon: "\u{1F3C6}",
  },
]

export const SAMPLE_RESULTS: GameResult[] = [
  {
    gameId: "game-stealth-showdown",
    won: true,
    rewardTier: "bronze",
    commitmentHash: "0x7a3f...b2e1",
    revealedAt: now - 2 * DAY,
  },
  {
    gameId: "game-number-oracle",
    won: false,
    rewardTier: "bronze",
    commitmentHash: "0x9c1d...f4a8",
    revealedAt: now - 1 * DAY,
  },
]

export const SIMULATION_DELAYS: Record<GamingStep, number> = {
  committing_move: 1200,
  generating_commitment: 1500,
  revealing: 1800,
  resolved: 0,
  generating_stealth: 1500,
  claiming_reward: 2000,
  claimed: 0,
  failed: 0,
}

export const MAX_GAMING_HISTORY = 50

export const DIFFICULTY_COLORS: Record<
  Difficulty,
  { label: string; color: string; bg: string }
> = {
  casual: {
    label: "Casual",
    color: "text-green-300",
    bg: "bg-green-500/20 border-green-500/30",
  },
  ranked: {
    label: "Ranked",
    color: "text-orange-300",
    bg: "bg-orange-500/20 border-orange-500/30",
  },
  tournament: {
    label: "Tournament",
    color: "text-red-300",
    bg: "bg-red-500/20 border-red-500/30",
  },
}

export const REWARD_TIER_COLORS: Record<
  RewardTier,
  { label: string; color: string; bg: string }
> = {
  bronze: {
    label: "Bronze",
    color: "text-amber-400",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  silver: {
    label: "Silver",
    color: "text-gray-300",
    bg: "bg-gray-400/20 border-gray-400/30",
  },
  gold: {
    label: "Gold",
    color: "text-yellow-300",
    bg: "bg-yellow-500/20 border-yellow-500/30",
  },
  diamond: {
    label: "Diamond",
    color: "text-cyan-300",
    bg: "bg-cyan-500/20 border-cyan-500/30",
  },
}

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  commit_reveal: "Commit-Reveal",
  sealed_bid: "Sealed Bid",
  number_guess: "Number Guess",
  fog_of_war: "Fog of War",
  tournament: "Tournament",
}

export function getGame(id: string): Game | undefined {
  return SAMPLE_GAMES.find((g) => g.id === id)
}

export function getGamesByType(type: GameType): Game[] {
  return SAMPLE_GAMES.filter((g) => g.gameType === type)
}

export function getAllGames(): Game[] {
  return SAMPLE_GAMES
}

export function getResult(gameId: string): GameResult | undefined {
  return SAMPLE_RESULTS.find((r) => r.gameId === gameId)
}
