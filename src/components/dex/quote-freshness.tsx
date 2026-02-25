"use client"

import { useCallback } from "react"
import type { QuoteFreshness } from "@/hooks"
import {
  ArrowsClockwiseIcon as RefreshIcon,
  ArrowsClockwiseIcon as AutoRefreshIcon,
  WarningIcon,
} from "@phosphor-icons/react"

interface QuoteStatusBadgeProps {
  freshness: QuoteFreshness
  expiresIn: number | null
  isLoading: boolean
  onRefresh: () => void
}

/**
 * Inline quote status for the swap card
 */
export function QuoteStatusBadge({
  freshness,
  expiresIn,
  isLoading,
  onRefresh,
}: QuoteStatusBadgeProps) {
  if (freshness === "fresh" && !isLoading) {
    return null // Don't show anything when fresh
  }

  const colorClass = {
    fresh: "text-green-400",
    stale: "text-amber-400",
    expired: "text-red-400",
  }[freshness]

  return (
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className={`flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80 ${colorClass}`}
    >
      {isLoading ? (
        <>
          <RefreshIcon size={12} className="animate-spin" />
          <span>Updating...</span>
        </>
      ) : freshness === "stale" ? (
        <>
          <WarningIcon size={12} />
          <span>Stale ({expiresIn}s)</span>
        </>
      ) : freshness === "expired" ? (
        <>
          <RefreshIcon size={12} />
          <span>Refresh quote</span>
        </>
      ) : null}
    </button>
  )
}

/**
 * Full quote freshness indicator with controls
 */
interface QuoteFreshnessIndicatorProps {
  freshness: QuoteFreshness
  expiresIn: number | null
  isLoading: boolean
  autoRefreshEnabled: boolean
  onRefresh: () => void
  onToggleAutoRefresh: (enabled: boolean) => void
  compact?: boolean
}

export function QuoteFreshnessIndicator({
  freshness,
  expiresIn,
  isLoading,
  autoRefreshEnabled,
  onRefresh,
  onToggleAutoRefresh,
  compact = false,
}: QuoteFreshnessIndicatorProps) {
  const handleRefresh = useCallback(() => {
    if (!isLoading) {
      onRefresh()
    }
  }, [isLoading, onRefresh])

  const toggleAutoRefresh = useCallback(() => {
    onToggleAutoRefresh(!autoRefreshEnabled)
  }, [autoRefreshEnabled, onToggleAutoRefresh])

  const colorClass = {
    fresh: "text-green-400",
    stale: "text-amber-400",
    expired: "text-red-400",
  }[freshness]

  const bgClass = {
    fresh: "bg-green-500/10 border-green-500/30",
    stale: "bg-amber-500/10 border-amber-500/30",
    expired: "bg-red-500/10 border-red-500/30",
  }[freshness]

  const dotClass = {
    fresh: "bg-green-400",
    stale: "bg-amber-400",
    expired: "bg-red-400",
  }[freshness]

  const statusText = {
    fresh: "Quote fresh",
    stale: "Quote stale",
    expired: "Quote expired",
  }[freshness]

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 ${colorClass}`}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${dotClass} ${freshness === "fresh" ? "animate-pulse" : ""}`}
          />
          {expiresIn !== null && expiresIn > 0 && (
            <span className="font-mono text-xs">{expiresIn}s</span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`rounded p-1 transition-colors ${
            isLoading ? "cursor-not-allowed opacity-50" : "hover:bg-gray-700/50"
          }`}
          title={isLoading ? "Refreshing..." : "Refresh quote"}
        >
          <RefreshIcon
            size={14}
            className={`text-gray-400 ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${bgClass}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${dotClass} ${freshness === "fresh" ? "animate-pulse" : ""}`}
        />
        <span className={`text-sm ${colorClass}`}>
          {statusText}
          {expiresIn !== null && expiresIn > 0 && (
            <span className="ml-1 font-mono">({expiresIn}s)</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleAutoRefresh}
          className={`flex items-center gap-1.5 text-xs transition-colors hover:text-white ${
            autoRefreshEnabled ? "text-green-400" : "text-gray-500"
          }`}
          title={
            autoRefreshEnabled ? "Disable auto-refresh" : "Enable auto-refresh"
          }
        >
          <AutoRefreshIcon size={14} />
          Auto
        </button>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${
            isLoading
              ? "cursor-not-allowed text-gray-500"
              : freshness === "expired"
                ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                : "text-gray-300 hover:bg-gray-700/50"
          }`}
        >
          <RefreshIcon
            size={14}
            className={isLoading ? "animate-spin" : ""}
          />
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  )
}

