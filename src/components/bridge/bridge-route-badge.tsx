"use client"

import type { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"

interface BridgeRouteBadgeProps {
  estimatedTime: number | null
  privacyLevel: PrivacyLevel
  className?: string
}

export function BridgeRouteBadge({
  estimatedTime,
  privacyLevel,
  className,
}: BridgeRouteBadgeProps) {
  const isPrivate = privacyLevel !== "transparent"

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl",
        "bg-[var(--surface-secondary)] border border-[var(--border-default)]",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <WormholeIcon className="w-4 h-4 text-cyan-500" />
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          Via Wormhole NTT
        </span>
      </div>

      {estimatedTime && (
        <span className="text-xs text-[var(--text-tertiary)]">
          ~{estimatedTime}min
        </span>
      )}

      {isPrivate && (
        <span className="ml-auto flex items-center gap-1 text-xs font-medium text-sip-green-500">
          <span>
            {privacyLevel === "shielded"
              ? "\uD83D\uDD12"
              : "\uD83D\uDC41\uFE0F"}
          </span>
          {privacyLevel === "shielded" ? "Stealth" : "Compliant"}
        </span>
      )}
    </div>
  )
}

function WormholeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" opacity="0.2" />
      <circle cx="12" cy="12" r="6" opacity="0.4" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}
