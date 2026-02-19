"use client"

import { useState, useCallback } from "react"
import { ArtStats } from "@/components/art/art-stats"
import { GalleryList } from "@/components/art/gallery-list"
import { GenerateArtForm } from "@/components/art/generate-art-form"
import { MintNFTForm } from "@/components/art/mint-nft-form"
import { useArtGalleryStore } from "@/stores/art-gallery"
import { DeathRevivalCard } from "@/components/shared/death-revival-card"

type View = "dashboard" | "generate" | "mint"

export function ArtPageClient() {
  const [view, setView] = useState<View>("dashboard")
  const [selectedArtId, setSelectedArtId] = useState<string | null>(null)
  const { getGeneratedArt } = useArtGalleryStore()

  const handleBack = useCallback(() => {
    setView("dashboard")
    setSelectedArtId(null)
  }, [])

  const handleGenerate = useCallback(() => {
    setView("generate")
  }, [])

  const handleMint = useCallback((artId: string) => {
    setSelectedArtId(artId)
    setView("mint")
  }, [])

  const handleSelectArt = useCallback((artId: string) => {
    setSelectedArtId(artId)
    setView("mint")
  }, [])

  // Generate view
  if (view === "generate") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to gallery
        </button>
        <GenerateArtForm onMintRequest={handleMint} />
      </div>
    )
  }

  // Mint view
  if (view === "mint" && selectedArtId) {
    const art = getGeneratedArt(selectedArtId)
    if (art) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
          >
            &larr; Back to gallery
          </button>
          <MintNFTForm art={art} onMinted={handleBack} onReset={handleBack} />
        </div>
      )
    }
  }

  // Dashboard view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Art</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Every privacy transaction creates unique generative art. Three styles
          — Cipher Bloom, Stealth Grid, Commitment Flow — each derived from
          stealth address entropy.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <ArtStats />
      </div>

      {/* Exchange Art Card */}
      <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-rose-600/20 to-orange-600/20 border border-rose-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-rose-500/20 flex items-center justify-center text-3xl">
            {"\u{1F3A8}"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-rose-100">
              Mint on Exchange Art
            </h3>
            <p className="text-sm text-rose-300/80 mt-1">
              Generate stealth art from privacy transaction entropy, then mint
              as compressed NFTs on Solana. Each piece is deterministic — same
              inputs, same art.
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-rose-400">
              <span>3 art styles</span>
              <span>{"\u{2022}"}</span>
              <span>Compressed NFTs via Bubblegum</span>
              <span>{"\u{2022}"}</span>
              <span>~$0.001 per mint</span>
            </div>
          </div>
          <a
            href="https://exchange.art"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-xl bg-rose-500 text-white hover:bg-rose-400 transition-colors"
          >
            Exchange Art
          </a>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          type="button"
          onClick={handleGenerate}
          className="px-6 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 text-white hover:from-rose-400 hover:to-rose-600 transition-colors"
        >
          Generate Art
        </button>
      </div>

      {/* Gallery */}
      <GalleryList onSelectArt={handleSelectArt} onMintArt={handleMint} />

      {/* Death/Revival Card */}
      <div className="mt-10">
        <DeathRevivalCard
          category="Digital Art"
          whyItDied="Public minting exposed collector identities and bidding strategies. Snipers front-ran drops. Creators lost control."
          howWeRevive="Stealth NFT minting hides collector identity. Pedersen commitments conceal bid amounts until reveal."
          sponsor="Exchange Art"
          sponsorRole="Premier Solana art marketplace for curated digital art"
          gradient="from-rose-500 to-rose-700"
        />
      </div>

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-rose-900/20 border border-rose-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\u{1F3A8}"}</span>
          <div>
            <p className="font-medium text-rose-100">
              Deterministic Generative Art
            </p>
            <p className="text-sm text-rose-300 mt-1">
              Art parameters are derived from stealth address entropy — same
              inputs always produce the same art. Mint as compressed NFTs for
              ~$0.001 each via Exchange Art.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
