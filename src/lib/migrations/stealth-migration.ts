import { getSDK } from "@/lib/sip-client"

export interface StealthMigrationResult {
  stealthAddress: string
  stealthMetaAddress: string
  spendingPrivateKey: string
  viewingPrivateKey: string
  sharedSecret: string
}

/**
 * Generate a stealth address for the migration destination (Sunrise Stake deposit).
 * Uses real @sip-protocol/sdk cryptography on Solana's ed25519 curve.
 *
 * The stealth address ensures the Sunrise deposit cannot be linked
 * to the source wallet, providing a "clean slate" migration.
 */
export async function generateMigrationStealthAddress(): Promise<StealthMigrationResult> {
  const sdk = await getSDK()

  const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
    sdk.generateStealthMetaAddress(
      "solana" as Parameters<typeof sdk.generateStealthMetaAddress>[0]
    )

  const { stealthAddress, sharedSecret } =
    sdk.generateStealthAddress(metaAddress)

  const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)
  const stealthAddressStr = `sip:solana:${stealthAddress.address}`

  return {
    stealthAddress: stealthAddressStr,
    stealthMetaAddress: metaAddressStr,
    spendingPrivateKey,
    viewingPrivateKey,
    sharedSecret,
  }
}
