import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useArtGallery } from "@/hooks/use-art-gallery"
import { useArtGalleryStore } from "@/stores/art-gallery"
import { PrivacyLevel } from "@sip-protocol/types"
import type { GeneratedArt, ArtNFT } from "@/lib/art/types"

function makeMockArt(id: string): GeneratedArt {
  return {
    id,
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
  }
}

function makeMockNFT(id: string, generatedArtId: string): ArtNFT {
  return {
    id,
    generatedArtId,
    name: "Test NFT",
    symbol: "SIPART",
    mintAddress: "SIPnft123",
    metadataUri: "https://arweave.net/test",
    mintedAt: Date.now(),
  }
}

describe("useArtGallery", () => {
  beforeEach(() => {
    useArtGalleryStore.setState({
      actions: [],
      generatedArts: [],
      mintedNFTs: [],
    })
  })

  it("initializes with default filter 'all'", () => {
    const { result } = renderHook(() => useArtGallery())
    expect(result.current.filter).toBe("all")
    expect(result.current.isLoading).toBe(false)
  })

  it("returns all arts when filter is 'all'", () => {
    useArtGalleryStore.setState({
      generatedArts: [makeMockArt("art-1"), makeMockArt("art-2")],
      mintedNFTs: [makeMockNFT("nft-1", "art-1")],
    })

    const { result } = renderHook(() => useArtGallery())
    expect(result.current.arts).toHaveLength(2)
  })

  it("filters to only minted arts", () => {
    useArtGalleryStore.setState({
      generatedArts: [makeMockArt("art-1"), makeMockArt("art-2")],
      mintedNFTs: [makeMockNFT("nft-1", "art-1")],
    })

    const { result } = renderHook(() => useArtGallery())

    act(() => result.current.setFilter("minted"))
    expect(result.current.arts).toHaveLength(1)
    expect(result.current.arts[0].id).toBe("art-1")
  })

  it("filters to only unminted (generated) arts", () => {
    useArtGalleryStore.setState({
      generatedArts: [makeMockArt("art-1"), makeMockArt("art-2")],
      mintedNFTs: [makeMockNFT("nft-1", "art-1")],
    })

    const { result } = renderHook(() => useArtGallery())

    act(() => result.current.setFilter("generated"))
    expect(result.current.arts).toHaveLength(1)
    expect(result.current.arts[0].id).toBe("art-2")
  })

  it("returns minted NFTs", () => {
    useArtGalleryStore.setState({
      mintedNFTs: [makeMockNFT("nft-1", "art-1"), makeMockNFT("nft-2", "art-2")],
    })

    const { result } = renderHook(() => useArtGallery())
    expect(result.current.mintedNFTs).toHaveLength(2)
  })
})
