"use client"

import { cn } from "@/lib/utils"

interface ArtCanvasProps {
  svgData: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE_MAP = {
  sm: "w-24 h-24",
  md: "w-48 h-48",
  lg: "w-full max-w-[400px] aspect-square",
}

export function ArtCanvas({ svgData, size = "md", className }: ArtCanvasProps) {
  if (!svgData) {
    return (
      <div
        className={cn(
          SIZE_MAP[size],
          "rounded-xl border border-dashed border-[var(--border-default)]",
          "flex items-center justify-center bg-[var(--bg-secondary)]",
          className
        )}
      >
        <div className="text-center">
          <span className="text-3xl block mb-2">{"\u{1F3A8}"}</span>
          <p className="text-xs text-[var(--text-tertiary)]">
            No art generated
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        SIZE_MAP[size],
        "rounded-xl overflow-hidden border border-[var(--border-default)]",
        className
      )}
      dangerouslySetInnerHTML={{ __html: svgData }}
    />
  )
}
