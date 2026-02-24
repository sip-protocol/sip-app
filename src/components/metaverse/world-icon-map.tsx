import type { ReactNode } from "react"
import {
  Image,
  Sword,
  GlobeHemisphereWest,
  ShoppingCart,
  MusicNotes,
  Buildings,
  ChartLineUp,
} from "@phosphor-icons/react"
import type { WorldCategory } from "@/lib/metaverse/types"

export const WORLD_CATEGORY_ICON_MAP: Record<WorldCategory, ReactNode> = {
  gallery: <Image size={20} weight="duotone" />,
  game_room: <Sword size={20} weight="duotone" />,
  social: <GlobeHemisphereWest size={20} weight="duotone" />,
  marketplace: <ShoppingCart size={20} weight="duotone" />,
  concert_hall: <MusicNotes size={20} weight="duotone" />,
}

/**
 * Extended icons for Portals-specific world IDs that don't map 1:1 to categories.
 * Falls back to category icon if no specific mapping exists.
 */
export const PORTALS_WORLD_ICON_MAP: Record<string, ReactNode> = {
  "portals-dao-headquarters": <Buildings size={20} weight="duotone" />,
  "portals-defi-floor": <ChartLineUp size={20} weight="duotone" />,
}

export function getWorldIcon(world: {
  id: string
  category: WorldCategory
}): ReactNode {
  return (
    PORTALS_WORLD_ICON_MAP[world.id] ?? WORLD_CATEGORY_ICON_MAP[world.category]
  )
}
