import type { PrivacyLevel } from "@sip-protocol/types"

export type ExploreStep =
  | "selecting_world"
  | "generating_stealth_avatar"
  | "entering_world"
  | "entered"
  | "failed"

export type TeleportStep =
  | "generating_proof"
  | "teleporting"
  | "arrived"
  | "failed"

export type MetaverseStep = ExploreStep | TeleportStep

export type WorldCategory =
  | "gallery"
  | "game_room"
  | "social"
  | "marketplace"
  | "concert_hall"

export type AvatarTier = "explorer" | "warrior" | "citizen" | "merchant" | "vip"

export interface World {
  id: string
  title: string
  description: string
  category: WorldCategory
  tier: AvatarTier
  visitorCount: number
  isActive: boolean
  icon: string
}

export interface Visit {
  worldId: string
  tier: AvatarTier
  commitmentHash: string
  visitedAt: number
}

export interface MetaverseActionRecord {
  id: string
  type: "explore" | "teleport"
  worldId: string
  status: MetaverseStep
  privacyLevel: PrivacyLevel
  // Explore-specific
  worldTitle?: string
  category?: WorldCategory
  tier?: AvatarTier
  commitmentHash?: string
  // Teleport-specific
  stealthAddress?: string
  stealthMetaAddress?: string
  teleportVerified?: boolean
  // Timestamps
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<MetaverseStep, number>>
}

export interface ExploreWorldParams {
  worldId: string
  tier: AvatarTier
  privacyLevel: PrivacyLevel
}

export interface TeleportParams {
  worldId: string
  tier: AvatarTier
  privacyLevel: PrivacyLevel
}

export type MetaverseStepChangeCallback = (
  step: MetaverseStep,
  record: MetaverseActionRecord
) => void

export type MetaverseMode = "simulation" | "portals"
