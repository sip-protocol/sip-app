import type {
  World,
  Visit,
  MetaverseStep,
  WorldCategory,
  AvatarTier,
} from "./types"

const now = Date.now()
const DAY = 24 * 3600_000

export const SAMPLE_WORLDS: World[] = [
  {
    id: "world-crypto-gallery",
    title: "Crypto Gallery",
    description:
      "Browse digital art anonymously. Stealth avatar identity ensures your on-chain wallet is never linked to your gallery visits.",
    category: "gallery",
    tier: "explorer",
    visitorCount: 3200,
    isActive: true,
    icon: "\u{1F5BC}\uFE0F",
  },
  {
    id: "world-battle-arena",
    title: "Battle Arena",
    description:
      "Compete in PvP games with hidden identity. Pedersen commitments protect game state — opponents can't scout your wallet history.",
    category: "game_room",
    tier: "warrior",
    visitorCount: 1800,
    isActive: true,
    icon: "\u2694\uFE0F",
  },
  {
    id: "world-social-hub",
    title: "Social Hub",
    description:
      "Meet and chat anonymously. Stealth addresses provide anonymous social presence — no wallet-based profiling.",
    category: "social",
    tier: "citizen",
    visitorCount: 5400,
    isActive: true,
    icon: "\u{1F30D}",
  },
  {
    id: "world-nft-marketplace",
    title: "NFT Marketplace",
    description:
      "Trade NFTs with stealth transfers. Private trades ensure buyers and sellers remain unlinkable — no front-running.",
    category: "marketplace",
    tier: "merchant",
    visitorCount: 2100,
    isActive: true,
    icon: "\u{1F6D2}",
  },
  {
    id: "world-concert-hall",
    title: "Concert Hall",
    description:
      "Attend virtual concerts with VIP access gated by viewing keys. Prove your ticket tier without revealing your identity.",
    category: "concert_hall",
    tier: "vip",
    visitorCount: 4700,
    isActive: true,
    icon: "\u{1F3B6}",
  },
]

export const SAMPLE_VISITS: Visit[] = [
  {
    worldId: "world-social-hub",
    tier: "citizen",
    commitmentHash: "0x4c1f...d8e2",
    visitedAt: now - 2 * DAY,
  },
  {
    worldId: "world-crypto-gallery",
    tier: "explorer",
    commitmentHash: "0x9a3b...f1c7",
    visitedAt: now - 1 * DAY,
  },
]

export const SIMULATION_DELAYS: Record<MetaverseStep, number> = {
  selecting_world: 1200,
  generating_stealth_avatar: 1500,
  entering_world: 1800,
  entered: 0,
  generating_proof: 1500,
  teleporting: 2000,
  arrived: 0,
  failed: 0,
}

export const MAX_METAVERSE_HISTORY = 50

export const CATEGORY_COLORS: Record<
  WorldCategory,
  { label: string; color: string; bg: string }
> = {
  gallery: {
    label: "Gallery",
    color: "text-indigo-300",
    bg: "bg-indigo-500/20 border-indigo-500/30",
  },
  game_room: {
    label: "Game Room",
    color: "text-red-300",
    bg: "bg-red-500/20 border-red-500/30",
  },
  social: {
    label: "Social",
    color: "text-blue-300",
    bg: "bg-blue-500/20 border-blue-500/30",
  },
  marketplace: {
    label: "Marketplace",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  concert_hall: {
    label: "Concert Hall",
    color: "text-pink-300",
    bg: "bg-pink-500/20 border-pink-500/30",
  },
}

export const AVATAR_TIER_COLORS: Record<
  AvatarTier,
  { label: string; color: string; bg: string }
> = {
  explorer: {
    label: "Explorer",
    color: "text-green-300",
    bg: "bg-green-400/20 border-green-400/30",
  },
  warrior: {
    label: "Warrior",
    color: "text-red-300",
    bg: "bg-red-500/20 border-red-500/30",
  },
  citizen: {
    label: "Citizen",
    color: "text-blue-300",
    bg: "bg-blue-500/20 border-blue-500/30",
  },
  merchant: {
    label: "Merchant",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  vip: {
    label: "VIP",
    color: "text-yellow-300",
    bg: "bg-yellow-500/20 border-yellow-500/30",
  },
}

export const WORLD_CATEGORY_LABELS: Record<WorldCategory, string> = {
  gallery: "Gallery",
  game_room: "Game Room",
  social: "Social",
  marketplace: "Marketplace",
  concert_hall: "Concert Hall",
}

export function getWorld(id: string): World | undefined {
  return SAMPLE_WORLDS.find((w) => w.id === id)
}

export function getWorldsByCategory(category: WorldCategory): World[] {
  return SAMPLE_WORLDS.filter((w) => w.category === category)
}

export function getAllWorlds(): World[] {
  return SAMPLE_WORLDS
}

export function getVisit(worldId: string): Visit | undefined {
  return SAMPLE_VISITS.find((v) => v.worldId === worldId)
}
