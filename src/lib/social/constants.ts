import type { StealthProfile, SocialPost, SocialConnection, SocialStep } from "./types"
import { PrivacyLevel } from "@sip-protocol/types"

function deterministicStealthAddress(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  const hex = Math.abs(hash).toString(16).padStart(64, "a")
  return `sip:solana:0x${hex}`
}

function deterministicMetaAddress(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 7) - hash + seed.charCodeAt(i)) | 0
  }
  const hex = Math.abs(hash).toString(16).padStart(64, "b")
  return `st:sol:0x${hex}`
}

const now = Date.now()
const HOUR = 3600_000
const DAY = 24 * HOUR

export const SAMPLE_PROFILES: StealthProfile[] = [
  {
    id: "profile-dolphin",
    username: "anon_dolphin",
    bio: "Privacy advocate and DeFi researcher. Building in the open, anonymously.",
    stealthAddress: deterministicStealthAddress("anon_dolphin"),
    stealthMetaAddress: deterministicMetaAddress("anon_dolphin"),
    viewingPrivateKey: "0x" + "aa".repeat(32),
    spendingPrivateKey: "0x" + "bb".repeat(32),
    createdAt: now - 14 * DAY,
    postCount: 4,
    followerCount: 12,
    followingCount: 3,
  },
  {
    id: "profile-shadow",
    username: "shadow_dev",
    bio: "Solana builder. Ship fast, stay private. Stealth addresses are the future.",
    stealthAddress: deterministicStealthAddress("shadow_dev"),
    stealthMetaAddress: deterministicMetaAddress("shadow_dev"),
    viewingPrivateKey: "0x" + "cc".repeat(32),
    spendingPrivateKey: "0x" + "dd".repeat(32),
    createdAt: now - 10 * DAY,
    postCount: 3,
    followerCount: 8,
    followingCount: 5,
  },
  {
    id: "profile-cipher",
    username: "cipher_punk",
    bio: "Cypherpunk. Not your keys, not your identity. Privacy is a right.",
    stealthAddress: deterministicStealthAddress("cipher_punk"),
    stealthMetaAddress: deterministicMetaAddress("cipher_punk"),
    viewingPrivateKey: "0x" + "ee".repeat(32),
    spendingPrivateKey: "0x" + "ff".repeat(32),
    createdAt: now - 7 * DAY,
    postCount: 2,
    followerCount: 15,
    followingCount: 4,
  },
  {
    id: "profile-artist",
    username: "stealth_artist",
    bio: "Digital art meets privacy tech. Creating beauty that can't be traced.",
    stealthAddress: deterministicStealthAddress("stealth_artist"),
    stealthMetaAddress: deterministicMetaAddress("stealth_artist"),
    viewingPrivateKey: "0x" + "11".repeat(32),
    spendingPrivateKey: "0x" + "22".repeat(32),
    createdAt: now - 5 * DAY,
    postCount: 1,
    followerCount: 6,
    followingCount: 2,
  },
  {
    id: "profile-trader",
    username: "ghost_trader",
    bio: "DeFi whale. Privacy protects alpha. Trade without the front-runners.",
    stealthAddress: deterministicStealthAddress("ghost_trader"),
    stealthMetaAddress: deterministicMetaAddress("ghost_trader"),
    viewingPrivateKey: "0x" + "33".repeat(32),
    spendingPrivateKey: "0x" + "44".repeat(32),
    createdAt: now - 3 * DAY,
    postCount: 0,
    followerCount: 20,
    followingCount: 1,
  },
]

export const SAMPLE_POSTS: SocialPost[] = [
  {
    id: "post-001",
    authorProfileId: "profile-dolphin",
    authorUsername: "anon_dolphin",
    content: "Just discovered stealth addresses on Solana. This changes everything for on-chain privacy.",
    timestamp: now - 13 * DAY,
    likeCount: 24,
    commentCount: 5,
    isEncrypted: false,
    privacyLevel: PrivacyLevel.TRANSPARENT,
  },
  {
    id: "post-002",
    authorProfileId: "profile-shadow",
    authorUsername: "shadow_dev",
    content: "Shipped a new privacy feature today. Stealth identities mean you can post without linking to your wallet.",
    timestamp: now - 10 * DAY,
    likeCount: 18,
    commentCount: 3,
    isEncrypted: false,
    privacyLevel: PrivacyLevel.TRANSPARENT,
  },
  {
    id: "post-003",
    authorProfileId: "profile-cipher",
    authorUsername: "cipher_punk",
    content: "",
    encryptedContent: "0xencrypted_content_pedersen_commitment_hidden",
    timestamp: now - 8 * DAY,
    likeCount: 31,
    commentCount: 7,
    isEncrypted: true,
    privacyLevel: PrivacyLevel.SHIELDED,
  },
  {
    id: "post-004",
    authorProfileId: "profile-dolphin",
    authorUsername: "anon_dolphin",
    content: "Privacy is not about hiding. It's about choosing what to reveal and to whom.",
    timestamp: now - 7 * DAY,
    likeCount: 42,
    commentCount: 11,
    isEncrypted: false,
    privacyLevel: PrivacyLevel.TRANSPARENT,
  },
  {
    id: "post-005",
    authorProfileId: "profile-shadow",
    authorUsername: "shadow_dev",
    content: "",
    encryptedContent: "0xencrypted_dev_update_shielded_content",
    timestamp: now - 5 * DAY,
    likeCount: 9,
    commentCount: 2,
    isEncrypted: true,
    privacyLevel: PrivacyLevel.SHIELDED,
  },
  {
    id: "post-006",
    authorProfileId: "profile-artist",
    authorUsername: "stealth_artist",
    content: "New generative art drop — each piece is tied to a stealth address. Collectors stay anonymous.",
    timestamp: now - 4 * DAY,
    likeCount: 55,
    commentCount: 14,
    isEncrypted: false,
    privacyLevel: PrivacyLevel.TRANSPARENT,
  },
  {
    id: "post-007",
    authorProfileId: "profile-dolphin",
    authorUsername: "anon_dolphin",
    content: "",
    encryptedContent: "0xencrypted_alpha_leak_only_viewing_key_holders",
    timestamp: now - 3 * DAY,
    likeCount: 67,
    commentCount: 22,
    isEncrypted: true,
    privacyLevel: PrivacyLevel.COMPLIANT,
  },
  {
    id: "post-008",
    authorProfileId: "profile-cipher",
    authorUsername: "cipher_punk",
    content: "Viewing keys are the compromise between full privacy and regulation. Choose compliant mode when needed.",
    timestamp: now - 2 * DAY,
    likeCount: 38,
    commentCount: 9,
    isEncrypted: false,
    privacyLevel: PrivacyLevel.TRANSPARENT,
  },
  {
    id: "post-009",
    authorProfileId: "profile-shadow",
    authorUsername: "shadow_dev",
    content: "Hot take: every social platform will need stealth identities within 5 years.",
    timestamp: now - 1 * DAY,
    likeCount: 73,
    commentCount: 19,
    isEncrypted: false,
    privacyLevel: PrivacyLevel.TRANSPARENT,
  },
  {
    id: "post-010",
    authorProfileId: "profile-dolphin",
    authorUsername: "anon_dolphin",
    content: "The beauty of Tapestry + SIP: social without surveillance. Your follow graph is yours alone.",
    timestamp: now - 6 * HOUR,
    likeCount: 15,
    commentCount: 4,
    isEncrypted: false,
    privacyLevel: PrivacyLevel.TRANSPARENT,
  },
]

export const SAMPLE_CONNECTIONS: SocialConnection[] = [
  {
    id: "conn-001",
    fromProfileId: "profile-dolphin",
    fromUsername: "anon_dolphin",
    toProfileId: "profile-shadow",
    toUsername: "shadow_dev",
    sharedSecret: "0x" + "ab".repeat(32),
    isEncrypted: true,
    createdAt: now - 12 * DAY,
  },
  {
    id: "conn-002",
    fromProfileId: "profile-dolphin",
    fromUsername: "anon_dolphin",
    toProfileId: "profile-cipher",
    toUsername: "cipher_punk",
    sharedSecret: "0x" + "cd".repeat(32),
    isEncrypted: true,
    createdAt: now - 11 * DAY,
  },
  {
    id: "conn-003",
    fromProfileId: "profile-shadow",
    fromUsername: "shadow_dev",
    toProfileId: "profile-dolphin",
    toUsername: "anon_dolphin",
    isEncrypted: false,
    createdAt: now - 10 * DAY,
  },
  {
    id: "conn-004",
    fromProfileId: "profile-cipher",
    fromUsername: "cipher_punk",
    toProfileId: "profile-dolphin",
    toUsername: "anon_dolphin",
    sharedSecret: "0x" + "ef".repeat(32),
    isEncrypted: true,
    createdAt: now - 9 * DAY,
  },
  {
    id: "conn-005",
    fromProfileId: "profile-shadow",
    fromUsername: "shadow_dev",
    toProfileId: "profile-artist",
    toUsername: "stealth_artist",
    isEncrypted: false,
    createdAt: now - 6 * DAY,
  },
  {
    id: "conn-006",
    fromProfileId: "profile-artist",
    fromUsername: "stealth_artist",
    toProfileId: "profile-cipher",
    toUsername: "cipher_punk",
    sharedSecret: "0x" + "12".repeat(32),
    isEncrypted: true,
    createdAt: now - 4 * DAY,
  },
  {
    id: "conn-007",
    fromProfileId: "profile-trader",
    fromUsername: "ghost_trader",
    toProfileId: "profile-dolphin",
    toUsername: "anon_dolphin",
    sharedSecret: "0x" + "34".repeat(32),
    isEncrypted: true,
    createdAt: now - 2 * DAY,
  },
  {
    id: "conn-008",
    fromProfileId: "profile-cipher",
    fromUsername: "cipher_punk",
    toProfileId: "profile-shadow",
    toUsername: "shadow_dev",
    isEncrypted: false,
    createdAt: now - 1 * DAY,
  },
]

export const SIMULATION_DELAYS: Record<SocialStep, number> = {
  generating_stealth: 1500,
  creating_profile: 2000,
  profile_created: 0,
  encrypting_content: 1500,
  publishing: 2000,
  published: 0,
  connecting: 2000,
  connected: 0,
  failed: 0,
}

export const MAX_SOCIAL_HISTORY = 100

export function getProfile(id: string): StealthProfile | undefined {
  return SAMPLE_PROFILES.find((p) => p.id === id)
}

export function getPostsByProfile(profileId: string): SocialPost[] {
  return SAMPLE_POSTS.filter((p) => p.authorProfileId === profileId)
}

export function getConnectionsForProfile(profileId: string): SocialConnection[] {
  return SAMPLE_CONNECTIONS.filter(
    (c) => c.fromProfileId === profileId || c.toProfileId === profileId,
  )
}

export function getFollowers(profileId: string): SocialConnection[] {
  return SAMPLE_CONNECTIONS.filter((c) => c.toProfileId === profileId)
}

export function getFollowing(profileId: string): SocialConnection[] {
  return SAMPLE_CONNECTIONS.filter((c) => c.fromProfileId === profileId)
}
