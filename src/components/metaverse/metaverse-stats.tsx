"use client"

import { useMetaverseHistoryStore } from "@/stores/metaverse-history"
import { SAMPLE_WORLDS } from "@/lib/metaverse/constants"

export function MetaverseStats() {
  const { visits, actions } = useMetaverseHistoryStore()

  const worldsVisited = visits.length
  const teleports = actions.filter(
    (a) => a.type === "teleport" && a.status === "arrived"
  ).length
  const activeWorlds = SAMPLE_WORLDS.filter((w) => w.isActive).length
  const bestAvatar =
    visits.length > 0
      ? visits.some((v) => v.tier === "vip")
        ? "VIP"
        : visits.some((v) => v.tier === "merchant")
          ? "Merchant"
          : visits.some((v) => v.tier === "warrior")
            ? "Warrior"
            : visits.some((v) => v.tier === "citizen")
              ? "Citizen"
              : "Explorer"
      : "None"

  const stats = [
    { label: "Worlds Visited", value: worldsVisited.toString() },
    { label: "Teleports", value: teleports.toString() },
    { label: "Active Worlds", value: activeWorlds.toString() },
    { label: "Best Avatar", value: bestAvatar },
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
