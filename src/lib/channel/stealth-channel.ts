import { getSDK } from "@/lib/sip-client"

export interface StealthChannelResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
}

/**
 * Generate a stealth address for encrypted channel drops.
 * Uses real @sip-protocol/sdk cryptography — genuine one-time unlinkable addresses.
 * Drops published to this address cannot be linked to the publisher's wallet.
 */
export async function generateChannelStealthAddress(): Promise<StealthChannelResult> {
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
