import type { BridgeChainId } from "./types"
import { getSDK } from "@/lib/sip-client"

export interface StealthBridgeResult {
  stealthAddress: string
  stealthMetaAddress: string
  spendingPrivateKey: string
  viewingPrivateKey: string
  sharedSecret: string
}

/**
 * Map bridge chain IDs to SDK chain IDs.
 * The SDK supports all our bridge chains natively.
 */
function toSdkChainId(chain: BridgeChainId): string {
  return chain
}

/**
 * Generate a stealth address on the destination chain.
 * Uses real @sip-protocol/sdk cryptography — genuine one-time unlinkable addresses.
 *
 * Flow:
 * 1. Generate a meta-address keypair for the dest chain
 * 2. Generate a one-time stealth address from that meta-address
 * 3. Return both so the bridge can send to the stealth address
 *    and the recipient can derive the private key to claim
 */
export async function generateBridgeStealthAddress(
  destChain: BridgeChainId,
): Promise<StealthBridgeResult> {
  const sdk = await getSDK()

  const sdkChain = toSdkChainId(destChain)

  // Generate recipient keypair (meta-address) on dest chain
  const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
    sdk.generateStealthMetaAddress(sdkChain as Parameters<typeof sdk.generateStealthMetaAddress>[0])

  // Generate one-time stealth address from the meta-address
  const { stealthAddress, sharedSecret } =
    sdk.generateStealthAddress(metaAddress)

  // Encode the meta-address for display/storage
  const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)

  // Format stealth address for display
  const stealthAddressStr = `sip:${destChain}:${stealthAddress.address}`

  return {
    stealthAddress: stealthAddressStr,
    stealthMetaAddress: metaAddressStr,
    spendingPrivateKey,
    viewingPrivateKey,
    sharedSecret,
  }
}

/**
 * Estimate bridge fee as a percentage of the amount
 */
export function estimateBridgeFee(
  amount: string,
  feeBps: number,
): { bridgeFee: string; gasFee: string; totalFee: string } {
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount <= 0) {
    return { bridgeFee: "0", gasFee: "0", totalFee: "0" }
  }

  const bridgeFee = (numAmount * feeBps) / 10000
  const gasFee = 0.001 // Flat estimate for gas
  const totalFee = bridgeFee + gasFee

  return {
    bridgeFee: bridgeFee.toFixed(6),
    gasFee: gasFee.toFixed(6),
    totalFee: totalFee.toFixed(6),
  }
}
