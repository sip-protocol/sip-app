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
