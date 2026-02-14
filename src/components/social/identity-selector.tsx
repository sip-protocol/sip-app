"use client"

import { cn, truncate } from "@/lib/utils"
import type { StealthProfile } from "@/lib/social/types"

interface IdentitySelectorProps {
  profiles: StealthProfile[]
  selected: string | null
  onSelect: (profileId: string) => void
  onCreate?: () => void
  disabled?: boolean
}

function avatarEmoji(address: string): string {
  const emojis = [
    "\u{1F42C}",
    "\u{1F47B}",
    "\u{1F525}",
    "\u{1F30A}",
    "\u{1F308}",
    "\u{2B50}",
    "\u{1F680}",
    "\u{1F331}",
    "\u{1F3A8}",
    "\u{1F3AD}",
    "\u{1F9CA}",
    "\u{1F52E}",
    "\u{1FA90}",
    "\u{1F30C}",
    "\u{26A1}",
    "\u{1F48E}",
  ]
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash + address.charCodeAt(i)) | 0
  }
  return emojis[Math.abs(hash) % emojis.length]
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
          const emoji = avatarEmoji(profile.stealthAddress)

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
              <span className="text-lg">{emoji}</span>
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
