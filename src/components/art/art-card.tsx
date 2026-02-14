"use client"

import { cn } from "@/lib/utils"
import { ArtCanvas } from "./art-canvas"
import { getArtStyle } from "@/lib/art/constants"
import type { GeneratedArt } from "@/lib/art/types"

interface ArtCardProps {
  art: GeneratedArt
  isMinted?: boolean
  onSelect?: () => void
  onMint?: () => void
  className?: string
}

export function ArtCard({
  art,
  isMinted,
  onSelect,
  onMint,
  className,
}: ArtCardProps) {
  const style = getArtStyle(art.parameters.styleId)
  const date = new Date(art.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <div
      className={cn(
        "group bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl overflow-hidden",
        "hover:border-[var(--border-hover)] hover:shadow-md transition-all",
        className
      )}
    >
      {/* Art thumbnail */}
      <button
        type="button"
        onClick={onSelect}
        className="w-full aspect-square relative"
      >
        <ArtCanvas
          svgData={art.svgData}
          size="lg"
          className="w-full h-full rounded-none border-0"
        />
        {isMinted && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-sip-green-500/20 border border-sip-green-500/30 text-[10px] font-medium text-sip-green-300">
            Minted
          </span>
        )}
      </button>

      {/* Card footer */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          {style && (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              {style.emoji} {style.name}
            </span>
          )}
          <span className="text-xs text-[var(--text-tertiary)]">{date}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!isMinted && onMint && (
            <button
              type="button"
              onClick={onMint}
              className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
            >
              Mint
            </button>
          )}
          <button
            type="button"
            onClick={onSelect}
            className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </div>
  )
}
