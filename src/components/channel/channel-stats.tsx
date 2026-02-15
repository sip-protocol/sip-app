"use client"

import { useChannelHistoryStore } from "@/stores/channel-history"
import { SAMPLE_DROPS } from "@/lib/channel/constants"

export function ChannelStats() {
  const { subscriptions } = useChannelHistoryStore()

  const subscribed = subscriptions.filter((s) => s.isActive).length
  const drops = SAMPLE_DROPS.length
  const encrypted = SAMPLE_DROPS.filter((d) => d.isEncrypted).length
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
    { label: "Drops", value: drops.toString() },
    { label: "Encrypted", value: encrypted.toString() },
    { label: "Access Tier", value: highestTier },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
