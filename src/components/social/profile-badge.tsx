"use client"

import type { ReactNode } from "react"
import {
  Fish,
  Ghost,
  Fire,
  WaveSine,
  Rainbow,
  Star,
  Rocket,
  Plant,
  Palette,
  MaskHappy,
  Diamond,
  Sneaker,
  Spiral,
  Lightning,
  DiamondsFour,
} from "@phosphor-icons/react"
import { cn, truncate } from "@/lib/utils"

interface ProfileBadgeProps {
  username: string
  stealthAddress: string
  size?: "sm" | "md"
  className?: string
}

function avatarIcon(address: string, size: number = 16): ReactNode {
  const icons = [
    <Fish key="fish" size={size} weight="duotone" />,
    <Ghost key="ghost" size={size} weight="duotone" />,
    <Fire key="fire" size={size} weight="duotone" />,
    <WaveSine key="wave" size={size} weight="duotone" />,
    <Rainbow key="rainbow" size={size} weight="duotone" />,
    <Star key="star" size={size} weight="duotone" />,
    <Rocket key="rocket" size={size} weight="duotone" />,
    <Plant key="plant" size={size} weight="duotone" />,
    <Palette key="palette" size={size} weight="duotone" />,
    <MaskHappy key="mask" size={size} weight="duotone" />,
    <Fish key="whale" size={size} weight="duotone" />,
    <Diamond key="diamond" size={size} weight="duotone" />,
    <Sneaker key="sneaker" size={size} weight="duotone" />,
    <Spiral key="spiral" size={size} weight="duotone" />,
    <Lightning key="lightning" size={size} weight="duotone" />,
    <DiamondsFour key="gem" size={size} weight="duotone" />,
  ]
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash + address.charCodeAt(i)) | 0
  }
  return icons[Math.abs(hash) % icons.length]
}

function avatarColor(address: string): string {
  const colors = [
    "from-pink-500 to-rose-600",
    "from-purple-500 to-indigo-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-fuchsia-500 to-pink-600",
  ]
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 3) - hash + address.charCodeAt(i)) | 0
  }
  return colors[Math.abs(hash) % colors.length]
}

export function ProfileBadge({
  username,
  stealthAddress,
  size = "md",
  className,
}: ProfileBadgeProps) {
  const icon = avatarIcon(stealthAddress, size === "sm" ? 14 : 16)
  const gradient = avatarColor(stealthAddress)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-white",
          gradient,
          size === "sm" ? "w-7 h-7" : "w-9 h-9"
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-medium truncate",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          {username}
        </p>
        <p
          className={cn(
            "text-[var(--text-tertiary)] truncate",
            size === "sm" ? "text-[10px]" : "text-xs"
          )}
        >
          {truncate(stealthAddress, 8, 4)}
        </p>
      </div>
    </div>
  )
}
