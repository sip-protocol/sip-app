import { getSDK } from "@/lib/sip-client"

export interface StealthMetaverseResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
}

/**
 * Generate a stealth address for private metaverse exploration.
 * Uses real @sip-protocol/sdk cryptography — genuine one-time unlinkable addresses.
 * Avatars linked to this address cannot be traced back to the explorer's wallet.
 */
export async function generateMetaverseStealthAddress(): Promise<StealthMetaverseResult> {
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
