"use client"

import { ArrowRightIcon } from "@phosphor-icons/react"
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
      <ArrowRightIcon size={16} className="text-cyan-500" />
      <span className="text-[var(--text-primary)]">{dest.name}</span>
    </div>
  )
}

