"use client"

import { useState } from "react"
import { MusicNoteIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { TrackCard } from "./track-card"
import { SAMPLE_TRACKS } from "@/lib/music/constants"
import type { Track, MusicGenre } from "@/lib/music/types"

type TrackFilter = "all" | MusicGenre

const FILTER_TABS: { value: TrackFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "electronic", label: "Electronic" },
  { value: "classical", label: "Classical" },
  { value: "hip_hop", label: "Hip-Hop" },
  { value: "jazz", label: "Jazz" },
  { value: "ambient", label: "Ambient" },
]

interface TrackListProps {
  onStream?: (track: Track) => void
}

export function TrackList({ onStream }: TrackListProps) {
  const [filter, setFilter] = useState<TrackFilter>("all")

  const tracks =
    filter === "all"
      ? SAMPLE_TRACKS
      : SAMPLE_TRACKS.filter((p) => p.genre === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === tab.value
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Track grid */}
      {tracks.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <div className="text-pink-400 mb-4 flex justify-center">
            <MusicNoteIcon size={40} weight="duotone" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tracks found</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === "all"
              ? "No tracks available yet. Check back soon for new tracks."
              : `No ${filter} tracks. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} onStream={onStream} />
          ))}
        </div>
      )}
    </div>
  )
}
