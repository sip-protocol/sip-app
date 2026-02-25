import { getSDK } from "@/lib/sip-client"
import {
  generateStealthAddressBrowser,
  hexToBase58,
} from "@/lib/stealth-browser-fallback"

export interface StealthMusicResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
}

/**
 * Generate a stealth address for anonymous music streaming.
 * Uses real @sip-protocol/sdk cryptography — genuine one-time unlinkable addresses.
 * Streams to this address cannot be linked to the listener's wallet.
 */
export async function generateMusicStealthAddress(): Promise<StealthMusicResult> {
  try {
    const sdk = await getSDK()

    const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
      sdk.generateStealthMetaAddress("solana")

    const { stealthAddress } = sdk.generateStealthAddress(metaAddress)

    const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)
    const stealthAddressStr = `sip:solana:${hexToBase58(stealthAddress.address)}`

    return {
      stealthAddress: stealthAddressStr,
      metaAddress: metaAddressStr,
      spendingKey: spendingPrivateKey,
      viewingKey: viewingPrivateKey,
    }
  } catch {
    // SDK imports Node.js-only deps (gRPC) — fall back to Web Crypto
    return generateStealthAddressBrowser()
  }
}
