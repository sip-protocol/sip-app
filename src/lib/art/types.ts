import type { PrivacyLevel } from "@sip-protocol/types"

export type GenerateStep =
  | "selecting_style"
  | "generating"
  | "generated"
  | "failed"

export type MintStep = "preparing_nft" | "minting" | "minted" | "failed"

export type ArtStep = GenerateStep | MintStep

export type ArtStyleId = "cipher_bloom" | "stealth_grid" | "commitment_flow"

export interface ArtStyle {
  id: ArtStyleId
  name: string
  description: string
  emoji: string
  defaultPalette: string[]
}

export interface ArtParameters {
  styleId: ArtStyleId
  palette: string[]
  shapes: {
    count: number
    types: ("circle" | "rect" | "path")[]
  }
  transforms: {
    rotation: number
    scale: number
    opacity: number
  }
  seed: string
}

export interface GeneratedArt {
  id: string
  parameters: ArtParameters
  svgData: string
  seed: string
  stealthAddress: string
  metaAddress: string
  privacyLevel: PrivacyLevel
  createdAt: number
}

export interface ArtNFT {
  id: string
  generatedArtId: string
  name: string
  symbol: string
  mintAddress: string
  metadataUri: string
  mintedAt: number
}

export interface ArtActionRecord {
  id: string
  type: "generate" | "mint"
  status: ArtStep
  privacyLevel: PrivacyLevel
  // Generate-specific
  styleId?: ArtStyleId
  seed?: string
  svgData?: string
  stealthAddress?: string
  metaAddress?: string
  generatedArtId?: string
  // Mint-specific
  nftName?: string
  nftDescription?: string
  mintAddress?: string
  metadataUri?: string
  // Timestamps
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<ArtStep, number>>
}

export interface GenerateArtParams {
  styleId: ArtStyleId
  privacyLevel: PrivacyLevel
}

export interface MintArtParams {
  generatedArtId: string
  name: string
  description: string
  privacyLevel: PrivacyLevel
}

export type ArtStepChangeCallback = (
  step: ArtStep,
  record: ArtActionRecord
) => void

export type ArtMode = "simulation" | "metaplex"
