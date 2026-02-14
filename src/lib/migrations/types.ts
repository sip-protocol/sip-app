import type { PrivacyLevel } from "@sip-protocol/types"

export type MigrationStep =
  | "scanning_wallet"
  | "generating_stealth"
  | "withdrawing_from_source"
  | "depositing_to_sunrise"
  | "complete"
  | "failed"

export interface DeadProtocol {
  id: string
  name: string
  icon: string
  description: string
  status: "dead" | "rugged" | "deprecated" | "inactive"
  category: "defi" | "token" | "nft" | "other"
}

export interface MigrationSource {
  protocol: DeadProtocol | null
  type: "protocol" | "manual"
  balance: string
  token: string
}

export interface Migration {
  id: string
  source: MigrationSource
  amount: string
  stealthAddress: string
  stealthMetaAddress: string
  privacyLevel: PrivacyLevel
  status: MigrationStep
  gsolAmount?: string
  carbonOffsetKg?: number
  withdrawTxHash?: string
  depositTxHash?: string
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<MigrationStep, number>>
}

export interface MigrationParams {
  source: MigrationSource
  amount: string
  privacyLevel: PrivacyLevel
}

export type MigrationStepChangeCallback = (
  step: MigrationStep,
  migration: Migration
) => void

export type MigrationMode = "simulation" | "devnet"
