/**
 * SIP App Type Definitions
 */

// Re-export types from @sip-protocol/types
export type {
  ShieldedIntent,
  StealthAddress,
  ViewingKey,
  PrivacyLevel,
} from "@sip-protocol/types"

/**
 * Payment types
 */
export interface Payment {
  id: string
  type: "sent" | "received"
  amount: number
  token: string
  recipient?: string
  sender?: string
  timestamp: Date
  status: "pending" | "confirmed" | "failed"
  txHash?: string
}

/**
 * Wallet state
 */
export interface WalletState {
  connected: boolean
  address: string | null
  balance: number | null
  stealthMetaAddress: string | null
}

/**
 * Toast notification
 */
export interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
}
