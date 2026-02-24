"use client"

import type { ReactNode } from "react"
import {
  FishIcon,
  GhostIcon,
  FireIcon,
  WaveSineIcon,
  RainbowIcon,
  StarIcon,
  RocketIcon,
  PlantIcon,
  PaletteIcon,
  MaskHappyIcon,
  DiamondIcon,
  SneakerIcon,
  SpiralIcon,
  LightningIcon,
  DiamondsFourIcon,
} from "@phosphor-icons/react"
import { cn, truncate } from "@/lib/utils"
import type { StealthProfile } from "@/lib/social/types"

interface IdentitySelectorProps {
  profiles: StealthProfile[]
  selected: string | null
  onSelect: (profileId: string) => void
  onCreate?: () => void
  disabled?: boolean
}

function avatarIcon(address: string): ReactNode {
  const icons = [
    <FishIcon key="fish" size={18} weight="duotone" />,
    <GhostIcon key="ghost" size={18} weight="duotone" />,
    <FireIcon key="fire" size={18} weight="duotone" />,
    <WaveSineIcon key="wave" size={18} weight="duotone" />,
    <RainbowIcon key="rainbow" size={18} weight="duotone" />,
    <StarIcon key="star" size={18} weight="duotone" />,
    <RocketIcon key="rocket" size={18} weight="duotone" />,
    <PlantIcon key="plant" size={18} weight="duotone" />,
    <PaletteIcon key="palette" size={18} weight="duotone" />,
    <MaskHappyIcon key="mask" size={18} weight="duotone" />,
    <FishIcon key="whale" size={18} weight="duotone" />,
    <DiamondIcon key="diamond" size={18} weight="duotone" />,
    <SneakerIcon key="sneaker" size={18} weight="duotone" />,
    <SpiralIcon key="spiral" size={18} weight="duotone" />,
    <LightningIcon key="lightning" size={18} weight="duotone" />,
    <DiamondsFourIcon key="gem" size={18} weight="duotone" />,
  ]
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash + address.charCodeAt(i)) | 0
  }
  return icons[Math.abs(hash) % icons.length]
}

export function IdentitySelector({
  profiles,
  selected,
  onSelect,
  onCreate,
  disabled,
}: IdentitySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
        Post As
      </label>
      <div className="space-y-2">
        {profiles.map((profile) => {
          const isSelected = selected === profile.id
          const icon = avatarIcon(profile.stealthAddress)

          return (
            <button
              key={profile.id}
              type="button"
              onClick={() => onSelect(profile.id)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-left",
                "transition-all duration-200 ease-out",
                "hover:scale-[1.01] active:scale-[0.99]",
                isSelected
                  ? "border-pink-500 bg-pink-900/20 shadow-lg shadow-pink-500/10"
                  : "border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]",
                disabled && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  isSelected
                    ? "border-pink-500"
                    : "border-[var(--border-default)]"
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                )}
              </div>

              {/* Avatar + info */}
              <span className="flex items-center">{icon}</span>
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "font-medium text-sm block truncate",
                    isSelected && "text-pink-300"
                  )}
                >
                  {profile.username}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] block truncate">
                  {truncate(profile.stealthAddress, 8, 4)}
                </span>
              </div>

              {/* Post count */}
              <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
                {profile.postCount} posts
              </span>
            </button>
          )
        })}

        {/* Create new identity button */}
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            disabled={disabled}
            className={cn(
              "w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed",
              "border-[var(--border-default)] hover:border-pink-500/50 hover:bg-pink-900/10",
              "transition-all duration-200 text-sm text-[var(--text-secondary)]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span>+</span>
            <span>Create New Identity</span>
          </button>
        )}
      </div>
    </div>
  )
}
