/**
 * Privacy Backend Types
 *
 * Core type definitions for the PrivacyBackend abstraction layer.
 * This enables SIP to support multiple privacy backends:
 * - SIP Native (Pedersen + Stealth + ZK)
 * - PrivacyCash (Pool mixing)
 * - Inco (FHE + TEE)
 * - Arcium (MPC)
 *
 * @see https://github.com/sip-protocol/sip-protocol/issues/483
 */

import type { PrivacyLevel } from "@sip-protocol/types"

/**
 * Supported privacy backend identifiers
 */
export type BackendName =
  | "mock" // Development/testing
  | "sip-native" // Our Anchor program (Pedersen + Stealth + ZK)
  | "privacycash" // Pool mixing (Tornado-style)
  | "inco" // FHE + TEE
  | "arcium" // MPC

/**
 * Token information for transfers
 */
export interface TokenInfo {
  /** Token symbol (e.g., "SOL", "USDC") */
  symbol: string
  /** Token name (e.g., "Solana", "USD Coin") */
  name: string
  /** SPL token mint address (null for native SOL) */
  mint: string | null
  /** Token decimals */
  decimals: number
  /** Token logo URL */
  logo?: string
}

/**
 * Common Solana tokens
 */
export const TOKENS: Record<string, TokenInfo> = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    mint: null, // Native token
    decimals: 9,
    logo: "/tokens/sol.png",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logo: "/tokens/usdc.png",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    logo: "/tokens/usdt.png",
  },
}

/**
 * Features supported by a privacy backend
 */
export interface BackendFeatures {
  /** Hides transaction amounts (Pedersen, FHE, or MPC) */
  amountHiding: boolean
  /** Hides recipient identity (stealth addresses or encryption) */
  recipientHiding: boolean
  /** Supports viewing keys for compliance/audit */
  viewingKeys: boolean
  /** Only supports same-chain transfers */
  sameChainOnly: boolean
  /** Average transaction latency in milliseconds */
  averageLatencyMs: number
  /** Privacy model type */
  privacyModel: "cryptographic" | "statistical" | "encryption" | "mpc"
}

/**
 * Parameters for getting a transfer quote
 */
export interface QuoteParams {
  /** Source token */
  fromToken: TokenInfo
  /** Destination token (same as fromToken for same-token privacy transfer) */
  toToken: TokenInfo
  /** Amount to transfer (in base units, e.g., lamports) */
  amount: bigint
  /** Desired privacy level */
  privacyLevel: PrivacyLevel
  /** Sender's public key */
  sender?: string
  /** Recipient's address or SIP meta-address */
  recipient?: string
}

/**
 * Quote response from a privacy backend
 */
export interface Quote {
  /** Unique quote identifier */
  id: string
  /** Backend that generated this quote */
  backend: BackendName
  /** Input amount (in base units) */
  inputAmount: bigint
  /** Output amount after fees (in base units) */
  outputAmount: bigint
  /** Fee amount (in base units) */
  feeAmount: bigint
  /** Fee percentage (0-100) */
  feePercent: number
  /** Estimated time to completion in seconds */
  estimatedTimeSeconds: number
  /** Quote expiration timestamp */
  expiresAt: Date
  /** Whether this quote is still valid */
  isValid: boolean
  /** Additional backend-specific data */
  metadata?: Record<string, unknown>
}

/**
 * Parameters for executing a private transfer
 */
export interface TransferParams {
  /** Quote to execute (optional, will fetch if not provided) */
  quote?: Quote
  /** Source token */
  fromToken: TokenInfo
  /** Destination token */
  toToken: TokenInfo
  /** Amount to transfer (in base units) */
  amount: bigint
  /** Desired privacy level */
  privacyLevel: PrivacyLevel
  /** Sender's public key */
  sender: string
  /** Recipient's address or SIP meta-address */
  recipient: string
  /** Viewing key for compliant transfers (required if privacyLevel is COMPLIANT) */
  viewingKey?: string
  /** Slippage tolerance (0-100, default 0.5) */
  slippageTolerance?: number
}

/**
 * Status of a transfer operation
 */
export type TransferStatus =
  | "pending" // Waiting to start
  | "signing" // Waiting for wallet signature
  | "confirming" // Transaction submitted, waiting for confirmation
  | "processing" // Backend-specific processing (e.g., MPC rounds)
  | "success" // Transfer completed successfully
  | "failed" // Transfer failed

/**
 * Result of a transfer operation
 */
export interface TransferResult {
  /** Transfer status */
  status: TransferStatus
  /** Transaction hash (if submitted) */
  txHash?: string
  /** Block explorer URL for the transaction */
  explorerUrl?: string
  /** Error message (if failed) */
  error?: string
  /** Stealth address used (if applicable) */
  stealthAddress?: string
  /** Pedersen commitment (if applicable) */
  commitment?: string
  /** Viewing key (if compliant mode) */
  viewingKey?: string
  /** Backend-specific result data */
  metadata?: Record<string, unknown>
}

/**
 * Payment found during scanning
 */
export interface ScannedPayment {
  /** Unique payment identifier */
  id: string
  /** Amount received (in base units) */
  amount: bigint
  /** Token received */
  token: TokenInfo
  /** Sender's address (if known) */
  sender?: string
  /** One-time stealth address */
  stealthAddress: string
  /** Transaction hash */
  txHash: string
  /** Block timestamp */
  timestamp: Date
  /** Whether this payment has been claimed */
  claimed: boolean
}

/**
 * Backend health/status information
 */
export interface BackendStatus {
  /** Whether the backend is available */
  available: boolean
  /** Current network (mainnet, devnet, testnet) */
  network: "mainnet" | "devnet" | "testnet"
  /** Latency to backend in milliseconds */
  latencyMs: number
  /** Error message if not available */
  error?: string
  /** Last checked timestamp */
  lastChecked: Date
}

/**
 * Event emitted during transfer operations
 */
export interface TransferEvent {
  /** Event type */
  type:
    | "status_change"
    | "tx_submitted"
    | "tx_confirmed"
    | "proof_generated"
    | "error"
  /** New status (for status_change events) */
  status?: TransferStatus
  /** Transaction hash (for tx_* events) */
  txHash?: string
  /** Error message (for error events) */
  error?: string
  /** Event timestamp */
  timestamp: Date
  /** Additional event data */
  data?: Record<string, unknown>
}

/**
 * Callback for transfer events
 */
export type TransferEventCallback = (event: TransferEvent) => void
