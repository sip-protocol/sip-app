"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { truncate } from "@/lib/utils"
import { BRIDGE_CHAINS } from "@/lib/bridge/constants"
import type { BridgeTransfer, BridgeStep } from "@/lib/bridge/types"

interface BridgeHistoryCardProps {
  transfer: BridgeTransfer
}

function getStatusConfig(status: BridgeStep): {
  label: string
  color: string
  bgColor: string
} {
  switch (status) {
    case "complete":
      return {
        label: "Complete",
        color: "text-sip-green-400",
        bgColor: "bg-sip-green-500/10",
      }
    case "failed":
      return {
        label: "Failed",
        color: "text-red-400",
        bgColor: "bg-red-500/10",
      }
    case "generating_stealth":
    case "initiating_transfer":
    case "awaiting_attestation":
    case "relaying":
      return {
        label: "In Progress",
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
      }
    default:
      return {
        label: "Unknown",
        color: "text-gray-400",
        bgColor: "bg-gray-500/10",
      }
  }
}

export function BridgeHistoryCard({ transfer }: BridgeHistoryCardProps) {
  const [expanded, setExpanded] = useState(false)

  const source = BRIDGE_CHAINS[transfer.sourceChain]
  const dest = BRIDGE_CHAINS[transfer.destChain]
  const statusConfig = getStatusConfig(transfer.status)

  const timestamp = new Date(transfer.startedAt).toLocaleDateString("en-US", {
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
        {/* Chain icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {source.name}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">{"\u2192"}</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {dest.name}
          </span>
        </div>

        {/* Amount */}
        <div className="flex-1 text-right">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {transfer.amount} {transfer.token}
          </span>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-full",
            statusConfig.color,
            statusConfig.bgColor,
          )}
        >
          {statusConfig.label}
        </span>

        {/* Expand icon */}
        <span
          className={cn(
            "text-[var(--text-tertiary)] text-xs transition-transform",
            expanded && "rotate-180",
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
            <span className="text-sip-green-500">
              {transfer.privacyLevel === "shielded"
                ? "\uD83D\uDD12 Shielded"
                : transfer.privacyLevel === "compliant"
                  ? "\uD83D\uDC41\uFE0F Compliant"
                  : "\uD83D\uDD13 Transparent"}
            </span>
          </div>

          {transfer.stealthAddress && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">
                Stealth Address
              </span>
              <code className="font-mono text-xs text-cyan-400">
                {truncate(transfer.stealthAddress, 12, 8)}
              </code>
            </div>
          )}

          {transfer.sourceTxHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Source TX</span>
              <a
                href={`${source.explorerUrl}/tx/${transfer.sourceTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-sip-purple-400 hover:underline"
              >
                {truncate(transfer.sourceTxHash, 8, 6)}
              </a>
            </div>
          )}

          {transfer.destTxHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Dest TX</span>
              <a
                href={`${dest.explorerUrl}/tx/${transfer.destTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-sip-purple-400 hover:underline"
              >
                {truncate(transfer.destTxHash, 8, 6)}
              </a>
            </div>
          )}

          {transfer.wormholeMessageId && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">
                Wormhole Message
              </span>
              <code className="font-mono text-xs text-[var(--text-tertiary)]">
                {transfer.wormholeMessageId}
              </code>
            </div>
          )}

          {transfer.error && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-300">{transfer.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
