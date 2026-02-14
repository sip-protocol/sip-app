"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { truncate, copyToClipboard } from "@/lib/utils"

interface StealthRevealProps {
  stealthAddress: string
  stealthMetaAddress: string
  className?: string
}

export function StealthReveal({
  stealthAddress,
  stealthMetaAddress,
  className,
}: StealthRevealProps) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleCopy = async () => {
    const success = await copyToClipboard(stealthAddress)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-500",
        revealed
          ? "bg-green-900/10 border-green-800/50 opacity-100 translate-y-0"
          : "bg-transparent border-transparent opacity-0 translate-y-2",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <span className="text-lg">{"\uD83D\uDD10"}</span>
        <p className="text-sm font-semibold text-green-300">
          Stealth Address Generated
        </p>
      </div>

      {/* Address display */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/20 border border-green-800/30">
          <code
            className={cn(
              "text-sm font-mono text-green-400 flex-1 break-all transition-all duration-700",
              revealed ? "opacity-100" : "opacity-0"
            )}
          >
            {truncate(stealthAddress, 20, 12)}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Meta-address */}
      <div className="px-4 pb-3">
        <p className="text-xs text-[var(--text-tertiary)] mb-1">Meta-Address</p>
        <code className="text-xs font-mono text-[var(--text-secondary)] break-all">
          {truncate(stealthMetaAddress, 16, 8)}
        </code>
      </div>

      {/* Privacy callout */}
      <div className="mx-4 mb-4 p-3 rounded-lg bg-green-900/20 border border-green-800/30">
        <div className="flex items-start gap-2">
          <span className="text-sm mt-0.5">{"\uD83C\uDF31"}</span>
          <div>
            <p className="text-xs font-medium text-green-300">
              Clean slate migration
            </p>
            <p className="text-xs text-green-400/70 mt-0.5">
              Your Sunrise Stake deposit cannot be linked to your source wallet.
              Leave dead protocols behind with full privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
