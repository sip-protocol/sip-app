import { getSDK } from "@/lib/sip-client"

export interface StealthLoyaltyResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
}

/**
 * Generate a stealth address for claiming loyalty rewards.
 * Uses real @sip-protocol/sdk cryptography — genuine one-time unlinkable addresses.
 * Rewards sent to this address cannot be linked to the claimant's wallet.
 */
export async function generateLoyaltyStealthAddress(): Promise<StealthLoyaltyResult> {
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
