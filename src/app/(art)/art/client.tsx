"use client"

import { useState, useCallback } from "react"
import { ArtStats } from "@/components/art/art-stats"
import { GalleryList } from "@/components/art/gallery-list"
import { GenerateArtForm } from "@/components/art/generate-art-form"
import { MintNFTForm } from "@/components/art/mint-nft-form"
import { useArtGalleryStore } from "@/stores/art-gallery"

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

  const handleMint = useCallback(
    (artId: string) => {
      setSelectedArtId(artId)
      setView("mint")
    },
    [],
  )

  const handleSelectArt = useCallback(
    (artId: string) => {
      setSelectedArtId(artId)
      setView("mint")
    },
    [],
  )

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
