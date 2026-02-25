import { getSDK } from "@/lib/sip-client"
import {
  generateStealthAddressBrowser,
  hexToBase58,
} from "@/lib/stealth-browser-fallback"
import type { TransactionData } from "@sip-protocol/sdk"

export interface StealthSocialResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
  sharedSecret: string
}

/**
 * Generate a stealth identity for anonymous social interactions.
 * Uses real @sip-protocol/sdk cryptography — genuine one-time unlinkable addresses.
 */
export async function generateSocialStealthAddress(): Promise<StealthSocialResult> {
  try {
    const sdk = await getSDK()

    const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
      sdk.generateStealthMetaAddress("solana")

    const { stealthAddress, sharedSecret } =
      sdk.generateStealthAddress(metaAddress)

    const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)
    const stealthAddressStr = `sip:solana:${hexToBase58(stealthAddress.address)}`

    return {
      stealthAddress: stealthAddressStr,
      metaAddress: metaAddressStr,
      spendingKey: spendingPrivateKey,
      viewingKey: viewingPrivateKey,
      sharedSecret,
    }
  } catch {
    // SDK imports Node.js-only deps (gRPC) — fall back to Web Crypto
    return generateStealthAddressBrowser()
  }
}

/**
 * Reconstruct a ViewingKey from a hex string.
 * Computes SHA-256 hash to match SDK's generateViewingKey() behavior.
 */
async function viewingKeyFromHex(hex: string) {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex
  const bytes = new Uint8Array(
    cleanHex.match(/.{2}/g)!.map((b) => parseInt(b, 16))
  )
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes)
  const hashArray = new Uint8Array(hashBuffer)
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return {
    key: `0x${cleanHex}` as `0x${string}`,
    path: "m/social",
    hash: `0x${hashHex}` as `0x${string}`,
  }
}

/**
 * Encrypt social content using XChaCha20-Poly1305 via the SDK viewing key system.
 * Falls back to AES-GCM in browser when SDK is unavailable.
 */
export async function encryptSocialContent(
  content: string,
  viewingKeyHex: string
): Promise<{ ciphertext: string; nonce: string }> {
  try {
    const sdk = await getSDK()

    const viewingKey = await viewingKeyFromHex(viewingKeyHex)

    const payload = {
      sender: "social",
      recipient: "social",
      amount: "0",
      timestamp: Date.now(),
      memo: content,
    } as unknown as TransactionData

    const encrypted = sdk.encryptForViewing(payload, viewingKey)

    return {
      ciphertext: encrypted.ciphertext,
      nonce: encrypted.nonce,
    }
  } catch {
    // SDK unavailable in browser — fall back to AES-GCM
    return encryptBrowserAES(content, viewingKeyHex)
  }
}

/**
 * Decrypt social content using XChaCha20-Poly1305 via the SDK viewing key system.
 * Falls back to AES-GCM in browser when SDK is unavailable.
 */
export async function decryptSocialContent(
  ciphertext: string,
  nonce: string,
  viewingKeyHex: string
): Promise<string> {
  try {
    const sdk = await getSDK()

    const viewingKey = await viewingKeyFromHex(viewingKeyHex)

    const decrypted = sdk.decryptWithViewing(
      {
        ciphertext: ciphertext as `0x${string}`,
        nonce: nonce as `0x${string}`,
        viewingKeyHash: viewingKey.hash,
      },
      viewingKey
    ) as unknown as { memo?: string }

    return decrypted?.memo ?? ""
  } catch {
    // SDK unavailable in browser — fall back to AES-GCM
    return decryptBrowserAES(ciphertext, nonce, viewingKeyHex)
  }
}

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return (
    "0x" +
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  )
}

async function encryptBrowserAES(
  plaintext: string,
  keyHex: string
): Promise<{ ciphertext: string; nonce: string }> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(
    keyHex.replace(/^0x/, "").padEnd(32, "0").slice(0, 32)
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  )

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoder.encode(plaintext)
  )

  return {
    ciphertext: toHex(encrypted),
    nonce: toHex(iv),
  }
}

async function decryptBrowserAES(
  ciphertextHex: string,
  nonceHex: string,
  keyHex: string
): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(
    keyHex.replace(/^0x/, "").padEnd(32, "0").slice(0, 32)
  )

  const fromHex = (hex: string) => {
    const clean = hex.startsWith("0x") ? hex.slice(2) : hex
    const bytes = new Uint8Array(clean.length / 2)
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16)
    }
    return bytes
  }

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromHex(nonceHex) },
    cryptoKey,
    fromHex(ciphertextHex)
  )

  return new TextDecoder().decode(decrypted)
}
