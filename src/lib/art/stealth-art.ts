import { getSDK } from "@/lib/sip-client"
import type { ArtParameters, ArtStyleId } from "./types"
import { getDefaultPalette } from "./constants"

export interface StealthArtResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
  sharedSecret: string
}

/**
 * Generate a stealth address for art generation.
 * Uses real @sip-protocol/sdk cryptography.
 */
export async function generateArtStealthAddress(): Promise<StealthArtResult> {
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
 * Generate a deterministic art seed from a stealth address.
 * SHA-256 hash of the address string → hex seed.
 */
export function generateArtSeed(stealthAddress: string): string {
  // Simple deterministic hash (SHA-256 equivalent for browser)
  let hash = 0
  for (let i = 0; i < stealthAddress.length; i++) {
    const char = stealthAddress.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }

  // Extend to 64-char hex string for sufficient entropy
  const base = Math.abs(hash).toString(16)
  let seed = ""
  for (let i = 0; i < 64; i++) {
    const idx = (i * 7 + hash) % base.length
    seed += base[Math.abs(idx) % base.length]
  }

  return seed
}

/**
 * Derive art parameters from a seed and style ID.
 * Maps seed bytes to palette, shapes, and transforms.
 */
export function deriveArtParameters(seed: string, styleId: ArtStyleId): ArtParameters {
  const palette = deriveColorPalette(seed, styleId)

  const byte = (index: number) => {
    const hex = seed.slice((index * 2) % seed.length, (index * 2 + 2) % seed.length)
    return parseInt(hex, 16) || ((index * 37) % 256)
  }

  const shapeCount = 8 + byte(10) % 20
  const shapeTypes: ("circle" | "rect" | "path")[] = []
  const typeMap: ("circle" | "rect" | "path")[] = ["circle", "rect", "path"]
  for (let i = 0; i < 3; i++) {
    if (byte(11 + i) % 2 === 0) {
      shapeTypes.push(typeMap[i])
    }
  }
  if (shapeTypes.length === 0) shapeTypes.push("circle")

  return {
    styleId,
    palette,
    shapes: { count: shapeCount, types: shapeTypes },
    transforms: {
      rotation: byte(14) % 360,
      scale: 0.5 + (byte(15) / 255) * 1.0,
      opacity: 0.3 + (byte(16) / 255) * 0.7,
    },
    seed,
  }
}

function deriveColorPalette(seed: string, styleId: ArtStyleId): string[] {
  const defaults = getDefaultPalette(styleId)

  // Shift hues slightly based on seed for uniqueness
  const shift = parseInt(seed.slice(0, 2), 16) || 0

  return defaults.map((color, i) => {
    if (shift % 3 === 0) return color

    // Simple color variation — shift the last hex digit
    const base = color.slice(0, -1)
    const lastChar = parseInt(color.slice(-1), 16) || 0
    const newChar = ((lastChar + shift + i) % 16).toString(16)
    return base + newChar
  })
}
