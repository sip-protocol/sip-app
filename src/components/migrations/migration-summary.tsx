"use client"

import type { PrivacyLevel } from "@sip-protocol/types"
import { estimateCarbonOffset } from "@/lib/migrations/constants"

interface MigrationSummaryProps {
  source: string
  amount: string
  privacyLevel: PrivacyLevel
}

export function MigrationSummary({
  source,
  amount,
  privacyLevel,
}: MigrationSummaryProps) {
  const numAmount = parseFloat(amount)
  const carbonKg = estimateCarbonOffset(numAmount)

  const privacyLabel =
    privacyLevel === "shielded"
      ? "\uD83D\uDD12 Fully Shielded"
      : privacyLevel === "compliant"
        ? "\uD83D\uDC41\uFE0F Compliant"
        : "\uD83D\uDD13 Transparent"

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4 space-y-3">
      <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
        Migration Summary
      </p>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Source</span>
        <span className="text-[var(--text-primary)] font-medium">{source}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Amount</span>
        <span className="text-[var(--text-primary)] font-medium">
          {amount} SOL
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Privacy</span>
        <span className="text-green-500 font-medium">{privacyLabel}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">You Receive</span>
        <span className="text-[var(--text-primary)] font-semibold">
          ~{numAmount.toFixed(4)} gSOL
        </span>
      </div>

      <div className="border-t border-[var(--border-default)] pt-2 flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Carbon Offset</span>
        <span className="text-green-400 font-medium">
          ~{carbonKg.toFixed(4)} kg CO2/year
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Destination</span>
        <span className="text-green-400 font-medium">Sunrise Stake</span>
      </div>
    </div>
  )
}
