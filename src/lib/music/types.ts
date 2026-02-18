import type { PrivacyLevel } from "@sip-protocol/types"

export type StreamStep =
  | "selecting_track"
  | "generating_stealth_listener"
  | "streaming"
  | "streamed"
  | "failed"

export type PlaylistStep =
  | "generating_proof"
  | "encrypting_playlist"
  | "created"
  | "failed"

export type MusicStep = StreamStep | PlaylistStep

export type MusicGenre =
  | "electronic"
  | "classical"
  | "hip_hop"
  | "jazz"
  | "ambient"

export type ListenerTier = "free" | "supporter" | "premium" | "patron"

export interface Track {
  id: string
  title: string
  description: string
  genre: MusicGenre
  tier: ListenerTier
  listenerCount: number
  isActive: boolean
  icon: string
}

export interface Stream {
  trackId: string
  tier: ListenerTier
  commitmentHash: string
  streamedAt: number
}

export interface MusicActionRecord {
  id: string
  type: "stream" | "playlist"
  trackId: string
  status: MusicStep
  privacyLevel: PrivacyLevel
  // Stream-specific
  trackTitle?: string
  genre?: MusicGenre
  tier?: ListenerTier
  commitmentHash?: string
  // Playlist-specific
  stealthAddress?: string
  stealthMetaAddress?: string
  playlistCreated?: boolean
  // Privacy encryption
  viewingKeyHash?: string
  encryptedForAuditor?: string
  encryptedContent?: string
  encryptionNonce?: string
  // Timestamps
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<MusicStep, number>>
}

export interface StreamTrackParams {
  trackId: string
  tier: ListenerTier
  privacyLevel: PrivacyLevel
}

export interface CreatePlaylistParams {
  trackId: string
  tier: ListenerTier
  privacyLevel: PrivacyLevel
}

export type MusicStepChangeCallback = (
  step: MusicStep,
  record: MusicActionRecord
) => void

export type MusicMode = "simulation" | "audius"
