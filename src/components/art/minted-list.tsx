"use client"

import { useArtGalleryStore } from "@/stores/art-gallery"
import { MintedNFTCard } from "./minted-nft-card"

interface MintedListProps {
  className?: string
}

export function MintedList({ className }: MintedListProps) {
  const { mintedNFTs, generatedArts } = useArtGalleryStore()

  const artMap = new Map(generatedArts.map((a) => [a.id, a]))

  return (
    <div className={className}>
      {/* Stats header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">
          Minted NFTs
        </h3>
        <span className="text-xs text-[var(--text-tertiary)]">
          {mintedNFTs.length} total
        </span>
      </div>

      {mintedNFTs.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-8 text-center">
          <span className="text-3xl block mb-2">{"\u{1F48E}"}</span>
          <p className="text-sm text-[var(--text-secondary)]">
            No NFTs minted yet. Generate art and mint it as a compressed NFT.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {mintedNFTs.map((nft) => (
            <MintedNFTCard
              key={nft.id}
              nft={nft}
              art={artMap.get(nft.generatedArtId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
