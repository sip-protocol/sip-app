"use client"

import { useState } from "react"
import { cn, truncate, copyToClipboard } from "@/lib/utils"
import { ArtCanvas } from "./art-canvas"
import type { ArtNFT, GeneratedArt } from "@/lib/art/types"

interface MintedNFTCardProps {
  nft: ArtNFT
  art?: GeneratedArt
  className?: string
}

export function MintedNFTCard({ nft, art, className }: MintedNFTCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(nft.mintAddress)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const date = new Date(nft.mintedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl overflow-hidden",
        "hover:border-[var(--border-hover)] hover:shadow-md transition-all",
        className
      )}
    >
      {/* Art thumbnail */}
      <div className="aspect-square">
        <ArtCanvas
          svgData={art?.svgData ?? ""}
          size="lg"
          className="w-full h-full rounded-none border-0"
        />
      </div>

      {/* Card info */}
      <div className="p-3 space-y-2">
        <p className="font-medium text-sm truncate">{nft.name}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-tertiary)]">Mint</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(nft.mintAddress, 8, 4)}
            </code>
            <span className="text-xs text-[var(--text-tertiary)]">
              {copied ? "\u2713" : "\u{1F4CB}"}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-tertiary)]">{date}</span>
          <a
            href={`https://solscan.io/token/${nft.mintAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            Explorer
          </a>
        </div>
      </div>
    </div>
  )
}
