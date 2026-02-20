import type {
  ArtActionRecord,
  ArtStepChangeCallback,
  ArtMode,
  ArtStyleId,
  GenerateArtParams,
  MintArtParams,
  GeneratedArt,
  ArtNFT,
} from "./types"
import { SIMULATION_DELAYS, SAMPLE_GALLERY } from "./constants"
import {
  generateArtStealthAddress,
  generateArtSeed,
  deriveArtParameters,
} from "./stealth-art"
import { renderArt } from "./art-engine"
import { encryptForViewingKey } from "@/lib/crypto-helpers"
import { PrivacyLevel } from "@sip-protocol/types"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ---------------------------------------------------------------------------
// Cache — 5-minute TTL
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ---------------------------------------------------------------------------
// Helius DAS — fetch real Exchange Art NFTs from Solana mainnet
// ---------------------------------------------------------------------------

// Exchange Art verified creator on Solana mainnet
const EXCHANGE_ART_CREATOR = "ExArtbg8aQgFzGscXUxmFGNH8TJwzmFEJSRCF7MRcAJb"

// Known Exchange Art collection addresses
const EXCHANGE_ART_COLLECTIONS = [
  "2kBVsM8cYuXpcn6DreWBxicjYWLGjkBKqFgu4XP8jxPe", // Exchange Art Featured
  "4JYNsJ7vBGkVmPM3P8NqW87hGhEPMXP4vq91MbYVCr3a", // Exchange Art Curated
]

function getHeliusUrl(): string | null {
  const key =
    (typeof process !== "undefined" &&
      (process.env?.NEXT_PUBLIC_HELIUS_API_KEY ||
        process.env?.HELIUS_API_KEY)) ||
    null
  if (!key) return null
  return `https://mainnet.helius-rpc.com/?api-key=${key}`
}

// Helius DAS asset shape (subset we use)
interface HeliusAsset {
  id: string
  content?: {
    metadata?: {
      name?: string
      description?: string
      symbol?: string
      attributes?: { trait_type?: string; value?: string }[]
    }
    links?: {
      image?: string
      external_url?: string
    }
    json_uri?: string
  }
  creators?: { address: string; verified: boolean }[]
  grouping?: { group_key: string; group_value: string }[]
  ownership?: { owner: string }
}

interface HeliusDASResponse {
  result?: {
    items?: HeliusAsset[]
    total?: number
  }
  error?: { message: string }
}

// Deterministic seed from string
function deterministicSeed(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(16).padStart(64, "a")
}

// Map a Helius asset to our GeneratedArt interface
function mapAssetToGeneratedArt(asset: HeliusAsset): GeneratedArt {
  const meta = asset.content?.metadata
  const name = meta?.name ?? "Exchange Art NFT"
  const seed = deterministicSeed(asset.id)

  // Derive a style from the asset hash
  const styleIndex = parseInt(seed.slice(0, 2), 16) % 3
  const styles: ArtStyleId[] = [
    "cipher_bloom",
    "stealth_grid",
    "commitment_flow",
  ]
  const styleId = styles[styleIndex]

  const palettes: Record<ArtStyleId, string[]> = {
    cipher_bloom: ["#f43f5e", "#e11d48", "#be123c", "#881337", "#4c0519"],
    stealth_grid: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#3b0764"],
    commitment_flow: ["#06b6d4", "#0891b2", "#0e7490", "#155e75", "#083344"],
  }

  const byte = (index: number) => {
    const hex = seed.slice(
      (index * 2) % seed.length,
      (index * 2 + 2) % seed.length
    )
    return parseInt(hex, 16) || (index * 37) % 256
  }

  return {
    id: asset.id,
    parameters: {
      styleId,
      palette: palettes[styleId],
      shapes: {
        count: 8 + (byte(10) % 20),
        types: ["circle", "path"],
      },
      transforms: {
        rotation: byte(14) % 360,
        scale: 0.5 + (byte(15) / 255) * 1.0,
        opacity: 0.3 + (byte(16) / 255) * 0.7,
      },
      seed,
    },
    svgData: "", // Will be rendered on-demand by the UI
    seed,
    stealthAddress: `sip:solana:0x${seed}`,
    metaAddress: `st:sol:0x${deterministicSeed(asset.id + "-meta")}`,
    privacyLevel:
      styleIndex === 0
        ? PrivacyLevel.SHIELDED
        : styleIndex === 1
          ? PrivacyLevel.COMPLIANT
          : PrivacyLevel.TRANSPARENT,
    createdAt: Date.now() - byte(0) * 3600_000,
  }
}

// Fetch Exchange Art NFTs via Helius DAS
async function fetchExchangeArtNFTs(): Promise<GeneratedArt[] | null> {
  const heliusUrl = getHeliusUrl()
  if (!heliusUrl) return null

  // Try by creator first
  try {
    const response = await fetch(heliusUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "exchange-art",
        method: "getAssetsByCreator",
        params: {
          creatorAddress: EXCHANGE_ART_CREATOR,
          onlyVerified: true,
          page: 1,
          limit: 10,
          sortBy: { sortBy: "created", sortDirection: "desc" },
        },
      }),
    })

    if (response.ok) {
      const data: HeliusDASResponse = await response.json()
      const items = data.result?.items
      if (items && items.length > 0) {
        return items.map(mapAssetToGeneratedArt)
      }
    }
  } catch {
    // Fall through to collection-based fetch
  }

  // Fallback: try known Exchange Art collections
  for (const collectionAddr of EXCHANGE_ART_COLLECTIONS) {
    try {
      const response = await fetch(heliusUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "exchange-art-collection",
          method: "getAssetsByGroup",
          params: {
            groupKey: "collection",
            groupValue: collectionAddr,
            page: 1,
            limit: 10,
            sortBy: { sortBy: "created", sortDirection: "desc" },
          },
        }),
      })

      if (!response.ok) continue

      const data: HeliusDASResponse = await response.json()
      const items = data.result?.items
      if (items && items.length > 0) {
        return items.map(mapAssetToGeneratedArt)
      }
    } catch {
      continue
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// ArtService
// ---------------------------------------------------------------------------

export interface ArtServiceOptions {
  mode?: ArtMode
  onStepChange?: ArtStepChangeCallback
  onCommitTransaction?: (id: string, data: string) => Promise<string | null>
}

export class ArtService {
  private mode: ArtMode
  private onStepChange?: ArtStepChangeCallback
  private onCommitTransaction?: (
    id: string,
    data: string
  ) => Promise<string | null>

  constructor(options: ArtServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
    this.onCommitTransaction = options.onCommitTransaction
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
   * Fetch gallery of art NFTs. In metaplex mode, fetches real Exchange Art
   * NFTs via Helius DAS and maps them to GeneratedArt. Falls back to
   * SAMPLE_GALLERY on error.
   */
  async getGallery(): Promise<GeneratedArt[]> {
    if (this.mode !== "metaplex") {
      return SAMPLE_GALLERY
    }

    const cacheKey = "art:gallery"
    const cached = getCached<GeneratedArt[]>(cacheKey)
    if (cached) return cached

    try {
      const nfts = await fetchExchangeArtNFTs()
      if (nfts && nfts.length > 0) {
        setCache(cacheKey, nfts)
        return nfts
      }
      console.warn(
        "[SIP] Exchange Art fetch returned no results, using sample gallery"
      )
      return SAMPLE_GALLERY
    } catch (err) {
      console.warn(
        "[SIP] Exchange Art live fetch failed, using sample gallery:",
        err instanceof Error ? err.message : err
      )
      return SAMPLE_GALLERY
    }
  }

  /**
   * Fetch a single art NFT by ID. In metaplex mode, tries Helius getAsset.
   */
  async getArtById(id: string): Promise<GeneratedArt | undefined> {
    if (this.mode !== "metaplex") {
      return SAMPLE_GALLERY.find((a) => a.id === id)
    }

    const singleKey = `art:single:${id}`
    const cached = getCached<GeneratedArt>(singleKey)
    if (cached) return cached

    // Check gallery cache
    const galleryCached = getCached<GeneratedArt[]>("art:gallery")
    if (galleryCached) {
      const found = galleryCached.find((a) => a.id === id)
      if (found) {
        setCache(singleKey, found)
        return found
      }
    }

    // Try direct Helius DAS getAsset if id looks like a Solana address
    const heliusUrl = getHeliusUrl()
    if (heliusUrl && id.length >= 32) {
      try {
        const response = await fetch(heliusUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "art-single",
            method: "getAsset",
            params: { id },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.result) {
            const art = mapAssetToGeneratedArt(data.result)
            setCache(singleKey, art)
            return art
          }
        }
      } catch (err) {
        console.warn(
          "[SIP] Exchange Art single asset fetch failed:",
          err instanceof Error ? err.message : err
        )
      }
    }

    return SAMPLE_GALLERY.find((a) => a.id === id)
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

      // Phase 1B: Viewing key for compliant mode
      if (params.privacyLevel === "compliant") {
        const vk = await encryptForViewingKey({
          styleId: params.styleId,
          stealthAddress: stealth.stealthAddress,
          timestamp: Date.now(),
        })
        record.viewingKeyHash = vk.viewingKeyHash
        record.encryptedForAuditor = vk.ciphertext
      }

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.generating))
      }

      // On-chain commitment (optional)
      if (this.onCommitTransaction) {
        const signature = await this.onCommitTransaction(
          record.id,
          `${record.id}:${params.styleId}`
        )
        if (signature) {
          record.txSignature = signature
        }
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

      // Phase 1B: Viewing key for compliant mode
      if (params.privacyLevel === "compliant") {
        const vk = await encryptForViewingKey({
          generatedArtId: params.generatedArtId,
          nftName: params.name,
          timestamp: Date.now(),
        })
        record.viewingKeyHash = vk.viewingKeyHash
        record.encryptedForAuditor = vk.ciphertext
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
