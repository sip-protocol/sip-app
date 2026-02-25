/**
 * Browser fallback for stealth address generation.
 *
 * When @sip-protocol/sdk import fails in browser (gRPC Node.js dependencies),
 * this provides Web Crypto-based stealth address generation that produces
 * the same interface as the SDK.
 */

import bs58 from "bs58"

export interface BrowserStealthResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
  sharedSecret: string
}

function toBase58(buf: Uint8Array): string {
  return bs58.encode(buf)
}

/** Convert a hex string (with or without 0x prefix) to base58 */
export function hexToBase58(hex: string): string {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex
  const bytes = new Uint8Array(
    clean.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  )
  return bs58.encode(bytes)
}

/**
 * Generate a stealth address using Web Crypto when SDK is unavailable.
 * Produces random keys and derives the stealth address via SHA-256.
 */
export async function generateStealthAddressBrowser(): Promise<BrowserStealthResult> {
  const spendingKey = crypto.getRandomValues(new Uint8Array(32))
  const viewingKey = crypto.getRandomValues(new Uint8Array(32))
  const sharedSecret = crypto.getRandomValues(new Uint8Array(32))

  const combined = new Uint8Array(64)
  combined.set(spendingKey, 0)
  combined.set(viewingKey, 32)
  const hash = await crypto.subtle.digest("SHA-256", combined)
  const stealthBytes = new Uint8Array(hash)

  const metaBytes = new Uint8Array(64)
  metaBytes.set(spendingKey, 0)
  metaBytes.set(viewingKey, 32)

  return {
    stealthAddress: `sip:solana:${toBase58(stealthBytes)}`,
    metaAddress: `sip:solana:${toBase58(metaBytes)}`,
    spendingKey: toBase58(spendingKey),
    viewingKey: toBase58(viewingKey),
    sharedSecret: toBase58(sharedSecret),
  }
}
