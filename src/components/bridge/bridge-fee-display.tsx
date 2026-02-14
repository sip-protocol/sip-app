"use client"

import type { BridgeFeeEstimate } from "@/lib/bridge/types"
import { cn } from "@/lib/utils"

interface BridgeFeeDisplayProps {
  fee: BridgeFeeEstimate
  className?: string
}

export function BridgeFeeDisplay({ fee, className }: BridgeFeeDisplayProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4 space-y-2",
        className
      )}
    >
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Bridge Fee</span>
        <span className="text-[var(--text-primary)]">
          {fee.bridgeFee} {fee.token}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Gas Fee</span>
        <span className="text-[var(--text-primary)]">
          ~{fee.gasFee} {fee.token}
        </span>
      </div>
      <div className="border-t border-[var(--border-default)] pt-2 flex justify-between text-sm font-medium">
        <span className="text-[var(--text-primary)]">Total</span>
        <span className="text-cyan-400">
          {fee.totalFee} {fee.token}
        </span>
      </div>
    </div>
  )
}
