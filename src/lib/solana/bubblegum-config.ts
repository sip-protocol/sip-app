import { PublicKey } from "@solana/web3.js"
import { logger } from "@/lib/logger"

/**
 * Read Bubblegum tree configuration from env vars.
 * Returns null if either tree or collection is not configured.
 */
export function getBubblegumConfig(): {
  merkleTree: PublicKey
  collectionMint: PublicKey
} | null {
  const treeStr =
    typeof process !== "undefined"
      ? process.env?.NEXT_PUBLIC_MERKLE_TREE
      : undefined
  const collStr =
    typeof process !== "undefined"
      ? process.env?.NEXT_PUBLIC_COLLECTION_MINT
      : undefined

  if (!treeStr || !collStr) return null

  try {
    return {
      merkleTree: new PublicKey(treeStr),
      collectionMint: new PublicKey(collStr),
    }
  } catch {
    logger.warn(
      "[SIP] Invalid Bubblegum config — falling back to simulation",
      "getBubblegumConfig"
    )
    return null
  }
}
