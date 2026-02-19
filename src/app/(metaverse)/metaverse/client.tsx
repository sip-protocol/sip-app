"use client"

import { useState, useCallback } from "react"
import { MetaverseStats } from "@/components/metaverse/metaverse-stats"
import { WorldList } from "@/components/metaverse/world-list"
import { ExploreForm } from "@/components/metaverse/explore-form"
import type { World } from "@/lib/metaverse/types"
import { DeathRevivalCard } from "@/components/shared/death-revival-card"

type View = "worlds" | "explore"

export function MetaversePageClient() {
  const [view, setView] = useState<View>("worlds")
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null)

  const handleExplore = useCallback((world: World) => {
    setSelectedWorld(world)
    setView("explore")
  }, [])

  const handleBack = useCallback(() => {
    setView("worlds")
    setSelectedWorld(null)
  }, [])

  // Explore view
  if (view === "explore" && selectedWorld) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to worlds
        </button>
        <ExploreForm world={selectedWorld} onExplored={handleBack} />
      </div>
    )
  }

  // Worlds view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Privacy Metaverse
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Stealth avatars, private teleportation, anonymous exploration —
          metaverse privacy powered by real cryptography.
        </p>
      </div>

      {/* Portals Platform Card */}
      <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center text-3xl">
            {"\u{1F30D}"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-indigo-100">
              Explore on Portals
            </h3>
            <p className="text-sm text-indigo-300/80 mt-1">
              Browser-based 3D worlds on Solana. Visit NFT galleries, social
              lounges, and trading floors — with stealth avatar identity powered
              by SIP.
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-indigo-400">
              <span>7 curated worlds</span>
              <span>{"\u{2022}"}</span>
              <span>Spatial audio</span>
              <span>{"\u{2022}"}</span>
              <span>NFT-gated rooms</span>
            </div>
          </div>
          <a
            href="https://theportal.to"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 transition-colors"
          >
            Enter Portals
          </a>
        </div>
      </div>

      {/* Portals Live Preview */}
      <div className="mb-10 rounded-2xl overflow-hidden border border-indigo-500/20">
        <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-900/30 border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-indigo-300">
              Portals Live Preview
            </span>
          </div>
          <a
            href="https://theportal.to"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Open full experience &rarr;
          </a>
        </div>
        <div className="relative bg-black/50 aspect-video max-h-[400px]">
          <iframe
            src="https://theportal.to"
            title="Portals Metaverse"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
            loading="lazy"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[var(--surface-primary)] via-transparent to-transparent opacity-40" />
        </div>
        <div className="px-4 py-3 bg-indigo-900/20 text-center">
          <p className="text-xs text-indigo-300/70">
            Explore Portals worlds with your SIP stealth avatar — your wallet
            address never appears
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <MetaverseStats />
      </div>

      {/* World List */}
      <WorldList onExplore={handleExplore} />

      {/* Death/Revival Card */}
      <div className="mt-10">
        <DeathRevivalCard
          category="Metaverse"
          whyItDied="Public wallet-linked avatars destroyed pseudonymity. Users were tracked across virtual worlds."
          howWeRevive="Stealth avatar identities — explore virtual worlds without linking your real wallet or identity."
          sponsor="Portals"
          sponsorRole="Browser-based 3D metaverse platform on Solana"
          gradient="from-indigo-500 to-indigo-700"
        />
      </div>

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-indigo-900/20 border border-indigo-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\u{1F30D}"}</span>
          <div>
            <p className="font-medium text-indigo-100">Powered by Portals</p>
            <p className="text-sm text-indigo-300 mt-1">
              Avatars use stealth addresses for unlinkable identity, Pedersen
              commitments for avatar IDs, and viewing keys for world owner
              verification. All cryptography is real — powered by
              @sip-protocol/sdk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
