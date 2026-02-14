"use client"

import { cn, truncate } from "@/lib/utils"

interface ProfileBadgeProps {
  username: string
  stealthAddress: string
  size?: "sm" | "md"
  className?: string
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
  const emoji = avatarEmoji(stealthAddress)
  const gradient = avatarColor(stealthAddress)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0",
          gradient,
          size === "sm" ? "w-7 h-7 text-sm" : "w-9 h-9 text-lg"
        )}
      >
        {emoji}
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
