"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { truncate } from "@/lib/utils"
import type { Migration, MigrationStep } from "@/lib/migrations/types"

interface MigrationHistoryCardProps {
  migration: Migration
}

function getStatusConfig(status: MigrationStep): {
  label: string
  color: string
  bgColor: string
} {
  switch (status) {
    case "complete":
      return {
        label: "Complete",
        color: "text-green-400",
        bgColor: "bg-green-500/10",
      }
    case "failed":
      return {
        label: "Failed",
        color: "text-red-400",
        bgColor: "bg-red-500/10",
      }
    case "scanning_wallet":
    case "generating_stealth":
    case "withdrawing_from_source":
    case "depositing_to_sunrise":
      return {
        label: "In Progress",
        color: "text-green-400",
        bgColor: "bg-green-500/10",
      }
    default:
      return {
        label: "Unknown",
        color: "text-gray-400",
        bgColor: "bg-gray-500/10",
      }
  }
}

export function MigrationHistoryCard({ migration }: MigrationHistoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const statusConfig = getStatusConfig(migration.status)

  const sourceName =
    migration.source.protocol?.name ?? "Manual SOL"

  const timestamp = new Date(migration.startedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      {/* Main row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--surface-secondary)] transition-colors"
      >
        {/* Source */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {sourceName}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">
            {"\u2192"}
          </span>
          <span className="text-sm font-medium text-green-400">
            Sunrise
          </span>
        </div>

        {/* Amount */}
        <div className="flex-1 text-right">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {migration.amount} SOL
          </span>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-full",
            statusConfig.color,
            statusConfig.bgColor
          )}
        >
          {statusConfig.label}
        </span>

        {/* Expand icon */}
        <span
          className={cn(
            "text-[var(--text-tertiary)] text-xs transition-transform",
            expanded && "rotate-180"
          )}
        >
          {"\u25BC"}
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[var(--border-default)] p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Date</span>
            <span className="text-[var(--text-primary)]">{timestamp}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-green-500">
              {migration.privacyLevel === "shielded"
                ? "\uD83D\uDD12 Shielded"
                : migration.privacyLevel === "compliant"
                  ? "\uD83D\uDC41\uFE0F Compliant"
                  : "\uD83D\uDD13 Transparent"}
            </span>
          </div>

          {migration.gsolAmount && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">gSOL Received</span>
              <span className="text-green-400 font-medium">
                {migration.gsolAmount} gSOL
              </span>
            </div>
          )}

          {migration.carbonOffsetKg != null && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Carbon Offset</span>
              <span className="text-green-400 font-medium">
                {migration.carbonOffsetKg.toFixed(4)} kg/year
              </span>
            </div>
          )}

          {migration.stealthAddress && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">
                Stealth Address
              </span>
              <code className="font-mono text-xs text-green-400">
                {truncate(migration.stealthAddress, 12, 8)}
              </code>
            </div>
          )}

          {migration.withdrawTxHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Withdraw TX</span>
              <code className="font-mono text-xs text-[var(--text-tertiary)]">
                {truncate(migration.withdrawTxHash, 8, 6)}
              </code>
            </div>
          )}

          {migration.depositTxHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Deposit TX</span>
              <code className="font-mono text-xs text-[var(--text-tertiary)]">
                {truncate(migration.depositTxHash, 8, 6)}
              </code>
            </div>
          )}

          {migration.error && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-300">{migration.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
