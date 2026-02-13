import type { PrivacyLevel } from "@sip-protocol/types"

export type BridgeChainId =
  | "solana"
  | "ethereum"
  | "base"
  | "arbitrum"
  | "optimism"

export type BridgeStep =
  | "generating_stealth"
  | "initiating_transfer"
  | "awaiting_attestation"
  | "relaying"
  | "complete"
  | "failed"

export interface BridgeTransfer {
  id: string
  sourceChain: BridgeChainId
  destChain: BridgeChainId
  token: string
  amount: string
  stealthAddress: string
  stealthMetaAddress: string
  privacyLevel: PrivacyLevel
  status: BridgeStep
  sourceTxHash?: string
  destTxHash?: string
  wormholeMessageId?: string
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<BridgeStep, number>>
}

export interface BridgeRoute {
  sourceChain: BridgeChainId
  destChain: BridgeChainId
  tokens: string[]
  estimatedTime: number
  available: boolean
}

export interface BridgeFeeEstimate {
  bridgeFee: string
  gasFee: string
  totalFee: string
  token: string
}

export interface BridgeParams {
  sourceChain: BridgeChainId
  destChain: BridgeChainId
  token: string
  amount: string
  privacyLevel: PrivacyLevel
}

export type BridgeStepChangeCallback = (
  step: BridgeStep,
  transfer: BridgeTransfer,
) => void

export type BridgeMode = "simulation" | "ntt"
