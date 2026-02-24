"use client"

import { cn } from "@/lib/utils"
import { GENRE_ICON_MAP } from "./track-icon-map"
import { ListenerTierBadge } from "./listener-tier-badge"
import { AudioPlayer } from "./audio-player"
import { TipButton } from "./tip-button"
import { MUSIC_GENRE_LABELS } from "@/lib/music/constants"
import type { Track } from "@/lib/music/types"

interface TrackCardProps {
  track: Track
  onStream?: (track: Track) => void
  className?: string
}

export function TrackCard({ track, onStream, className }: TrackCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5",
        "hover:border-[var(--border-hover)] hover:shadow-md transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-pink-400">{GENRE_ICON_MAP[track.genre]}</span>
          <div>
            <h3 className="font-semibold text-sm">{track.title}</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {track.listenerCount.toLocaleString()} listeners
            </p>
          </div>
        </div>
        <ListenerTierBadge tier={track.tier} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
        {track.description}
      </p>

      {/* Audio Preview */}
      <div className="mb-3">
        <AudioPlayer trackId={track.id} title={track.title} />
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-tertiary)]">
            {MUSIC_GENRE_LABELS[track.genre]}
          </span>
          <TipButton artistName={track.title} />
        </div>

        <button
          type="button"
          onClick={() => onStream?.(track)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            "bg-gradient-to-r from-pink-500 to-pink-700 text-white hover:from-pink-400 hover:to-pink-600"
          )}
        >
          Stream
        </button>
      </div>
    </div>
  )
}
