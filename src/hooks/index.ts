/**
 * SIP App Hooks
 *
 * Re-exports all custom hooks.
 */

// Balance hook
export { useBalance, type UseBalanceResult } from "./use-balance"

// Quote hook
export {
  useQuote,
  type QuoteFreshness,
  type QuoteParams,
  type QuoteResult,
} from "./use-quote"

// Swap hook
export {
  useSwap,
  getStatusMessage,
  type SwapStatus,
  type SwapResult,
  type SwapParams,
} from "./use-swap"

// Viewing key disclosure hook
export {
  useViewingKeyDisclosure,
  parseViewingKeyFromJson,
  isValidViewingKey,
  type ShareableKey,
  type DecryptionResult,
} from "./use-viewing-key-disclosure"

// Viewing key storage hook
export { useViewingKeyStorage } from "./use-viewing-key-storage"

// Stealth keys hook
export { useStealthKeys, type StealthKeys } from "./use-stealth-keys"

// Scan payments hook
export { useScanPayments, type DetectedPayment } from "./use-scan-payments"

// Send payment hook
export { useSendPayment } from "./use-send-payment"

// Solana transaction hook for wallet signing lifecycle
export {
  useSolanaTransaction,
  type SolanaTxStatus,
  type UseSolanaTransactionReturn,
} from "./use-solana-transaction"

// Container size hook for responsive D3 visualizations
export { useContainerSize } from "./use-container-size"

// Governance on-chain vote commitment hook
export {
  useGovernanceCommit,
  type GovernanceCommitResult,
} from "./use-governance-commit"

// Stealth tipping hook
export { useStealthTip, type TipResult } from "./use-stealth-tip"

// Stealth research funding hook
export { useStealthFund, type FundResult } from "./use-stealth-fund"

// Game commitment hook for on-chain commit-reveal
export {
  useGameCommitment,
  type GameCommitmentResult,
} from "./use-game-commitment"

// Ticket commitment hook for on-chain ticket purchases
export {
  useTicketCommitment,
  type TicketCommitmentResult,
} from "./use-ticket-commitment"
