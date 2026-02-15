"use client"

import { useState, useCallback } from "react"
import { MetaverseStats } from "@/components/metaverse/metaverse-stats"
import { WorldList } from "@/components/metaverse/world-list"
import { ExploreForm } from "@/components/metaverse/explore-form"
import type { World } from "@/lib/metaverse/types"

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

      {/* Stats */}
      <div className="mb-10">
        <MetaverseStats />
      </div>

      {/* World List */}
      <WorldList onExplore={handleExplore} />

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
