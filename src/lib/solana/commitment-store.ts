/**
 * Commitment Store Primitive
 *
 * Stores Pedersen commitment hashes on Solana via the Memo program for
 * commit-reveal patterns. Useful for governance votes, gaming moves,
 * ticketing, and any scenario requiring hidden-then-revealed data.
 *
 * Flow:
 * 1. createCommitmentStore() — hash data with random salt, get tx builder
 * 2. Sign & send the commit transaction (SIP-COMMIT memo on-chain)
 * 3. Later, createRevealTransaction() — reveal data + salt on-chain
 * 4. Anyone can verifyCommitmentReveal() to confirm the reveal matches
 *
 * This module does NOT sign or send transactions — it produces signable
 * Transaction objects for the calling hook/component to submit via wallet adapter.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js"
import { createMemoInstruction } from "@solana/spl-memo"

export type CommitmentType = "vote" | "move" | "ticket" | "generic"

export interface CommitmentStoreParams {
  /** Data to commit (e.g., "proposalId:choice:weight") */
  data: string
  /** Type of commitment for memo tagging */
  commitmentType: CommitmentType
}

export interface CommitmentStoreResult {
  /** SHA-256 of data+salt (0x prefixed) */
  commitmentHash: string
  /** Random 32-byte hex salt (keep secret until reveal) */
  salt: string
  /** Builds a signable Solana transaction (caller signs + sends) */
  buildTransaction: (senderPubkey: PublicKey, rpcUrl: string) => Promise<Transaction>
  /** Generate a Solscan explorer URL for a given tx signature */
  getExplorerUrl: (txSignature: string, cluster?: string) => string
}

/**
 * SHA-256 hash of `data + ":" + salt`.
 *
 * Uses crypto.subtle (browser) with crypto.createHash fallback (Node/tests).
 * Returns 0x-prefixed hex string.
 */
export async function hashCommitment(data: string, salt: string): Promise<string> {
  const input = `${data}:${salt}`

  // Browser path: crypto.subtle
  if (typeof globalThis.crypto?.subtle?.digest === "function") {
    const encoder = new TextEncoder()
    const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(input))
    const hashArray = Array.from(new Uint8Array(buffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return `0x${hashHex}`
  }

  // Node/test fallback: crypto.createHash
  const { createHash } = await import("crypto")
  const hash = createHash("sha256").update(input).digest("hex")
  return `0x${hash}`
}

/**
 * Generate a cryptographically random 32-byte hex salt.
 */
function generateSalt(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Create a commitment store: hashes data with a random salt, returns
 * a transaction builder for on-chain commit via Memo program.
 *
 * @param params - Data and commitment type
 * @returns Commitment hash, salt, and transaction builder
 *
 * @example
 * ```ts
 * const commit = await createCommitmentStore({
 *   data: "proposal-1:yes:100",
 *   commitmentType: "vote",
 * })
 * const tx = await commit.buildTransaction(walletPubkey, rpcUrl)
 * // sign + send tx via wallet adapter
 * // save commit.salt securely for later reveal
 * ```
 */
export async function createCommitmentStore(
  params: CommitmentStoreParams
): Promise<CommitmentStoreResult> {
  const { data, commitmentType } = params
  const salt = generateSalt()
  const commitmentHash = await hashCommitment(data, salt)

  return {
    commitmentHash,
    salt,

    /**
     * Build a signable Solana transaction that anchors the commitment on-chain.
     * Includes a 1-lamport self-transfer + SIP-COMMIT memo.
     */
    buildTransaction: async (
      senderPubkey: PublicKey,
      rpcUrl: string
    ): Promise<Transaction> => {
      const connection = new Connection(rpcUrl, "confirmed")
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed")

      const tx = new Transaction({
        feePayer: senderPubkey,
        blockhash,
        lastValidBlockHeight,
      })

      // 1-lamport self-transfer to anchor the memo
      tx.add(
        SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: senderPubkey,
          lamports: 1,
        })
      )

      // Memo instruction with commitment
      const memo = `SIP-COMMIT:${commitmentType}:${commitmentHash}`
      tx.add(createMemoInstruction(memo))

      return tx
    },

    /**
     * Generate a Solscan explorer URL for a transaction signature.
     * Defaults to devnet; pass "mainnet-beta" for production.
     */
    getExplorerUrl: (txSignature: string, cluster?: string): string => {
      const base = `https://solscan.io/tx/${txSignature}`
      if (cluster === "mainnet-beta") return base
      return `${base}?cluster=${cluster ?? "devnet"}`
    },
  }
}

/**
 * Build a reveal transaction that discloses the original data and salt on-chain.
 * Anyone can then verify the reveal matches the original commitment.
 *
 * @param data - Original committed data
 * @param salt - Original salt used during commit
 * @param commitmentType - Type tag (must match the commit)
 * @param senderPubkey - Wallet public key (fee payer)
 * @param rpcUrl - Solana RPC endpoint
 * @returns Signable Transaction
 */
export async function createRevealTransaction(
  data: string,
  salt: string,
  commitmentType: CommitmentType,
  senderPubkey: PublicKey,
  rpcUrl: string
): Promise<Transaction> {
  const commitmentHash = await hashCommitment(data, salt)

  const connection = new Connection(rpcUrl, "confirmed")
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed")

  const tx = new Transaction({
    feePayer: senderPubkey,
    blockhash,
    lastValidBlockHeight,
  })

  // 1-lamport self-transfer to anchor the memo
  tx.add(
    SystemProgram.transfer({
      fromPubkey: senderPubkey,
      toPubkey: senderPubkey,
      lamports: 1,
    })
  )

  // Reveal memo: includes hash, original data, and salt for verification
  const memo = `SIP-REVEAL:${commitmentType}:${commitmentHash}:${data}:${salt}`
  tx.add(createMemoInstruction(memo))

  return tx
}

/**
 * Verify that revealed data and salt match the original commitment.
 * Pure function — no blockchain interaction needed.
 *
 * @param originalData - Data from the commit phase
 * @param originalSalt - Salt from the commit phase
 * @param revealedData - Data from the reveal phase
 * @param revealedSalt - Salt from the reveal phase
 * @returns true if the hashes match
 */
export async function verifyCommitmentReveal(
  originalData: string,
  originalSalt: string,
  revealedData: string,
  revealedSalt: string
): Promise<boolean> {
  const originalHash = await hashCommitment(originalData, originalSalt)
  const revealedHash = await hashCommitment(revealedData, revealedSalt)
  return originalHash === revealedHash
}
