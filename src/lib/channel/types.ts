import type { PrivacyLevel } from "@sip-protocol/types"

export type SubscribeStep =
  | "selecting_channel"
  | "subscribing"
  | "subscribed"
  | "failed"

export type PublishStep =
  | "encrypting_content"
  | "generating_stealth"
  | "publishing"
  | "published"
  | "failed"

export type ChannelStep = SubscribeStep | PublishStep

export type AccessTier = "free" | "subscriber" | "premium"

export type ContentType = "article" | "tutorial" | "deep_dive" | "alpha"

export interface Drop {
  id: string
  title: string
  description: string
  contentType: ContentType
  accessTier: AccessTier
  author: string
  publishedAt: number
  subscriberCount: number
  isEncrypted: boolean
  icon: string
}

export interface ChannelSubscription {
  dropId: string
  subscribedAt: number
  accessTier: AccessTier
  isActive: boolean
}

export interface ChannelActionRecord {
  id: string
  type: "subscribe" | "publish"
  dropId: string
  status: ChannelStep
  privacyLevel: PrivacyLevel
  // Subscribe-specific
  dropTitle?: string
  accessTier?: AccessTier
  // Publish-specific
  contentType?: ContentType
  title?: string
  stealthAddress?: string
  stealthMetaAddress?: string
  // Timestamps
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<ChannelStep, number>>
}

export interface SubscribeParams {
  dropId: string
  privacyLevel: PrivacyLevel
}

export interface PublishDropParams {
  title: string
  content: string
  contentType: ContentType
  accessTier: AccessTier
  privacyLevel: PrivacyLevel
}

export type ChannelStepChangeCallback = (
  step: ChannelStep,
  record: ChannelActionRecord
) => void

export type ChannelMode = "simulation" | "drip"
