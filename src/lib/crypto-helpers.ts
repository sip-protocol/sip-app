/**
 * Shared cryptographic helpers for Graveyard Hackathon tracks.
 *
 * Wraps @sip-protocol/sdk operations for:
 * - Real Pedersen commitments (replacing crypto.getRandomValues fakes)
 * - Viewing key encryption (compliant mode)
 * - Content encryption (XChaCha20-Poly1305)
 */

import { getSDK } from "@/lib/sip-client"

export interface CommitmentResult {
  /** Full hex commitment value (0x-prefixed) */
  commitmentHash: string
  /** Truncated display format: 0xabcd...ef01 */
  commitmentDisplay: string
  /** Raw blinding factor hex */
  blindingFactor: string
}

/**
 * Create a real Pedersen commitment using the SDK.
 * Replaces fake `crypto.getRandomValues()` pattern.
 *
 * @param value - The value to commit (e.g., amount, ticket ID seed)
 */
export async function createRealCommitment(
  value: bigint = BigInt(Math.floor(Math.random() * 1_000_000))
): Promise<CommitmentResult> {
  const sdk = await getSDK()
  const commitment = sdk.createCommitment(value)

  const fullHash = commitment.value as string
  const display = fullHash.length > 16
    ? `${fullHash.slice(0, 10)}...${fullHash.slice(-8)}`
    : fullHash

  return {
    commitmentHash: fullHash,
    commitmentDisplay: display,
    blindingFactor: commitment.blindingFactor as string,
  }
}

export interface ViewingKeyEncryptionResult {
  ciphertext: string
  nonce: string
  viewingKeyHash: string
}

/**
 * Encrypt data for viewing key disclosure (compliant mode).
 * Uses real SDK XChaCha20-Poly1305 encryption.
 */
export async function encryptForViewingKey(
  data: Record<string, unknown>
): Promise<ViewingKeyEncryptionResult> {
  const sdk = await getSDK()
  const viewingKey = sdk.generateViewingKey()

  const payload = {
    sender: "sip-app",
    recipient: "auditor",
    amount: "0",
    timestamp: Date.now(),
    memo: JSON.stringify(data),
  } as Parameters<typeof sdk.encryptForViewing>[0]

  const encrypted = sdk.encryptForViewing(payload, viewingKey)

  return {
    ciphertext: encrypted.ciphertext,
    nonce: encrypted.nonce,
    viewingKeyHash: viewingKey.hash,
  }
}

/**
 * Encrypt arbitrary content using SDK viewing key system.
 * Used for content encryption in channel, music, desci, gaming tracks.
 */
export async function encryptContent(
  content: string
): Promise<{ ciphertext: string; nonce: string }> {
  const sdk = await getSDK()
  const viewingKey = sdk.generateViewingKey()

  const payload = {
    sender: "sip-app",
    recipient: "sip-app",
    amount: "0",
    timestamp: Date.now(),
    memo: content,
  } as Parameters<typeof sdk.encryptForViewing>[0]

  const encrypted = sdk.encryptForViewing(payload, viewingKey)

  return {
    ciphertext: encrypted.ciphertext,
    nonce: encrypted.nonce,
  }
}
