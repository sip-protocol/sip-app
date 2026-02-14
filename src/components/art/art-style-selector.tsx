"use client"

import { cn } from "@/lib/utils"
import { ART_STYLES } from "@/lib/art/constants"
import type { ArtStyleId } from "@/lib/art/types"

interface ArtStyleSelectorProps {
  value: ArtStyleId | null
  onChange: (styleId: ArtStyleId) => void
  disabled?: boolean
}

export function ArtStyleSelector({
  value,
  onChange,
  disabled,
}: ArtStyleSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
        Art Style
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ART_STYLES.map((style) => {
          const isActive = style.id === value
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              disabled={disabled}
              className={cn(
                "relative p-4 rounded-xl border text-center",
                "transition-all duration-200 ease-out",
                "hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "border-rose-500 bg-rose-900/20 shadow-lg shadow-rose-500/10"
                  : "border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]",
                disabled && "opacity-50 cursor-not-allowed hover:scale-100",
              )}
            >
              {isActive && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}

              <span className="text-3xl mb-2 block">{style.emoji}</span>
              <p
                className={cn(
                  "font-medium text-sm transition-colors",
                  isActive && "text-rose-300",
                )}
              >
                {style.name}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {style.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
