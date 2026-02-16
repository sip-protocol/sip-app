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
  async createPlaylist(
    params: CreatePlaylistParams
  ): Promise<MusicActionRecord> {
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
      record.error =
        error instanceof Error ? error.message : "Playlist creation failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
