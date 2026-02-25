"use client"

import { PrivacyLevel } from "@sip-protocol/types"
import { useSwapHistoryStore, type SwapRecord } from "@/stores"
import {
  ClockIcon,
  ArrowRightIcon,
  ShieldCheckIcon as ShieldIcon,
  ArrowSquareOutIcon as ExternalLinkIcon,
} from "@phosphor-icons/react"

/**
 * Recent Swaps History Component
 *
 * Displays user's recent swap history with status indicators.
 * Data persisted in localStorage via Zustand.
 */
export function RecentSwaps() {
  const { swaps } = useSwapHistoryStore()

  if (swaps.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
        <ClockIcon size={32} className="mx-auto mb-2 text-gray-600" />
        <p className="text-sm text-gray-400">No recent swaps</p>
        <p className="mt-1 text-xs text-gray-500">
          Your swap history will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <h4 className="mb-3 text-sm font-medium text-gray-300">Recent Swaps</h4>
      <div className="space-y-2">
        {swaps.slice(0, 5).map((swap) => (
          <SwapHistoryItem key={swap.id} swap={swap} />
        ))}
      </div>
    </div>
  )
}

function SwapHistoryItem({ swap }: { swap: SwapRecord }) {
  const isShielded = swap.privacyLevel !== PrivacyLevel.TRANSPARENT

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3">
      <div className="flex items-center gap-3">
        {/* Token pair */}
        <div className="flex items-center text-sm">
          <span className="font-medium text-white">{swap.fromToken}</span>
          <ArrowRightIcon size={12} className="mx-1.5 text-gray-500" />
          <span className="font-medium text-white">{swap.toToken}</span>
        </div>

        {/* Privacy indicator */}
        {isShielded && (
          <span className="flex items-center gap-1 rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] text-purple-400">
            <ShieldIcon size={10} />
            {swap.privacyLevel === PrivacyLevel.COMPLIANT
              ? "Compliant"
              : "Shielded"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Amount */}
        <div className="text-right">
          <p className="text-xs text-gray-400">
            {swap.fromAmount} → {swap.toAmount}
          </p>
          <p className="text-[10px] text-gray-500">
            {formatRelativeTime(swap.timestamp)}
          </p>
        </div>

        {/* Status badge */}
        <StatusBadge status={swap.status} />

        {/* Explorer link */}
        {swap.explorerUrl && (
          <a
            href={swap.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            title="View on explorer"
          >
            <ExternalLinkIcon size={16} />
          </a>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: SwapRecord["status"] }) {
  const config = {
    pending: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      label: "Pending",
    },
    completed: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      label: "Complete",
    },
    failed: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      label: "Failed",
    },
  }

  const { bg, text, label } = config[status]

  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  )
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return new Date(timestamp).toLocaleDateString()
}

