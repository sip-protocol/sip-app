import type { ReactNode } from "react"
import {
  LockKeyIcon,
  MathOperationsIcon,
  WrenchIcon,
  GlobeHemisphereWestIcon,
  DiamondIcon,
  PackageIcon,
  BroadcastIcon,
} from "@phosphor-icons/react"

/**
 * Maps emoji string identifiers from Drop data to Phosphor icons.
 * Drop.icon stays as string in the data layer (constants.ts, drip-reader.ts)
 * and gets resolved to ReactNode at the component layer.
 */
const DROP_ICON_MAP: Record<string, ReactNode> = {
  "\u{1F510}": <LockKeyIcon size={20} weight="duotone" />,
  "\u{1F9EE}": <MathOperationsIcon size={20} weight="duotone" />,
  "\u{1F6E0}\uFE0F": <WrenchIcon size={20} weight="duotone" />,
  "\u{1F310}": <GlobeHemisphereWestIcon size={20} weight="duotone" />,
  "\u{1F48E}": <DiamondIcon size={20} weight="duotone" />,
  "\u{1F4E6}": <PackageIcon size={20} weight="duotone" />,
  "\u{1F4E1}": <BroadcastIcon size={20} weight="duotone" />,
}

const FALLBACK_ICON = <BroadcastIcon size={20} weight="duotone" />

export function resolveDropIcon(icon: string): ReactNode {
  return DROP_ICON_MAP[icon] ?? FALLBACK_ICON
}
