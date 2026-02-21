"use client"

import { useState, useEffect } from "react"
import { useChannelHistoryStore } from "@/stores/channel-history"
import { DripReader } from "@/lib/channel/drip-reader"
import { cn } from "@/lib/utils"
import type { Drop } from "@/lib/channel/types"

export function ChannelStats() {
  const { subscriptions } = useChannelHistoryStore()
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadDrops() {
      setLoading(true)
      const reader = new DripReader("drip")
      const result = await reader.getDrops()
      if (!cancelled) {
        setDrops(result)
        setIsLive(result.some((d) => d.id.length >= 32))
        setLoading(false)
      }
    }
    loadDrops()
    return () => { cancelled = true }
  }, [])

  const subscribed = subscriptions.filter((s) => s.isActive).length
  const dropCount = drops.length
  const encrypted = drops.filter((d) => d.isEncrypted).length
  const highestTier =
    subscriptions.length > 0
      ? subscriptions.some((s) => s.accessTier === "premium")
        ? "Premium"
        : subscriptions.some((s) => s.accessTier === "subscriber")
          ? "Subscriber"
          : "Free"
      : "None"

  const stats = [
    { label: "Subscribed", value: subscribed.toString() },
    { label: "Drops", value: loading ? "-" : dropCount.toString() },
    { label: "Encrypted", value: loading ? "-" : encrypted.toString() },
    { label: "Access Tier", value: highestTier },
  ]

  return (
    <div>
      {/* Mode indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isLive ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
          )}
        />
        <span className="text-xs text-[var(--text-tertiary)]">
          {isLive ? "Live from Helius DAS" : "Simulation"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 text-center",
              loading && stat.value === "-" && "animate-pulse"
            )}
          >
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
