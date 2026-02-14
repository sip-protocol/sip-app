"use client"

import { useArtGalleryStore } from "@/stores/art-gallery"

export function ArtStats() {
  const { generatedArts, mintedNFTs } = useArtGalleryStore()

  const generated = generatedArts.length
  const minted = mintedNFTs.length
  const stylesUsed = new Set(generatedArts.map((a) => a.parameters.styleId)).size
  const latestStyle = generatedArts[0]?.parameters.styleId ?? "—"

  const styleLabel: Record<string, string> = {
    cipher_bloom: "Cipher Bloom",
    stealth_grid: "Stealth Grid",
    commitment_flow: "Commitment Flow",
  }

  const stats = [
    { label: "Arts Generated", value: generated.toString() },
    { label: "NFTs Minted", value: minted.toString() },
    { label: "Styles Used", value: stylesUsed.toString() },
    { label: "Latest Style", value: styleLabel[latestStyle] ?? latestStyle },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
