"use client"

import { useState, useCallback } from "react"
import { MusicStats } from "@/components/music/music-stats"
import { TrackList } from "@/components/music/track-list"
import { StreamForm } from "@/components/music/stream-form"
import type { Track } from "@/lib/music/types"
import { DeathRevivalCard } from "@/components/shared/death-revival-card"

type View = "tracks" | "stream"

export function MusicPageClient() {
  const [view, setView] = useState<View>("tracks")
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

  const handleStream = useCallback((track: Track) => {
    setSelectedTrack(track)
    setView("stream")
  }, [])

  const handleBack = useCallback(() => {
    setView("tracks")
    setSelectedTrack(null)
  }, [])

  // Stream view
  if (view === "stream" && selectedTrack) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to tracks
        </button>
        <StreamForm track={selectedTrack} onStreamed={handleBack} />
      </div>
    )
  }

  // Tracks view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Music</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Private music streaming — anonymous listening, stealth royalty
          payments, encrypted playlists powered by real cryptography.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <MusicStats />
      </div>

      {/* Track List */}
      <TrackList onStream={handleStream} />

      {/* Death/Revival Card */}
      <div className="mt-10">
        <DeathRevivalCard
          category="Music Streaming"
          whyItDied="Public listening data exposed user preferences. Platforms monetized behavior. Artists lost direct connection."
          howWeRevive="Stealth listener identity — stream music privately with unlinkable stealth addresses for each session."
          sponsor="Audius"
          sponsorRole="Decentralized music streaming protocol with 8M+ monthly users"
          gradient="from-pink-500 to-pink-700"
        />
      </div>

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-pink-900/20 border border-pink-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\u{1F3B5}"}</span>
          <div>
            <p className="font-medium text-pink-100">Powered by Audius</p>
            <p className="text-sm text-pink-300 mt-1">
              Streams use stealth addresses for unlinkable listener identity,
              Pedersen commitments for hidden royalty amounts, and viewing keys
              for rights management. All cryptography is real — powered by
              @sip-protocol/sdk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
