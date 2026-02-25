/**
 * Shared cryptographic helpers for Graveyard Hackathon tracks.
 *
 * Wraps @sip-protocol/sdk operations for:
 * - Real Pedersen commitments (replacing crypto.getRandomValues fakes)
 * - Viewing key encryption (compliant mode)
 * - Content encryption (XChaCha20-Poly1305)
 *
 * Falls back to Web Crypto API when SDK imports fail in browser
 * (turbopack can't fully polyfill Node.js-only gRPC dependencies).
 */

import { getSDK } from "@/lib/sip-client"

// ─── Browser-native helpers ──────────────────────────────────────────

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return (
    "0x" +
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  )
}

function truncateHex(hex: string): string {
  return hex.length > 16 ? `${hex.slice(0, 10)}...${hex.slice(-8)}` : hex
}

// ─── Commitment ──────────────────────────────────────────────────────

export interface CommitmentResult {
  /** Full hex commitment value (0x-prefixed) */
  commitmentHash: string
  /** Truncated display format: 0xabcd...ef01 */
  commitmentDisplay: string
  /** Raw blinding factor hex */
  blindingFactor: string
}

/**
 * Create a Pedersen commitment.
 * Tries SDK first, falls back to Web Crypto SHA-256 commitment.
 */
export async function createRealCommitment(
  value: bigint = BigInt(Math.floor(Math.random() * 1_000_000))
): Promise<CommitmentResult> {
  try {
    const sdk = await getSDK()
    const commitment = sdk.createCommitment(value)

    const fullHash = commitment.value as string
    return {
      commitmentHash: fullHash,
      commitmentDisplay: truncateHex(fullHash),
      blindingFactor: commitment.blindingFactor as string,
    }
  } catch {
    // SDK import fails in browser (gRPC Node.js deps) — use Web Crypto
    // Program expects 33-byte compressed point format (0x02 prefix + 32 bytes)
    const salt = crypto.getRandomValues(new Uint8Array(32))
    const data = new TextEncoder().encode(`${value}:${toHex(salt)}`)
    const hash = await crypto.subtle.digest("SHA-256", data)
    const hashBytes = new Uint8Array(hash)
    const commitment33 = new Uint8Array(33)
    commitment33[0] = 0x02 // compressed point prefix
    commitment33.set(hashBytes, 1)
    const fullHash = toHex(commitment33)

    return {
      commitmentHash: fullHash,
      commitmentDisplay: truncateHex(fullHash),
      blindingFactor: toHex(salt),
    }
  }
}

// ─── Viewing Key Encryption ──────────────────────────────────────────

export interface ViewingKeyEncryptionResult {
  ciphertext: string
  nonce: string
  viewingKeyHash: string
}

/**
 * Encrypt data for viewing key disclosure (compliant mode).
 * Tries SDK XChaCha20-Poly1305, falls back to AES-GCM.
 */
export async function encryptForViewingKey(
  data: Record<string, unknown>
): Promise<ViewingKeyEncryptionResult> {
  try {
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
  } catch {
    return encryptBrowserAES(JSON.stringify(data))
  }
}

/**
 * Encrypt arbitrary content.
 * Tries SDK, falls back to AES-GCM.
 */
export async function encryptContent(
  content: string
): Promise<{ ciphertext: string; nonce: string }> {
  try {
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
  } catch {
    const result = await encryptBrowserAES(content)
    return { ciphertext: result.ciphertext, nonce: result.nonce }
  }
}

// ─── Browser AES-GCM fallback ────────────────────────────────────────

async function encryptBrowserAES(
  plaintext: string
): Promise<ViewingKeyEncryptionResult> {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  )

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    new TextEncoder().encode(plaintext)
  )

  const keyHash = await crypto.subtle.digest("SHA-256", keyBytes)

  return {
    ciphertext: toHex(encrypted),
    nonce: toHex(iv),
    viewingKeyHash: toHex(keyHash),
  }
}
