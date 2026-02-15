import { getSDK } from "@/lib/sip-client"

export interface StealthGamingResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
}

/**
 * Generate a stealth address for private game reward claims.
 * Uses real @sip-protocol/sdk cryptography — genuine one-time unlinkable addresses.
 * Rewards claimed to this address cannot be linked to the player's wallet.
 */
export async function generateGamingStealthAddress(): Promise<StealthGamingResult> {
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
}
