import type { ReactNode } from "react"
import {
  LockKey,
  MathOperations,
  Wrench,
  GlobeHemisphereWest,
  Diamond,
  Package,
  Broadcast,
} from "@phosphor-icons/react"

/**
 * Maps emoji string identifiers from Drop data to Phosphor icons.
 * Drop.icon stays as string in the data layer (constants.ts, drip-reader.ts)
 * and gets resolved to ReactNode at the component layer.
 */
const DROP_ICON_MAP: Record<string, ReactNode> = {
  "\u{1F510}": <LockKey size={20} weight="duotone" />,
  "\u{1F9EE}": <MathOperations size={20} weight="duotone" />,
  "\u{1F6E0}\uFE0F": <Wrench size={20} weight="duotone" />,
  "\u{1F310}": <GlobeHemisphereWest size={20} weight="duotone" />,
  "\u{1F48E}": <Diamond size={20} weight="duotone" />,
  "\u{1F4E6}": <Package size={20} weight="duotone" />,
  "\u{1F4E1}": <Broadcast size={20} weight="duotone" />,
}

const FALLBACK_ICON = <Broadcast size={20} weight="duotone" />

export function resolveDropIcon(icon: string): ReactNode {
  return DROP_ICON_MAP[icon] ?? FALLBACK_ICON
}
