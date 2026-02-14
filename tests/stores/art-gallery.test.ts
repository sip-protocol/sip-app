import { describe, it, expect, beforeEach } from "vitest"
import { useArtGalleryStore } from "@/stores/art-gallery"
import { PrivacyLevel } from "@sip-protocol/types"
import type { ArtActionRecord, GeneratedArt, ArtNFT } from "@/lib/art/types"

function makeMockAction(overrides?: Partial<ArtActionRecord>): ArtActionRecord {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "generate",
    status: "generated",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

function makeMockArt(overrides?: Partial<GeneratedArt>): GeneratedArt {
  return {
    id: `ga_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    parameters: {
      styleId: "cipher_bloom",
      palette: ["#f43f5e"],
      shapes: { count: 10, types: ["circle"] },
      transforms: { rotation: 0, scale: 1, opacity: 1 },
      seed: "aabb",
    },
    svgData: "<svg></svg>",
    seed: "aabb",
    stealthAddress: "sip:solana:0x" + "aa".repeat(32),
    metaAddress: "st:sol:0x" + "bb".repeat(32),
    privacyLevel: PrivacyLevel.SHIELDED,
    createdAt: Date.now(),
    ...overrides,
  }
}

function makeMockNFT(overrides?: Partial<ArtNFT>): ArtNFT {
  return {
    id: `nft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    generatedArtId: "ga_123",
    name: "Test Art",
    symbol: "SIPART",
    mintAddress: "SIPnft123",
    metadataUri: "https://arweave.net/test",
    mintedAt: Date.now(),
    ...overrides,
  }
}

describe("useArtGalleryStore", () => {
  beforeEach(() => {
    useArtGalleryStore.setState({ actions: [], generatedArts: [], mintedNFTs: [] })
  })

  it("has empty initial state", () => {
    const state = useArtGalleryStore.getState()
    expect(state.actions).toEqual([])
    expect(state.generatedArts).toEqual([])
    expect(state.mintedNFTs).toEqual([])
  })

  it("adds an action", () => {
    const action = makeMockAction({ id: "test-1" })
    useArtGalleryStore.getState().addAction(action)

    const state = useArtGalleryStore.getState()
    expect(state.actions).toHaveLength(1)
    expect(state.actions[0].id).toBe("test-1")
  })

  it("prepends new actions (newest first)", () => {
    const store = useArtGalleryStore.getState()
    store.addAction(makeMockAction({ id: "first" }))
    store.addAction(makeMockAction({ id: "second" }))

    const state = useArtGalleryStore.getState()
    expect(state.actions[0].id).toBe("second")
    expect(state.actions[1].id).toBe("first")
  })

  it("caps at MAX_ART_HISTORY (50)", () => {
    const store = useArtGalleryStore.getState()
    for (let i = 0; i < 55; i++) {
      store.addAction(makeMockAction({ id: `a-${i}` }))
    }
    expect(useArtGalleryStore.getState().actions).toHaveLength(50)
  })

  it("updates an action", () => {
    useArtGalleryStore.getState().addAction(makeMockAction({ id: "update-me", status: "selecting_style" }))
    useArtGalleryStore.getState().updateAction("update-me", { status: "generated", completedAt: Date.now() })

    const updated = useArtGalleryStore.getState().getAction("update-me")
    expect(updated?.status).toBe("generated")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getAction returns undefined for missing id", () => {
    expect(useArtGalleryStore.getState().getAction("nonexistent")).toBeUndefined()
  })

  it("getActionsByType filters correctly", () => {
    const store = useArtGalleryStore.getState()
    store.addAction(makeMockAction({ id: "a1", type: "generate" }))
    store.addAction(makeMockAction({ id: "a2", type: "mint" }))
    store.addAction(makeMockAction({ id: "a3", type: "generate" }))

    const generates = useArtGalleryStore.getState().getActionsByType("generate")
    expect(generates).toHaveLength(2)
    expect(generates.every((a) => a.type === "generate")).toBe(true)
  })

  it("adds a generated art", () => {
    useArtGalleryStore.getState().addGeneratedArt(makeMockArt({ id: "art-1" }))

    const arts = useArtGalleryStore.getState().getGeneratedArts()
    expect(arts).toHaveLength(1)
    expect(arts[0].id).toBe("art-1")
  })

  it("getGeneratedArt finds by id", () => {
    useArtGalleryStore.getState().addGeneratedArt(makeMockArt({ id: "art-find" }))
    expect(useArtGalleryStore.getState().getGeneratedArt("art-find")?.id).toBe("art-find")
  })

  it("adds a minted NFT", () => {
    useArtGalleryStore.getState().addMintedNFT(makeMockNFT({ id: "nft-1" }))

    const nfts = useArtGalleryStore.getState().getMintedNFTs()
    expect(nfts).toHaveLength(1)
    expect(nfts[0].id).toBe("nft-1")
  })

  it("clears all history", () => {
    const store = useArtGalleryStore.getState()
    store.addAction(makeMockAction())
    store.addGeneratedArt(makeMockArt())
    store.addMintedNFT(makeMockNFT())

    expect(useArtGalleryStore.getState().actions).toHaveLength(1)
    expect(useArtGalleryStore.getState().generatedArts).toHaveLength(1)
    expect(useArtGalleryStore.getState().mintedNFTs).toHaveLength(1)

    useArtGalleryStore.getState().clearHistory()
    expect(useArtGalleryStore.getState().actions).toEqual([])
    expect(useArtGalleryStore.getState().generatedArts).toEqual([])
    expect(useArtGalleryStore.getState().mintedNFTs).toEqual([])
  })
})
