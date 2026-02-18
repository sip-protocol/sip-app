/**
 * Solana Transaction Primitives
 *
 * Reusable building blocks for constructing Solana transactions
 * with SIP Protocol privacy features.
 */

// Stealth transfer — one-time address SOL transfers
export {
  createStealthTransfer,
  type StealthTransferParams,
  type StealthTransferResult,
} from "./stealth-transfer"

// Commitment store — on-chain commit-reveal via memo program
export {
  createCommitmentStore,
  createRevealTransaction,
  verifyCommitmentReveal,
  hashCommitment,
  type CommitmentType,
  type CommitmentStoreParams,
  type CommitmentStoreResult,
} from "./commitment-store"
