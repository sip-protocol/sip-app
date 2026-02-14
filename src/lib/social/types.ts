import type { PrivacyLevel } from "@sip-protocol/types"

export type ProfileStep =
  | "generating_stealth"
  | "creating_profile"
  | "profile_created"
  | "failed"

export type PostStep =
  | "encrypting_content"
  | "publishing"
  | "published"
  | "failed"

export type FollowStep =
  | "generating_stealth"
  | "connecting"
  | "connected"
  | "failed"

export type SocialStep = ProfileStep | PostStep | FollowStep

export type PostStatus = "draft" | "published" | "encrypted" | "deleted"

export interface StealthProfile {
  id: string
  username: string
  bio: string
  stealthAddress: string
  stealthMetaAddress: string
  viewingPrivateKey: string
  spendingPrivateKey: string
  createdAt: number
  postCount: number
  followerCount: number
  followingCount: number
}

export interface SocialPost {
  id: string
  authorProfileId: string
  authorUsername: string
  content: string
  encryptedContent?: string
  timestamp: number
  likeCount: number
  commentCount: number
  isEncrypted: boolean
  privacyLevel: PrivacyLevel
}

export interface SocialConnection {
  id: string
  fromProfileId: string
  fromUsername: string
  toProfileId: string
  toUsername: string
  sharedSecret?: string
  isEncrypted: boolean
  createdAt: number
}

export interface SocialActionRecord {
  id: string
  type: "profile" | "post" | "follow"
  profileId: string
  status: SocialStep
  privacyLevel: PrivacyLevel
  // Profile-specific
  username?: string
  stealthAddress?: string
  stealthMetaAddress?: string
  // Post-specific
  content?: string
  encryptedContent?: string
  postId?: string
  // Follow-specific
  targetProfileId?: string
  targetUsername?: string
  sharedSecret?: string
  // Timestamps
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<SocialStep, number>>
}

export interface CreateProfileParams {
  username: string
  bio: string
  privacyLevel: PrivacyLevel
}

export interface CreatePostParams {
  profileId: string
  content: string
  privacyLevel: PrivacyLevel
}

export interface FollowParams {
  fromProfileId: string
  toProfileId: string
  privacyLevel: PrivacyLevel
}

export type SocialStepChangeCallback = (
  step: SocialStep,
  record: SocialActionRecord
) => void

export type SocialMode = "simulation" | "tapestry"
