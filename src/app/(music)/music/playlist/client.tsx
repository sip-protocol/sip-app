"use client"

import { PlaylistForm } from "@/components/music/playlist-form"

export function PlaylistClient() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Encrypted Playlist
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Create encrypted playlists with stealth addresses. Playlist contents
          remain private — only viewing key holders can verify track listings.
        </p>
      </div>

      <PlaylistForm />
    </div>
  )
}
