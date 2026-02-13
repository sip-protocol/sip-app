"use client"

import { BRIDGE_CHAINS } from "@/lib/bridge/constants"
import type { BridgeChainId } from "@/lib/bridge/types"
import { cn } from "@/lib/utils"

interface ChainPairDisplayProps {
  sourceChain: BridgeChainId
  destChain: BridgeChainId
  className?: string
}

export function ChainPairDisplay({
  sourceChain,
  destChain,
  className,
}: ChainPairDisplayProps) {
  const source = BRIDGE_CHAINS[sourceChain]
  const dest = BRIDGE_CHAINS[destChain]

  return (
    <div
      className={cn("flex items-center gap-2 text-sm font-medium", className)}
    >
      <span className="text-[var(--text-primary)]">{source.name}</span>
      <ArrowIcon className="w-4 h-4 text-cyan-500" />
      <span className="text-[var(--text-primary)]">{dest.name}</span>
    </div>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  )
}
