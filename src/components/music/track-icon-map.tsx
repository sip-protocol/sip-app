import type { ReactNode } from "react"
import {
  WaveformIcon,
  MusicNoteIcon,
  MicrophoneIcon,
  VinylRecordIcon,
  WaveSineIcon,
} from "@phosphor-icons/react"
import type { MusicGenre } from "@/lib/music/types"

export const GENRE_ICON_MAP: Record<MusicGenre, ReactNode> = {
  electronic: <WaveformIcon size={20} weight="duotone" />,
  classical: <MusicNoteIcon size={20} weight="duotone" />,
  hip_hop: <MicrophoneIcon size={20} weight="duotone" />,
  jazz: <VinylRecordIcon size={20} weight="duotone" />,
  ambient: <WaveSineIcon size={20} weight="duotone" />,
}
