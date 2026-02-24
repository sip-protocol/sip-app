import type { ReactNode } from "react"
import {
  Waveform,
  MusicNote,
  Microphone,
  VinylRecord,
  WaveSine,
} from "@phosphor-icons/react"
import type { MusicGenre } from "@/lib/music/types"

export const GENRE_ICON_MAP: Record<MusicGenre, ReactNode> = {
  electronic: <Waveform size={20} weight="duotone" />,
  classical: <MusicNote size={20} weight="duotone" />,
  hip_hop: <Microphone size={20} weight="duotone" />,
  jazz: <VinylRecord size={20} weight="duotone" />,
  ambient: <WaveSine size={20} weight="duotone" />,
}
