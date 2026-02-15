import type { PrivacyLevel } from "@sip-protocol/types"

export type FundStep =
  | "selecting_project"
  | "generating_stealth_funding"
  | "funding"
  | "funded"
  | "failed"

export type ReviewStep =
  | "generating_proof"
  | "submitting_review"
  | "reviewed"
  | "failed"

export type DeSciStep = FundStep | ReviewStep

export type ResearchCategory =
  | "biotech"
  | "neurotech"
  | "genomics"
  | "climate"
  | "pharma"

export type FundingTier = "micro" | "seed" | "research" | "grant"

export interface Project {
  id: string
  title: string
  description: string
  category: ResearchCategory
  tier: FundingTier
  contributorCount: number
  isActive: boolean
  icon: string
}

export interface Contribution {
  projectId: string
  tier: FundingTier
  commitmentHash: string
  contributedAt: number
}

export interface DeSciActionRecord {
  id: string
  type: "fund" | "review"
  projectId: string
  status: DeSciStep
  privacyLevel: PrivacyLevel
  // Fund-specific
  projectTitle?: string
  category?: ResearchCategory
  tier?: FundingTier
  commitmentHash?: string
  // Review-specific
  stealthAddress?: string
  stealthMetaAddress?: string
  reviewVerified?: boolean
  // Timestamps
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<DeSciStep, number>>
}

export interface FundProjectParams {
  projectId: string
  tier: FundingTier
  privacyLevel: PrivacyLevel
}

export interface ReviewProjectParams {
  projectId: string
  tier: FundingTier
  privacyLevel: PrivacyLevel
}

export type DeSciStepChangeCallback = (
  step: DeSciStep,
  record: DeSciActionRecord
) => void

export type DeSciMode = "simulation" | "bio"
