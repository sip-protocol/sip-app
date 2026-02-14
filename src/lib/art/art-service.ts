import type {
  ArtActionRecord,
  ArtStepChangeCallback,
  ArtMode,
  GenerateArtParams,
  MintArtParams,
  GeneratedArt,
  ArtNFT,
} from "./types"
import { SIMULATION_DELAYS } from "./constants"
import {
  generateArtStealthAddress,
  generateArtSeed,
  deriveArtParameters,
} from "./stealth-art"
import { renderArt } from "./art-engine"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface ArtServiceOptions {
  mode?: ArtMode
  onStepChange?: ArtStepChangeCallback
}

export class ArtService {
  private mode: ArtMode
  private onStepChange?: ArtStepChangeCallback

  constructor(options: ArtServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
  }

  validate(
    type: "generate" | "mint",
    params: GenerateArtParams | MintArtParams
  ): string | null {
    switch (type) {
      case "generate": {
        const p = params as GenerateArtParams
        if (!p.styleId) {
          return "Art style is required"
        }
        const validStyles = ["cipher_bloom", "stealth_grid", "commitment_flow"]
        if (!validStyles.includes(p.styleId)) {
          return "Invalid art style"
        }
        return null
      }
      case "mint": {
        const p = params as MintArtParams
        if (!p.generatedArtId) {
          return "Generated art ID is required"
        }
        if (!p.name || p.name.trim().length === 0) {
          return "NFT name is required"
        }
        if (p.name.length > 32) {
          return "NFT name must be 32 characters or less"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Generate deterministic art from a stealth address seed.
   * selecting_style (UI) -> generating (real SDK stealth + render) -> generated
   */
  async generateArt(
    params: GenerateArtParams
  ): Promise<{ record: ArtActionRecord; art: GeneratedArt }> {
    const validationError = this.validate("generate", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const record: ArtActionRecord = {
      id: generateId("art"),
      type: "generate",
      status: "selecting_style",
      privacyLevel: params.privacyLevel,
      styleId: params.styleId,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Selecting style
      record.status = "selecting_style"
      record.stepTimestamps.selecting_style = Date.now()
      this.onStepChange?.("selecting_style", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.selecting_style)
        )
      }

      // Step 2: Generate art (real SDK stealth + seed + render)
      record.status = "generating"
      record.stepTimestamps.generating = Date.now()
      this.onStepChange?.("generating", { ...record })

      const stealth = await generateArtStealthAddress()
      const seed = generateArtSeed(stealth.stealthAddress)
      const artParams = deriveArtParameters(seed, params.styleId)
      const svgData = renderArt(artParams)

      record.stealthAddress = stealth.stealthAddress
      record.metaAddress = stealth.metaAddress
      record.seed = seed
      record.svgData = svgData

      const artId = generateId("ga")
      record.generatedArtId = artId

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.generating))
      }

      // Step 3: Generated
      record.status = "generated"
      record.completedAt = Date.now()
      record.stepTimestamps.generated = Date.now()
      this.onStepChange?.("generated", { ...record })

      const art: GeneratedArt = {
        id: artId,
        parameters: artParams,
        svgData,
        seed,
        stealthAddress: stealth.stealthAddress,
        metaAddress: stealth.metaAddress,
        privacyLevel: params.privacyLevel,
        createdAt: Date.now(),
      }

      return { record, art }
    } catch (error) {
      record.status = "failed"
      record.error =
        error instanceof Error ? error.message : "Art generation failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Mint generated art as a compressed NFT (simulated).
   * preparing_nft -> minting -> minted
   */
  async mintNFT(
    params: MintArtParams
  ): Promise<{ record: ArtActionRecord; nft: ArtNFT }> {
    const validationError = this.validate("mint", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const record: ArtActionRecord = {
      id: generateId("mint"),
      type: "mint",
      status: "preparing_nft",
      privacyLevel: params.privacyLevel,
      generatedArtId: params.generatedArtId,
      nftName: params.name,
      nftDescription: params.description,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Prepare NFT metadata
      record.status = "preparing_nft"
      record.stepTimestamps.preparing_nft = Date.now()
      this.onStepChange?.("preparing_nft", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.preparing_nft))
      }

      // Step 2: Mint (simulated in demo mode)
      record.status = "minting"
      record.stepTimestamps.minting = Date.now()
      this.onStepChange?.("minting", { ...record })

      const mintAddress = `SIP${generateId("nft").replace(/_/g, "").slice(0, 40)}`
      const metadataUri = `https://arweave.net/${generateId("meta").replace(/_/g, "")}`

      record.mintAddress = mintAddress
      record.metadataUri = metadataUri

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.minting))
      }

      // Step 3: Minted
      record.status = "minted"
      record.completedAt = Date.now()
      record.stepTimestamps.minted = Date.now()
      this.onStepChange?.("minted", { ...record })

      const nft: ArtNFT = {
        id: generateId("nft"),
        generatedArtId: params.generatedArtId,
        name: params.name,
        symbol: "SIPART",
        mintAddress,
        metadataUri,
        mintedAt: Date.now(),
      }

      return { record, nft }
    } catch (error) {
      record.status = "failed"
      record.error =
        error instanceof Error ? error.message : "NFT minting failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
