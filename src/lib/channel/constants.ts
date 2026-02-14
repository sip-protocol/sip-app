import type {
  Drop,
  ChannelSubscription,
  ChannelStep,
  AccessTier,
} from "./types"

const now = Date.now()
const DAY = 24 * 3600_000

export const SAMPLE_DROPS: Drop[] = [
  {
    id: "drop-stealth-addresses",
    title: "What Are Stealth Addresses?",
    description:
      "Learn how one-time addresses prevent transaction linkability. The foundation of on-chain privacy.",
    contentType: "article",
    accessTier: "free",
    author: "SIP Protocol",
    publishedAt: now - 14 * DAY,
    subscriberCount: 342,
    isEncrypted: false,
    icon: "\u{1F510}",
  },
  {
    id: "drop-pedersen-commitments",
    title: "Pedersen Commitments Explained",
    description:
      "How homomorphic commitments hide transaction amounts while preserving verifiability.",
    contentType: "article",
    accessTier: "free",
    author: "SIP Protocol",
    publishedAt: now - 10 * DAY,
    subscriberCount: 278,
    isEncrypted: false,
    icon: "\u{1F9EE}",
  },
  {
    id: "drop-building-private-dapps",
    title: "Building Private dApps with SIP SDK",
    description:
      "Step-by-step guide to integrating stealth addresses, viewing keys, and Pedersen commitments into your dApp.",
    contentType: "tutorial",
    accessTier: "subscriber",
    author: "SIP Protocol",
    publishedAt: now - 7 * DAY,
    subscriberCount: 156,
    isEncrypted: true,
    icon: "\u{1F6E0}\uFE0F",
  },
  {
    id: "drop-cross-chain-privacy",
    title: "Cross-Chain Privacy Architecture",
    description:
      "Deep dive into SIP's settlement-agnostic design. How privacy works across Solana, Ethereum, NEAR, and Cosmos.",
    contentType: "deep_dive",
    accessTier: "subscriber",
    author: "SIP Protocol",
    publishedAt: now - 3 * DAY,
    subscriberCount: 89,
    isEncrypted: true,
    icon: "\u{1F310}",
  },
  {
    id: "drop-zk-proofs-solana",
    title: "Zero-Knowledge Proofs for Solana",
    description:
      "Exclusive alpha on ZK proof integration with Solana. Noir circuits, browser proving, and the road to trustless privacy.",
    contentType: "alpha",
    accessTier: "premium",
    author: "SIP Protocol",
    publishedAt: now - 1 * DAY,
    subscriberCount: 42,
    isEncrypted: true,
    icon: "\u{1F48E}",
  },
]

export const SAMPLE_SUBSCRIPTIONS: ChannelSubscription[] = [
  {
    dropId: "drop-stealth-addresses",
    subscribedAt: now - 12 * DAY,
    accessTier: "free",
    isActive: true,
  },
  {
    dropId: "drop-pedersen-commitments",
    subscribedAt: now - 8 * DAY,
    accessTier: "free",
    isActive: true,
  },
]

export const SIMULATION_DELAYS: Record<ChannelStep, number> = {
  selecting_channel: 1000,
  subscribing: 1500,
  subscribed: 0,
  encrypting_content: 1500,
  generating_stealth: 1500,
  publishing: 2000,
  published: 0,
  failed: 0,
}

export const MAX_CHANNEL_HISTORY = 50

export const TIER_COLORS: Record<
  AccessTier,
  { label: string; color: string; bg: string }
> = {
  free: {
    label: "Free",
    color: "text-gray-300",
    bg: "bg-gray-500/20 border-gray-500/30",
  },
  subscriber: {
    label: "Subscriber",
    color: "text-purple-300",
    bg: "bg-purple-500/20 border-purple-500/30",
  },
  premium: {
    label: "Premium",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  article: "Article",
  tutorial: "Tutorial",
  deep_dive: "Deep Dive",
  alpha: "Alpha",
}

export function getDrop(id: string): Drop | undefined {
  return SAMPLE_DROPS.find((d) => d.id === id)
}

export function getDropsByTier(tier: AccessTier): Drop[] {
  return SAMPLE_DROPS.filter((d) => d.accessTier === tier)
}

export function getAllDrops(): Drop[] {
  return SAMPLE_DROPS
}

export function getSubscription(dropId: string): ChannelSubscription | undefined {
  return SAMPLE_SUBSCRIPTIONS.find((s) => s.dropId === dropId)
}
