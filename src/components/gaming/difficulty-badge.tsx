"use client"

import { cn } from "@/lib/utils"
import { DIFFICULTY_COLORS } from "@/lib/gaming/constants"
import type { Difficulty } from "@/lib/gaming/types"

interface DifficultyBadgeProps {
  difficulty: Difficulty
  className?: string
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = DIFFICULTY_COLORS[difficulty]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
