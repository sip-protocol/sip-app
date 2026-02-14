"use client"

import { useState, useCallback, useMemo } from "react"
import { useArtGalleryStore } from "@/stores/art-gallery"
import type { GeneratedArt, ArtNFT } from "@/lib/art/types"

export type ArtGalleryFilter = "all" | "generated" | "minted"

export interface UseArtGalleryReturn {
  arts: GeneratedArt[]
  mintedNFTs: ArtNFT[]
  isLoading: boolean
  filter: ArtGalleryFilter
  setFilter: (filter: ArtGalleryFilter) => void
}

export function useArtGallery(): UseArtGalleryReturn {
  const { generatedArts, mintedNFTs: allMintedNFTs } = useArtGalleryStore()
  const [filter, setFilter] = useState<ArtGalleryFilter>("all")

  const mintedArtIds = useMemo(
    () => new Set(allMintedNFTs.map((n) => n.generatedArtId)),
    [allMintedNFTs]
  )

  const arts = useMemo(() => {
    if (filter === "all") return generatedArts
    if (filter === "minted")
      return generatedArts.filter((a) => mintedArtIds.has(a.id))
    return generatedArts.filter((a) => !mintedArtIds.has(a.id))
  }, [generatedArts, filter, mintedArtIds])

  const handleSetFilter = useCallback((f: ArtGalleryFilter) => {
    setFilter(f)
  }, [])

  return {
    arts,
    mintedNFTs: allMintedNFTs,
    isLoading: false,
    filter,
    setFilter: handleSetFilter,
  }
}
