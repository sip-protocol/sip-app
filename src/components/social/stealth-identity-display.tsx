"use client"

import { useState } from "react"
import { cn, truncate, copyToClipboard } from "@/lib/utils"

interface StealthIdentityDisplayProps {
  stealthAddress: string
  metaAddress: string
  viewingKeyHash?: string
  className?: string
}

export function StealthIdentityDisplay({
  stealthAddress,
  metaAddress,
  viewingKeyHash,
  className,
}: StealthIdentityDisplayProps) {
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
        "rounded-xl border border-pink-800/50 bg-pink-900/10 p-4",
        className
      )}
    >
      {/* Identity callout */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{"\u{1F510}"}</span>
        <div>
          <p className="text-sm font-medium text-pink-300">
            Your stealth identity
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Unlinkable to your wallet — only you can prove ownership
          </p>
        </div>
      </div>

      {/* Identity details */}
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

        {/* Viewing key hash */}
        {viewingKeyHash && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">
              Viewing Key Hash
            </span>
            <button
              type="button"
              onClick={() => handleCopy(viewingKeyHash, "viewingKey")}
              className="flex items-center gap-1.5 group"
            >
              <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
                {truncate(viewingKeyHash, 8, 6)}
              </code>
              <span className="text-xs text-[var(--text-tertiary)]">
                {copied === "viewingKey" ? "\u2713" : "\u{1F4CB}"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-300/80 leading-relaxed">
          {"\u26A0\uFE0F"} Save your viewing key — it proves your identity
          without revealing your wallet. Anyone with this key can verify you
          authored content under this persona.
        </p>
      </div>
    </div>
  )
}
