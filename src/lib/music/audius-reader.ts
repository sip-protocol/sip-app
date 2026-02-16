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
    throw new Error("Audius mode is not yet implemented. Use simulation mode.")
  }

  async getTrack(id: string): Promise<Track | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_TRACKS.find((t) => t.id === id)
    }
    throw new Error("Audius mode is not yet implemented. Use simulation mode.")
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
    throw new Error("Audius mode is not yet implemented. Use simulation mode.")
  }

  async getTracksByGenre(genre: MusicGenre): Promise<Track[]> {
    if (this.mode === "simulation") {
      return SAMPLE_TRACKS.filter((t) => t.genre === genre)
    }
    throw new Error("Audius mode is not yet implemented. Use simulation mode.")
  }
}
