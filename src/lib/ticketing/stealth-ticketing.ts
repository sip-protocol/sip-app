import { getSDK } from "@/lib/sip-client"
import { generateStealthAddressBrowser } from "@/lib/stealth-browser-fallback"

export interface StealthTicketingResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
}

/**
 * Generate a stealth address for private ticket purchases.
 * Uses real @sip-protocol/sdk cryptography — genuine one-time unlinkable addresses.
 * Tickets purchased to this address cannot be linked to the attendee's wallet.
 */
export async function generateTicketingStealthAddress(): Promise<StealthTicketingResult> {
  try {
    const sdk = await getSDK()

    const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
      sdk.generateStealthMetaAddress("solana")

    const { stealthAddress } = sdk.generateStealthAddress(metaAddress)

    const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)
    const stealthAddressStr = `sip:solana:${stealthAddress.address}`

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
