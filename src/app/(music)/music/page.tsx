import type { Metadata } from "next"
import { MusicPageClient } from "./client"

export const metadata: Metadata = {
  title: "Privacy Music",
  description:
    "Private music streaming — anonymous listening, stealth royalty payments, encrypted playlists. Music privacy powered by real cryptography via Audius.",
}

export default function MusicPage() {
  return <MusicPageClient />
}
