"use client"

import { cn } from "@/lib/utils"
import { useArtGallery, type ArtGalleryFilter } from "@/hooks/use-art-gallery"
import { ArtCard } from "./art-card"

interface GalleryListProps {
  onSelectArt?: (artId: string) => void
  onMintArt?: (artId: string) => void
  className?: string
}

const FILTERS: { value: ArtGalleryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "generated", label: "Generated" },
  { value: "minted", label: "Minted" },
]

export function GalleryList({
  onSelectArt,
  onMintArt,
  className,
}: GalleryListProps) {
  const { arts, mintedNFTs, filter, setFilter } = useArtGallery()

  const mintedArtIds = new Set(mintedNFTs.map((n) => n.generatedArtId))

  return (
    <div className={className}>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === f.value
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Art grid */}
      {arts.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <span className="text-4xl block mb-3">{"\u{1F3A8}"}</span>
          <h3 className="text-lg font-semibold mb-2">No art yet</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Generate your first privacy art from the Create tab. Each piece is deterministically derived from stealth address entropy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {arts.map((art) => (
            <ArtCard
              key={art.id}
              art={art}
              isMinted={mintedArtIds.has(art.id)}
              onSelect={() => onSelectArt?.(art.id)}
              onMint={() => onMintArt?.(art.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
