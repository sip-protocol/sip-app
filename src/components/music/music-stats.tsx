"use client"

import { useMusicHistoryStore } from "@/stores/music-history"
import { SAMPLE_TRACKS } from "@/lib/music/constants"

export function MusicStats() {
  const { streams, actions } = useMusicHistoryStore()

  const tracksStreamed = streams.length
  const playlistsCreated = actions.filter(
    (a) => a.type === "playlist" && a.status === "created"
  ).length
  const activeTracks = SAMPLE_TRACKS.filter((p) => p.isActive).length
  const topTier =
    streams.length > 0
      ? streams.some((c) => c.tier === "patron")
        ? "Patron"
        : streams.some((c) => c.tier === "premium")
          ? "Premium"
          : streams.some((c) => c.tier === "supporter")
            ? "Supporter"
            : "Free"
      : "None"

  const stats = [
    { label: "Tracks Streamed", value: tracksStreamed.toString() },
    { label: "Playlists Created", value: playlistsCreated.toString() },
    { label: "Active Tracks", value: activeTracks.toString() },
    { label: "Top Tier", value: topTier },
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
