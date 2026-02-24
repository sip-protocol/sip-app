"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import {
  LockSimple,
  Eye,
  LockSimpleOpen,
  ClipboardText,
  Check,
} from "@phosphor-icons/react"
import { cn, truncate, copyToClipboard } from "@/lib/utils"
import { ArtCanvas } from "./art-canvas"
import { getArtStyle } from "@/lib/art/constants"
import type { GeneratedArt } from "@/lib/art/types"

interface GeneratedArtDisplayProps {
  art: GeneratedArt
  onMint?: () => void
  className?: string
}

export function GeneratedArtDisplay({
  art,
  onMint,
  className,
}: GeneratedArtDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const style = getArtStyle(art.parameters.styleId)

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const privacyBadge: Record<string, { label: ReactNode; color: string }> = {
    shielded: {
      label: (
        <>
          <LockSimple
            size={14}
            weight="duotone"
            className="inline-block align-[-2px]"
          />{" "}
          Shielded
        </>
      ),
      color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    compliant: {
      label: (
        <>
          <Eye
            size={14}
            weight="duotone"
            className="inline-block align-[-2px]"
          />{" "}
          Compliant
        </>
      ),
      color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    transparent: {
      label: (
        <>
          <LockSimpleOpen
            size={14}
            weight="duotone"
            className="inline-block align-[-2px]"
          />{" "}
          Transparent
        </>
      ),
      color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    },
  }

  const badge = privacyBadge[art.privacyLevel] ?? privacyBadge.shielded

  return (
    <div
      className={cn(
        "rounded-xl border border-rose-800/50 bg-rose-900/10 p-4",
        className
      )}
    >
      {/* Art preview */}
      <div className="flex justify-center mb-4">
        <ArtCanvas svgData={art.svgData} size="lg" />
      </div>

      {/* Style + Privacy badges */}
      <div className="flex items-center gap-2 mb-4">
        {style && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium">
            {style.emoji} {style.name}
          </span>
        )}
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium",
            badge.color
          )}
        >
          {badge.label}
        </span>
      </div>

      {/* Identity details */}
      <div className="space-y-2">
        {/* Seed */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">Seed</span>
          <button
            type="button"
            onClick={() => handleCopy(art.seed, "seed")}
            className="flex items-center gap-1.5 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(art.seed, 12, 6)}
            </code>
            <span className="text-[var(--text-tertiary)]">
              {copied === "seed" ? (
                <Check size={14} weight="duotone" />
              ) : (
                <ClipboardText size={14} weight="duotone" />
              )}
            </span>
          </button>
        </div>

        {/* Stealth address */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Stealth Address
          </span>
          <button
            type="button"
            onClick={() => handleCopy(art.stealthAddress, "stealth")}
            className="flex items-center gap-1.5 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(art.stealthAddress, 12, 6)}
            </code>
            <span className="text-[var(--text-tertiary)]">
              {copied === "stealth" ? (
                <Check size={14} weight="duotone" />
              ) : (
                <ClipboardText size={14} weight="duotone" />
              )}
            </span>
          </button>
        </div>

        {/* Meta address */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Meta-Address
          </span>
          <button
            type="button"
            onClick={() => handleCopy(art.metaAddress, "meta")}
            className="flex items-center gap-1.5 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(art.metaAddress, 12, 6)}
            </code>
            <span className="text-[var(--text-tertiary)]">
              {copied === "meta" ? (
                <Check size={14} weight="duotone" />
              ) : (
                <ClipboardText size={14} weight="duotone" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Mint CTA */}
      {onMint && (
        <button
          type="button"
          onClick={onMint}
          className="w-full mt-4 py-3 px-6 text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 text-white hover:from-rose-400 hover:to-rose-600 transition-colors"
        >
          Mint as NFT
        </button>
      )}
    </div>
  )
}
