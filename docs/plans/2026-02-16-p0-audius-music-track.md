# P0: Audius Music Track Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Audius Music track (C12) for the Graveyard Hackathon — private music streaming with stealth listening and encrypted playlists.

**Architecture:** Exact same pattern as C11 DeSci (service layer -> state+hooks -> components -> pages -> tests). Pink accent (`from-pink-500 to-pink-700`). Powered by Audius.

**Tech Stack:** Next.js 16, React 19, Zustand 5, @sip-protocol/sdk, Tailwind CSS 4, Vitest

---

## Task 1: Service Layer — Types (`src/lib/music/types.ts`)

**Files:**
- Create: `src/lib/music/types.ts`

**Step 1: Create the types file**

```typescript
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
```

**Step 2: Verify** — `pnpm typecheck` (should pass, no imports from this file yet)

---

## Task 2: Service Layer — Constants (`src/lib/music/constants.ts`)

**Files:**
- Create: `src/lib/music/constants.ts`

**Step 1: Create the constants file**

```typescript
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
```

---

## Task 3: Service Layer — Stealth Music (`src/lib/music/stealth-music.ts`)

**Files:**
- Create: `src/lib/music/stealth-music.ts`

```typescript
import { getSDK } from "@/lib/sip-client"

export interface StealthMusicResult {
  stealthAddress: string
  metaAddress: string
  spendingKey: string
  viewingKey: string
}

/**
 * Generate a stealth address for anonymous music streaming.
 * Uses real @sip-protocol/sdk cryptography — genuine one-time unlinkable addresses.
 * Streams to this address cannot be linked to the listener's wallet.
 */
export async function generateMusicStealthAddress(): Promise<StealthMusicResult> {
  const sdk = await getSDK()

  const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
    sdk.generateStealthMetaAddress("solana")

  const { stealthAddress } = sdk.generateStealthAddress(metaAddress)

  const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)
  const stealthAddressStr = `sip:solana:${stealthAddress.address}`

  return {
    stealthAddress: stealthAddressStr,
    metaAddress: metaAddressStr,
    spendingKey: spendingPrivateKey,
    viewingKey: viewingPrivateKey,
  }
}
```

---

## Task 4: Service Layer — Audius Reader (`src/lib/music/audius-reader.ts`)

**Files:**
- Create: `src/lib/music/audius-reader.ts`

```typescript
import type { Track, MusicGenre, MusicMode } from "./types"
import { SAMPLE_TRACKS } from "./constants"

export class AudiusReader {
  private mode: MusicMode

  constructor(mode: MusicMode = "simulation") {
    this.mode = mode
  }

  async getTracks(): Promise<Track[]> {
    if (this.mode === "simulation") {
      return SAMPLE_TRACKS
    }
    throw new Error(
      "Audius mode is not yet implemented. Use simulation mode."
    )
  }

  async getTrack(id: string): Promise<Track | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_TRACKS.find((t) => t.id === id)
    }
    throw new Error(
      "Audius mode is not yet implemented. Use simulation mode."
    )
  }

  async getListeners(): Promise<
    { address: string; tracks: number; tier: string }[]
  > {
    if (this.mode === "simulation") {
      return [
        { address: "S1P...x7a", tracks: 42, tier: "patron" },
        { address: "7Kz...m3b", tracks: 28, tier: "premium" },
        { address: "Fg2...p9c", tracks: 19, tier: "supporter" },
        { address: "Bx8...k1d", tracks: 11, tier: "free" },
        { address: "Qm5...r4e", tracks: 7, tier: "free" },
      ]
    }
    throw new Error(
      "Audius mode is not yet implemented. Use simulation mode."
    )
  }

  async getTracksByGenre(genre: MusicGenre): Promise<Track[]> {
    if (this.mode === "simulation") {
      return SAMPLE_TRACKS.filter((t) => t.genre === genre)
    }
    throw new Error(
      "Audius mode is not yet implemented. Use simulation mode."
    )
  }
}
```

---

## Task 5: Service Layer — Music Service (`src/lib/music/music-service.ts`)

**Files:**
- Create: `src/lib/music/music-service.ts`

```typescript
import type {
  MusicActionRecord,
  MusicStepChangeCallback,
  MusicMode,
  StreamTrackParams,
  CreatePlaylistParams,
} from "./types"
import { SIMULATION_DELAYS, getTrack } from "./constants"
import { generateMusicStealthAddress } from "./stealth-music"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface MusicServiceOptions {
  mode?: MusicMode
  onStepChange?: MusicStepChangeCallback
}

export class MusicService {
  private mode: MusicMode
  private onStepChange?: MusicStepChangeCallback

  constructor(options: MusicServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
  }

  validate(
    type: "stream" | "playlist",
    params: StreamTrackParams | CreatePlaylistParams
  ): string | null {
    switch (type) {
      case "stream": {
        const p = params as StreamTrackParams
        if (!p.trackId) {
          return "Track ID is required"
        }
        const track = getTrack(p.trackId)
        if (!track) {
          return "Track not found"
        }
        if (!track.isActive) {
          return "Track is not active"
        }
        if (!p.tier) {
          return "Listener tier is required"
        }
        return null
      }
      case "playlist": {
        const p = params as CreatePlaylistParams
        if (!p.trackId) {
          return "Track ID is required"
        }
        if (!p.tier) {
          return "Listener tier is required"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Stream a track with stealth listener identity.
   * selecting_track -> generating_stealth_listener -> streaming -> streamed
   */
  async streamTrack(params: StreamTrackParams): Promise<MusicActionRecord> {
    const validationError = this.validate("stream", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const track = getTrack(params.trackId)

    const record: MusicActionRecord = {
      id: generateId("stream"),
      type: "stream",
      trackId: params.trackId,
      status: "selecting_track",
      privacyLevel: params.privacyLevel,
      trackTitle: track?.title,
      genre: track?.genre,
      tier: params.tier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Selecting track
      record.status = "selecting_track"
      record.stepTimestamps.selecting_track = Date.now()
      this.onStepChange?.("selecting_track", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.selecting_track)
        )
      }

      // Step 2: Generating stealth listener (real SDK)
      record.status = "generating_stealth_listener"
      record.stepTimestamps.generating_stealth_listener = Date.now()
      this.onStepChange?.("generating_stealth_listener", { ...record })

      const stealth = await generateMusicStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      // Generate a simulated commitment hash for stream ID
      const commitBytes = new Uint8Array(32)
      crypto.getRandomValues(commitBytes)
      record.commitmentHash = `0x${Array.from(commitBytes.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}...${Array.from(commitBytes.slice(28))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_stealth_listener)
        )
      }

      // Step 3: Streaming
      record.status = "streaming"
      record.stepTimestamps.streaming = Date.now()
      this.onStepChange?.("streaming", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.streaming))
      }

      // Step 4: Streamed
      record.status = "streamed"
      record.completedAt = Date.now()
      record.stepTimestamps.streamed = Date.now()
      this.onStepChange?.("streamed", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Streaming failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Create an encrypted playlist.
   * generating_proof -> encrypting_playlist -> created
   */
  async createPlaylist(params: CreatePlaylistParams): Promise<MusicActionRecord> {
    const validationError = this.validate("playlist", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const track = getTrack(params.trackId)

    const record: MusicActionRecord = {
      id: generateId("playlist"),
      type: "playlist",
      trackId: params.trackId,
      status: "generating_proof",
      privacyLevel: params.privacyLevel,
      trackTitle: track?.title,
      tier: params.tier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Generate playlist proof
      record.status = "generating_proof"
      record.stepTimestamps.generating_proof = Date.now()
      this.onStepChange?.("generating_proof", { ...record })

      const stealth = await generateMusicStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_proof)
        )
      }

      // Step 2: Encrypting playlist
      record.status = "encrypting_playlist"
      record.stepTimestamps.encrypting_playlist = Date.now()
      this.onStepChange?.("encrypting_playlist", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.encrypting_playlist)
        )
      }

      // Step 3: Created
      record.playlistCreated = true
      record.status = "created"
      record.completedAt = Date.now()
      record.stepTimestamps.created = Date.now()
      this.onStepChange?.("created", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Playlist creation failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
```

---

## Task 6: Service Layer — Barrel Exports (`src/lib/music/index.ts`)

**Files:**
- Create: `src/lib/music/index.ts`

```typescript
export { MusicService } from "./music-service"
export type { MusicServiceOptions } from "./music-service"

export { AudiusReader } from "./audius-reader"

export { generateMusicStealthAddress } from "./stealth-music"
export type { StealthMusicResult } from "./stealth-music"

export {
  SAMPLE_TRACKS,
  SAMPLE_STREAMS,
  SIMULATION_DELAYS,
  MAX_MUSIC_HISTORY,
  GENRE_COLORS,
  LISTENER_TIER_COLORS,
  MUSIC_GENRE_LABELS,
  getTrack,
  getTracksByGenre,
  getAllTracks,
  getStream,
} from "./constants"

export type {
  StreamStep,
  PlaylistStep,
  MusicStep,
  MusicGenre,
  ListenerTier,
  Track,
  Stream,
  MusicActionRecord,
  StreamTrackParams,
  CreatePlaylistParams,
  MusicStepChangeCallback,
  MusicMode,
} from "./types"
```

**Step: Run typecheck** — `cd /Users/rector/local-dev/sip-app && pnpm typecheck`

---

## Task 7: Store (`src/stores/music-history.ts`)

**Files:**
- Create: `src/stores/music-history.ts`

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MusicActionRecord, Stream } from "@/lib/music/types"
import { MAX_MUSIC_HISTORY } from "@/lib/music/constants"

interface MusicHistoryStore {
  actions: MusicActionRecord[]
  streams: Stream[]

  addAction: (record: MusicActionRecord) => void
  updateAction: (id: string, updates: Partial<MusicActionRecord>) => void
  getAction: (id: string) => MusicActionRecord | undefined
  getActionsByType: (type: "stream" | "playlist") => MusicActionRecord[]

  addStream: (stream: Stream) => void
  getStream: (trackId: string) => Stream | undefined
  getTrackCount: () => number

  clearHistory: () => void
}

export const useMusicHistoryStore = create<MusicHistoryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      streams: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_MUSIC_HISTORY),
        })),

      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      getAction: (id) => get().actions.find((a) => a.id === id),

      getActionsByType: (type) => get().actions.filter((a) => a.type === type),

      addStream: (stream) =>
        set((state) => ({
          streams: [stream, ...state.streams].slice(
            0,
            MAX_MUSIC_HISTORY
          ),
        })),

      getStream: (trackId) =>
        get().streams.find((s) => s.trackId === trackId),

      getTrackCount: () => get().streams.length,

      clearHistory: () => set({ actions: [], streams: [] }),
    }),
    {
      name: "sip-music-history",
    }
  )
)
```

---

## Task 8: Hooks — `use-stream-track.ts` and `use-create-playlist.ts`

**Files:**
- Create: `src/hooks/use-stream-track.ts`
- Create: `src/hooks/use-create-playlist.ts`

### use-stream-track.ts

```typescript
"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { MusicService } from "@/lib/music/music-service"
import { useMusicHistoryStore } from "@/stores/music-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  MusicStep,
  StreamTrackParams,
  MusicActionRecord,
  Stream,
} from "@/lib/music/types"

export type StreamTrackStatus = MusicStep | "idle" | "error"

export interface UseStreamTrackReturn {
  status: StreamTrackStatus
  activeRecord: MusicActionRecord | null
  error: string | null
  streamTrack: (
    params: StreamTrackParams
  ) => Promise<MusicActionRecord | undefined>
  reset: () => void
}

export function useStreamTrack(): UseStreamTrackReturn {
  const { publicKey } = useWallet()
  const { addAction, addStream } = useMusicHistoryStore()
  const { trackMusic } = useTrackEvent()

  const [status, setStatus] = useState<StreamTrackStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<MusicActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const streamTrack = useCallback(
    async (
      params: StreamTrackParams
    ): Promise<MusicActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new MusicService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
        })

        const validationError = service.validate("stream", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("selecting_track")

        const result = await service.streamTrack(params)

        setActiveRecord(result)
        addAction(result)

        if (result.commitmentHash) {
          const stream: Stream = {
            trackId: params.trackId,
            tier: params.tier,
            commitmentHash: result.commitmentHash,
            streamedAt: Date.now(),
          }
          addStream(stream)
        }

        trackMusic({
          action: "track_stream",
          trackId: params.trackId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Streaming failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, addStream, trackMusic]
  )

  return { status, activeRecord, error, streamTrack, reset }
}
```

### use-create-playlist.ts

```typescript
"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { MusicService } from "@/lib/music/music-service"
import { useMusicHistoryStore } from "@/stores/music-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  MusicStep,
  CreatePlaylistParams,
  MusicActionRecord,
} from "@/lib/music/types"

export type CreatePlaylistStatus = MusicStep | "idle" | "error"

export interface UseCreatePlaylistReturn {
  status: CreatePlaylistStatus
  activeRecord: MusicActionRecord | null
  error: string | null
  createPlaylist: (
    params: CreatePlaylistParams
  ) => Promise<MusicActionRecord | undefined>
  reset: () => void
}

export function useCreatePlaylist(): UseCreatePlaylistReturn {
  const { publicKey } = useWallet()
  const { addAction } = useMusicHistoryStore()
  const { trackMusic } = useTrackEvent()

  const [status, setStatus] = useState<CreatePlaylistStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<MusicActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const createPlaylist = useCallback(
    async (
      params: CreatePlaylistParams
    ): Promise<MusicActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new MusicService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
        })

        const validationError = service.validate("playlist", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_proof")

        const result = await service.createPlaylist(params)

        setActiveRecord(result)
        addAction(result)

        trackMusic({
          action: "playlist_create",
          trackId: params.trackId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Playlist creation failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, trackMusic]
  )

  return { status, activeRecord, error, createPlaylist, reset }
}
```

---

## Task 9: Edit shared hooks (`usePrivacyAction.ts` + `useTrackEvent.ts`)

**Files:**
- Modify: `src/hooks/usePrivacyAction.ts`
- Modify: `src/hooks/useTrackEvent.ts`

### usePrivacyAction.ts — Add music action types

Add `| "track_stream" | "playlist_create"` to the `PrivacyActionType` union.

### useTrackEvent.ts — Add trackMusic callback

Add `trackMusic` callback (same pattern as `trackDeSci`) and include in return object.

```typescript
const trackMusic = useCallback(
  (metadata?: Record<string, string | number | boolean>) => {
    track({
      action: "track_stream",
      label: "Music action",
      metadata,
    })
  },
  [track]
)
```

Add `trackMusic` to the return object.

---

## Task 10: Components (10 files in `src/components/music/`)

Create all 10 components following the exact DeSci pattern but with pink accent color.

**Files to create:**
1. `src/components/music/listener-tier-badge.tsx` — Badge component
2. `src/components/music/music-stats.tsx` — 4-stat grid
3. `src/components/music/music-privacy-toggle.tsx` — 3-option privacy radio
4. `src/components/music/music-status.tsx` — Step pipeline
5. `src/components/music/stealth-stream-display.tsx` — Post-stream reveal
6. `src/components/music/stream-form.tsx` — Stream flow form
7. `src/components/music/playlist-form.tsx` — Playlist flow form
8. `src/components/music/track-card.tsx` — Track card
9. `src/components/music/track-list.tsx` — Filtered list
10. `src/components/music/index.ts` — Barrel exports

**Color mapping:** All `lime-` references in DeSci become `pink-` in Music.

Each component follows the exact same structure as its DeSci counterpart, with s/desci/music/, s/project/track/, s/fund/stream/, s/review/playlist/, s/lime/pink/, s/BIO Protocol/Audius/.

---

## Task 11: Pages (`src/app/(music)/`)

**Files to create:**
1. `src/app/(music)/layout.tsx` — Sub-nav (Tracks / Playlist), pink active border
2. `src/app/(music)/music/page.tsx` — Server page with metadata
3. `src/app/(music)/music/client.tsx` — Tracks view / stream view
4. `src/app/(music)/music/playlist/page.tsx` — Server page
5. `src/app/(music)/music/playlist/client.tsx` — Playlist client

---

## Task 12: Hub page — Add music card (`src/app/page.tsx`)

**Files:**
- Modify: `src/app/page.tsx`

Add after the DeSci card:

```typescript
{
  name: "Privacy Music",
  description: "Anonymous streaming with stealth listener identity via Audius",
  href: "/music",
  icon: "\u{1F3B5}",
  status: "live" as const,
  gradient: "from-pink-500 to-pink-700",
},
```

---

## Task 13: Tests

**Files:**
- Create: `tests/lib/music/music-service.test.ts`
- Create: `tests/stores/music-history.test.ts`

Follow exact DeSci test patterns: mock SDK, validate, stream flow, playlist flow, store CRUD.

---

## Task 14: Format, typecheck, test, commit

```bash
cd /Users/rector/local-dev/sip-app

# Format
pnpm prettier --write "src/lib/music/**/*.ts" \
  "src/stores/music-history.ts" \
  "src/hooks/use-stream-track.ts" \
  "src/hooks/use-create-playlist.ts" \
  "src/components/music/**/*.{ts,tsx}" \
  "tests/lib/music/**/*.ts" \
  "tests/stores/music-history.test.ts"

# Typecheck
pnpm typecheck

# Tests
pnpm test -- --run

# Build
pnpm build
```

---

## Verification

- [ ] All 5 tracks visible at `/music`
- [ ] Genre filter tabs work (All / Electronic / Classical / Hip-Hop / Jazz / Ambient)
- [ ] Stream form shows privacy toggle with pink accent
- [ ] Playlist page loads at `/music/playlist`
- [ ] Hub page shows music card with pink gradient
- [ ] Tests pass (service + store)
- [ ] Typecheck clean
- [ ] Build succeeds
