/**
 * Browser fallback for stealth address generation.
 *
 * When @sip-protocol/sdk import fails in browser (gRPC Node.js dependencies),
 * this provides Web Crypto-based stealth address generation that produces
 * the same interface as the SDK.
 */

export interface BrowserStealthResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
  sharedSecret: string
}

function toHex(buf: Uint8Array): string {
  return (
    "0x" +
    Array.from(buf)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  )
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
    stealthAddress: `sip:solana:${toHex(stealthBytes)}`,
    metaAddress: `sip:solana:${toHex(metaBytes)}`,
    spendingKey: toHex(spendingKey),
    viewingKey: toHex(viewingKey),
    sharedSecret: toHex(sharedSecret),
  }
}
