"use client"

import { useState, useCallback } from "react"
import { Broadcast } from "@phosphor-icons/react"
import { ChannelStats } from "@/components/channel/channel-stats"
import { DropList } from "@/components/channel/drop-list"
import { SubscribeForm } from "@/components/channel/subscribe-form"
import type { Drop } from "@/lib/channel/types"
import { DeathRevivalCard } from "@/components/shared/death-revival-card"

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
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy NFTs</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Encrypted content distribution powered by DRiP. Subscribe with your
          viewing key to access privacy education content and exclusive drops.
        </p>
      </div>

      {/* DRiP Channel Card */}
      <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-300">
            <Broadcast size={32} weight="duotone" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-violet-100">
              SIP Privacy Channel on DRiP
            </h3>
            <p className="text-sm text-violet-300/80 mt-1">
              Free compressed NFT drops about on-chain privacy. Stealth
              addresses, Pedersen commitments, viewing keys — education content
              delivered directly to your wallet.
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-violet-400">
              <span>5 drops published</span>
              <span aria-hidden="true">&middot;</span>
              <span>3 tiers: Free / Subscriber / Premium</span>
              <span aria-hidden="true">&middot;</span>
              <span>Encrypted content with viewing key access</span>
            </div>
          </div>
          <a
            href="https://drip.haus/sip-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-xl bg-violet-500 text-white hover:bg-violet-400 transition-colors"
          >
            View on DRiP
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <ChannelStats />
      </div>

      {/* Drop List */}
      <DropList onSubscribe={handleSubscribe} />

      {/* Death/Revival Card */}
      <div className="mt-10">
        <DeathRevivalCard
          category="NFT Drops"
          whyItDied="Public subscriber lists became spam targets. Drop participation revealed financial activity. Creators lost audiences."
          howWeRevive="Encrypted NFT drops with stealth delivery. Subscribe and receive content without exposing your identity."
          sponsor="DRiP"
          sponsorRole="Mass NFT distribution platform for creators"
          gradient="from-violet-500 to-violet-700"
        />
      </div>

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-purple-900/20 border border-purple-800">
        <div className="flex gap-3">
          <span className="text-purple-400">
            <Broadcast size={24} weight="duotone" />
          </span>
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
