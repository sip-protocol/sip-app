"use client"

import { useState } from "react"
import { cn, truncate, copyToClipboard } from "@/lib/utils"
import { CONTENT_TYPE_LABELS } from "@/lib/channel/constants"
import type { ContentType } from "@/lib/channel/types"

interface StealthDropDisplayProps {
  stealthAddress: string
  metaAddress: string
  title: string
  contentType: ContentType
  className?: string
}

export function StealthDropDisplay({
  stealthAddress,
  metaAddress,
  title,
  contentType,
  className,
}: StealthDropDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-purple-800/50 bg-purple-900/10 p-4",
        className
      )}
    >
      {/* Drop callout */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{"\u{1F4E1}"}</span>
        <div>
          <p className="text-sm font-medium text-purple-300">
            Drop published to stealth address
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Content encrypted — only subscribers with viewing keys can access
          </p>
        </div>
      </div>

      {/* Drop details */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <div>
          <span className="text-sm text-[var(--text-secondary)]">{title}</span>
          <p className="text-xs text-purple-300 mt-0.5">
            {CONTENT_TYPE_LABELS[contentType]}
          </p>
        </div>
      </div>

      {/* Address details */}
      <div className="space-y-2">
        {/* Stealth address */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Stealth Address
          </span>
          <button
            type="button"
            onClick={() => handleCopy(stealthAddress, "stealth")}
            className="flex items-center gap-1.5 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(stealthAddress, 12, 6)}
            </code>
            <span className="text-xs text-[var(--text-tertiary)]">
              {copied === "stealth" ? "\u2713" : "\u{1F4CB}"}
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
            onClick={() => handleCopy(metaAddress, "meta")}
            className="flex items-center gap-1.5 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(metaAddress, 12, 6)}
            </code>
            <span className="text-xs text-[var(--text-tertiary)]">
              {copied === "meta" ? "\u2713" : "\u{1F4CB}"}
            </span>
          </button>
        </div>
      </div>

      {/* Privacy badge */}
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 border border-purple-500/30 text-purple-300">
          {"\u{1F512}"} Encrypted Drop
        </span>
      </div>
    </div>
  )
}
