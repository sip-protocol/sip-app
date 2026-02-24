import type { ReactNode } from "react"
import {
  ImageIcon,
  SwordIcon,
  GlobeHemisphereWestIcon,
  ShoppingCartIcon,
  MusicNotesIcon,
  BuildingsIcon,
  ChartLineUpIcon,
} from "@phosphor-icons/react"
import type { WorldCategory } from "@/lib/metaverse/types"

export const WORLD_CATEGORY_ICON_MAP: Record<WorldCategory, ReactNode> = {
  gallery: <ImageIcon size={20} weight="duotone" />,
  game_room: <SwordIcon size={20} weight="duotone" />,
  social: <GlobeHemisphereWestIcon size={20} weight="duotone" />,
  marketplace: <ShoppingCartIcon size={20} weight="duotone" />,
  concert_hall: <MusicNotesIcon size={20} weight="duotone" />,
}

/**
 * Extended icons for Portals-specific world IDs that don't map 1:1 to categories.
 * Falls back to category icon if no specific mapping exists.
 */
export const PORTALS_WORLD_ICON_MAP: Record<string, ReactNode> = {
  "portals-dao-headquarters": <BuildingsIcon size={20} weight="duotone" />,
  "portals-defi-floor": <ChartLineUpIcon size={20} weight="duotone" />,
}

export function getWorldIcon(world: {
  id: string
  category: WorldCategory
}): ReactNode {
  return (
    PORTALS_WORLD_ICON_MAP[world.id] ?? WORLD_CATEGORY_ICON_MAP[world.category]
  )
}
