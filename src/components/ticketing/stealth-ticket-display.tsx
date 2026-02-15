"use client"

import { useState } from "react"
import { cn, truncate, copyToClipboard } from "@/lib/utils"
import { TIER_COLORS } from "@/lib/ticketing/constants"
import type { TicketTier } from "@/lib/ticketing/types"

interface StealthTicketDisplayProps {
  stealthAddress: string
  metaAddress: string
  eventTitle: string
  tier: TicketTier
  className?: string
}

export function StealthTicketDisplay({
  stealthAddress,
  metaAddress,
  eventTitle,
  tier,
  className,
}: StealthTicketDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const tierConfig = TIER_COLORS[tier]

  return (
    <div
      className={cn(
        "rounded-xl border border-teal-800/50 bg-teal-900/10 p-4",
        className
      )}
    >
      {/* Ticket callout */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{"\u{1F3AB}"}</span>
        <div>
          <p className="text-sm font-medium text-teal-300">
            Ticket issued to stealth address
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Ticket unlinkable to your wallet — anti-scalping by default
          </p>
        </div>
      </div>

      {/* Ticket details */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
        <div>
          <span className="text-sm text-[var(--text-secondary)]">
            {eventTitle}
          </span>
          <p className="text-xs mt-0.5">
            <span className={cn("font-medium", tierConfig.color)}>
              {tierConfig.label} Ticket
            </span>
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/20 border border-teal-500/30 text-teal-300">
          {"\u{1F512}"} Stealth Ticket
        </span>
      </div>
    </div>
  )
}
