"use client"

import { useDeSciHistoryStore } from "@/stores/desci-history"
import { SAMPLE_PROJECTS } from "@/lib/desci/constants"

export function DeSciStats() {
  const { contributions, actions } = useDeSciHistoryStore()

  const projectsFunded = contributions.length
  const reviewsGiven = actions.filter(
    (a) => a.type === "review" && a.status === "reviewed"
  ).length
  const activeProjects = SAMPLE_PROJECTS.filter((p) => p.isActive).length
  const topTier =
    contributions.length > 0
      ? contributions.some((c) => c.tier === "grant")
        ? "Grant"
        : contributions.some((c) => c.tier === "research")
          ? "Research"
          : contributions.some((c) => c.tier === "seed")
            ? "Seed"
            : "Micro"
      : "None"

  const stats = [
    { label: "Projects Funded", value: projectsFunded.toString() },
    { label: "Reviews Given", value: reviewsGiven.toString() },
    { label: "Active Projects", value: activeProjects.toString() },
    { label: "Top Tier", value: topTier },
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
