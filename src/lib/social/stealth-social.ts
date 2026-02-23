import { getSDK } from "@/lib/sip-client"
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
  const sdk = await getSDK()

  const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
    sdk.generateStealthMetaAddress("solana")

  const { stealthAddress, sharedSecret } =
    sdk.generateStealthAddress(metaAddress)

  const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)
  const stealthAddressStr = `sip:solana:${stealthAddress.address}`

  return {
    stealthAddress: stealthAddressStr,
    metaAddress: metaAddressStr,
    spendingKey: spendingPrivateKey,
    viewingKey: viewingPrivateKey,
    sharedSecret,
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
 * We encode the content as TransactionData (the SDK's standard encrypted payload format).
 */
export async function encryptSocialContent(
  content: string,
  viewingKeyHex: string
): Promise<{ ciphertext: string; nonce: string }> {
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
}

/**
 * Decrypt social content using XChaCha20-Poly1305 via the SDK viewing key system.
 */
export async function decryptSocialContent(
  ciphertext: string,
  nonce: string,
  viewingKeyHex: string
): Promise<string> {
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
}
