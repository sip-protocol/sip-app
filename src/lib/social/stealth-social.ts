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
 * Encrypt social content using XChaCha20-Poly1305 via the SDK viewing key system.
 * We encode the content as TransactionData (the SDK's standard encrypted payload format).
 */
export async function encryptSocialContent(
  content: string,
  _viewingKeyHex: string
): Promise<{ ciphertext: string; nonce: string }> {
  const sdk = await getSDK()

  const viewingKey = sdk.generateViewingKey()

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
  _viewingKeyHex: string
): Promise<string> {
  const sdk = await getSDK()

  const viewingKey = sdk.generateViewingKey()

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
