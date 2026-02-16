import type {
  Track,
  Stream,
  MusicStep,
  MusicGenre,
  ListenerTier,
} from "./types"

const now = Date.now()
const DAY = 24 * 3600_000

export const SAMPLE_TRACKS: Track[] = [
  {
    id: "track-decentralized-beats",
    title: "Decentralized Beats",
    description:
      "Electronic music with stealth listener identity. Stream anonymously — no wallet-based listening profiling or taste surveillance.",
    genre: "electronic",
    tier: "supporter",
    listenerCount: 4200,
    isActive: true,
    icon: "\u{1F3B5}",
  },
  {
    id: "track-solana-symphony",
    title: "Solana Symphony",
    description:
      "Classical composition with Pedersen commitments for royalty amounts. Artists get paid without revealing listener payment details.",
    genre: "classical",
    tier: "patron",
    listenerCount: 1800,
    isActive: true,
    icon: "\u{1F3BB}",
  },
  {
    id: "track-privacy-anthem",
    title: "Privacy Anthem",
    description:
      "Hip-hop track with viewing key-gated access. Rights management via selective disclosure — prove access tier without revealing identity.",
    genre: "hip_hop",
    tier: "premium",
    listenerCount: 6700,
    isActive: true,
    icon: "\u{1F3A4}",
  },
  {
    id: "track-anonymous-groove",
    title: "Anonymous Groove",
    description:
      "Jazz improvisations with anonymous streaming proofs. Listeners can prove they streamed without revealing which wallet listened.",
    genre: "jazz",
    tier: "free",
    listenerCount: 3100,
    isActive: true,
    icon: "\u{1F3B7}",
  },
  {
    id: "track-encrypted-melodies",
    title: "Encrypted Melodies",
    description:
      "Ambient soundscapes with stealth transfer for tips. Support artists anonymously — tips sent to stealth addresses, unlinkable to your wallet.",
    genre: "ambient",
    tier: "supporter",
    listenerCount: 2400,
    isActive: true,
    icon: "\u{1F3B6}",
  },
]

export const SAMPLE_STREAMS: Stream[] = [
  {
    trackId: "track-anonymous-groove",
    tier: "free",
    commitmentHash: "0x6e3b...a1c4",
    streamedAt: now - 2 * DAY,
  },
  {
    trackId: "track-decentralized-beats",
    tier: "supporter",
    commitmentHash: "0x9f2d...c7e3",
    streamedAt: now - 1 * DAY,
  },
]

export const SIMULATION_DELAYS: Record<MusicStep, number> = {
  selecting_track: 1200,
  generating_stealth_listener: 1500,
  streaming: 1800,
  streamed: 0,
  generating_proof: 1500,
  encrypting_playlist: 2000,
  created: 0,
  failed: 0,
}

export const MAX_MUSIC_HISTORY = 50

export const GENRE_COLORS: Record<
  MusicGenre,
  { label: string; color: string; bg: string }
> = {
  electronic: {
    label: "Electronic",
    color: "text-pink-300",
    bg: "bg-pink-500/20 border-pink-500/30",
  },
  classical: {
    label: "Classical",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  hip_hop: {
    label: "Hip-Hop",
    color: "text-purple-300",
    bg: "bg-purple-500/20 border-purple-500/30",
  },
  jazz: {
    label: "Jazz",
    color: "text-blue-300",
    bg: "bg-blue-500/20 border-blue-500/30",
  },
  ambient: {
    label: "Ambient",
    color: "text-cyan-300",
    bg: "bg-cyan-500/20 border-cyan-500/30",
  },
}

export const LISTENER_TIER_COLORS: Record<
  ListenerTier,
  { label: string; color: string; bg: string }
> = {
  free: {
    label: "Free",
    color: "text-gray-300",
    bg: "bg-gray-400/20 border-gray-400/30",
  },
  supporter: {
    label: "Supporter",
    color: "text-pink-300",
    bg: "bg-pink-500/20 border-pink-500/30",
  },
  premium: {
    label: "Premium",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  patron: {
    label: "Patron",
    color: "text-yellow-300",
    bg: "bg-yellow-500/20 border-yellow-500/30",
  },
}

export const MUSIC_GENRE_LABELS: Record<MusicGenre, string> = {
  electronic: "Electronic",
  classical: "Classical",
  hip_hop: "Hip-Hop",
  jazz: "Jazz",
  ambient: "Ambient",
}

export function getTrack(id: string): Track | undefined {
  return SAMPLE_TRACKS.find((t) => t.id === id)
}

export function getTracksByGenre(genre: MusicGenre): Track[] {
  return SAMPLE_TRACKS.filter((t) => t.genre === genre)
}

export function getAllTracks(): Track[] {
  return SAMPLE_TRACKS
}

export function getStream(trackId: string): Stream | undefined {
  return SAMPLE_STREAMS.find((s) => s.trackId === trackId)
}
