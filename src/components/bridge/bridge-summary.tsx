"use client"

import type { BridgeChainId, BridgeFeeEstimate } from "@/lib/bridge/types"
import { BRIDGE_CHAINS } from "@/lib/bridge/constants"
import type { PrivacyLevel } from "@sip-protocol/types"

interface BridgeSummaryProps {
  sourceChain: BridgeChainId
  destChain: BridgeChainId
  token: string
  amount: string
  privacyLevel: PrivacyLevel
  fee: BridgeFeeEstimate | null
  estimatedTime: number | null
}

export function BridgeSummary({
  sourceChain,
  destChain,
  token,
  amount,
  privacyLevel,
  fee,
  estimatedTime,
}: BridgeSummaryProps) {
  const source = BRIDGE_CHAINS[sourceChain]
  const dest = BRIDGE_CHAINS[destChain]

  const privacyLabel =
    privacyLevel === "shielded"
      ? "\uD83D\uDD12 Fully Shielded"
      : privacyLevel === "compliant"
        ? "\uD83D\uDC41\uFE0F Compliant"
        : "\uD83D\uDD13 Transparent"

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4 space-y-3">
      <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
        Transfer Summary
      </p>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Route</span>
        <span className="text-[var(--text-primary)] font-medium">
          {source.name} → {dest.name}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Amount</span>
        <span className="text-[var(--text-primary)] font-medium">
          {amount} {token}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Privacy</span>
        <span className="text-sip-green-500 font-medium">{privacyLabel}</span>
      </div>

      {estimatedTime && (
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Est. Time</span>
          <span className="text-[var(--text-primary)]">
            ~{estimatedTime} min
          </span>
        </div>
      )}

      {fee && (
        <>
          <div className="border-t border-[var(--border-default)] pt-2 flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Total Fee</span>
            <span className="text-cyan-400 font-medium">
              {fee.totalFee} {fee.token}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">You Receive</span>
            <span className="text-[var(--text-primary)] font-semibold">
              ~{(parseFloat(amount) - parseFloat(fee.totalFee)).toFixed(4)}{" "}
              {token}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
