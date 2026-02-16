import type { Metadata } from "next"
import { PlaylistClient } from "./client"

export const metadata: Metadata = {
  title: "Encrypted Playlist",
  description:
    "Create encrypted playlists with stealth addresses. Playlist contents remain private — only viewing key holders can verify track listings.",
}

export default function PlaylistPage() {
  return <PlaylistClient />
}
