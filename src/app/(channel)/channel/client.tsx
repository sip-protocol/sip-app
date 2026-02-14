"use client"

import { useState, useCallback } from "react"
import { ChannelStats } from "@/components/channel/channel-stats"
import { DropList } from "@/components/channel/drop-list"
import { SubscribeForm } from "@/components/channel/subscribe-form"
import type { Drop } from "@/lib/channel/types"

type View = "feed" | "subscribe"

export function ChannelPageClient() {
  const [view, setView] = useState<View>("feed")
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null)

  const handleSubscribe = useCallback((drop: Drop) => {
    setSelectedDrop(drop)
    setView("subscribe")
  }, [])

  const handleBack = useCallback(() => {
    setView("feed")
    setSelectedDrop(null)
  }, [])

  // Subscribe view
  if (view === "subscribe" && selectedDrop) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to drops
        </button>
        <SubscribeForm drop={selectedDrop} onSubscribed={handleBack} />
      </div>
    )
  }

  // Feed view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Channel</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Encrypted content distribution powered by DRiP. Subscribe with your
          viewing key to access privacy education content and exclusive drops.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <ChannelStats />
      </div>

      {/* Drop List */}
      <DropList onSubscribe={handleSubscribe} />

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-purple-900/20 border border-purple-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\u{1F4E1}"}</span>
          <div>
            <p className="font-medium text-purple-100">
              Powered by DRiP Protocol
            </p>
            <p className="text-sm text-purple-300 mt-1">
              Content is encrypted with viewing key-gated access. Free,
              subscriber, and premium tiers. Drops are distributed as compressed
              NFTs — privacy education delivered directly to your wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
