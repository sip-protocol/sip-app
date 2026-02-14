import type { ArtStyle, ArtStyleId, ArtStep, GeneratedArt } from "./types"
import { PrivacyLevel } from "@sip-protocol/types"

export const ART_STYLES: ArtStyle[] = [
  {
    id: "cipher_bloom",
    name: "Cipher Bloom",
    description: "Fractal patterns from stealth address entropy",
    emoji: "\u{1F338}",
    defaultPalette: ["#f43f5e", "#e11d48", "#be123c", "#881337", "#4c0519"],
  },
  {
    id: "stealth_grid",
    name: "Stealth Grid",
    description: "Geometric precision from commitment values",
    emoji: "\u{1F4D0}",
    defaultPalette: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#3b0764"],
  },
  {
    id: "commitment_flow",
    name: "Commitment Flow",
    description: "Particle fields from viewing key hash",
    emoji: "\u{1F30A}",
    defaultPalette: ["#06b6d4", "#0891b2", "#0e7490", "#155e75", "#083344"],
  },
]

function deterministicSeed(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(16).padStart(64, "a")
}

const now = Date.now()
const DAY = 86400_000

export const SAMPLE_GALLERY: GeneratedArt[] = [
  {
    id: "art-bloom-1",
    parameters: {
      styleId: "cipher_bloom",
      palette: ["#f43f5e", "#e11d48", "#be123c", "#881337", "#4c0519"],
      shapes: { count: 12, types: ["circle", "path"] },
      transforms: { rotation: 45, scale: 1.2, opacity: 0.85 },
      seed: deterministicSeed("bloom-aurora"),
    },
    svgData: "",
    seed: deterministicSeed("bloom-aurora"),
    stealthAddress: `sip:solana:0x${deterministicSeed("bloom-aurora")}`,
    metaAddress: `st:sol:0x${deterministicSeed("bloom-aurora-meta")}`,
    privacyLevel: PrivacyLevel.SHIELDED,
    createdAt: now - 7 * DAY,
  },
  {
    id: "art-grid-1",
    parameters: {
      styleId: "stealth_grid",
      palette: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#3b0764"],
      shapes: { count: 16, types: ["rect"] },
      transforms: { rotation: 30, scale: 1.0, opacity: 0.9 },
      seed: deterministicSeed("grid-cipher"),
    },
    svgData: "",
    seed: deterministicSeed("grid-cipher"),
    stealthAddress: `sip:solana:0x${deterministicSeed("grid-cipher")}`,
    metaAddress: `st:sol:0x${deterministicSeed("grid-cipher-meta")}`,
    privacyLevel: PrivacyLevel.COMPLIANT,
    createdAt: now - 5 * DAY,
  },
  {
    id: "art-flow-1",
    parameters: {
      styleId: "commitment_flow",
      palette: ["#06b6d4", "#0891b2", "#0e7490", "#155e75", "#083344"],
      shapes: { count: 20, types: ["path", "circle"] },
      transforms: { rotation: 0, scale: 1.1, opacity: 0.75 },
      seed: deterministicSeed("flow-wave"),
    },
    svgData: "",
    seed: deterministicSeed("flow-wave"),
    stealthAddress: `sip:solana:0x${deterministicSeed("flow-wave")}`,
    metaAddress: `st:sol:0x${deterministicSeed("flow-wave-meta")}`,
    privacyLevel: PrivacyLevel.SHIELDED,
    createdAt: now - 3 * DAY,
  },
  {
    id: "art-bloom-2",
    parameters: {
      styleId: "cipher_bloom",
      palette: ["#fb7185", "#f43f5e", "#e11d48", "#be123c", "#9f1239"],
      shapes: { count: 8, types: ["circle", "path"] },
      transforms: { rotation: 120, scale: 0.9, opacity: 0.8 },
      seed: deterministicSeed("bloom-nebula"),
    },
    svgData: "",
    seed: deterministicSeed("bloom-nebula"),
    stealthAddress: `sip:solana:0x${deterministicSeed("bloom-nebula")}`,
    metaAddress: `st:sol:0x${deterministicSeed("bloom-nebula-meta")}`,
    privacyLevel: PrivacyLevel.TRANSPARENT,
    createdAt: now - 1 * DAY,
  },
  {
    id: "art-grid-2",
    parameters: {
      styleId: "stealth_grid",
      palette: ["#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#4c1d95"],
      shapes: { count: 24, types: ["rect", "circle"] },
      transforms: { rotation: 60, scale: 1.3, opacity: 0.95 },
      seed: deterministicSeed("grid-matrix"),
    },
    svgData: "",
    seed: deterministicSeed("grid-matrix"),
    stealthAddress: `sip:solana:0x${deterministicSeed("grid-matrix")}`,
    metaAddress: `st:sol:0x${deterministicSeed("grid-matrix-meta")}`,
    privacyLevel: PrivacyLevel.SHIELDED,
    createdAt: now - 6 * 3600_000,
  },
]

export const SIMULATION_DELAYS: Record<ArtStep, number> = {
  selecting_style: 400,
  generating: 1200,
  generated: 0,
  preparing_nft: 600,
  minting: 1500,
  minted: 0,
  failed: 0,
}

export const MAX_ART_HISTORY = 50

export function getArtStyle(id: ArtStyleId): ArtStyle | undefined {
  return ART_STYLES.find((s) => s.id === id)
}

export function getDefaultPalette(id: ArtStyleId): string[] {
  return getArtStyle(id)?.defaultPalette ?? ART_STYLES[0].defaultPalette
}

export function getSampleGallery(): GeneratedArt[] {
  return SAMPLE_GALLERY
}
