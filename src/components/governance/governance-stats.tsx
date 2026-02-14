"use client"

import { useProposals } from "@/hooks/use-proposals"
import { useGovernanceHistoryStore } from "@/stores/governance-history"

export function GovernanceStats() {
  const { proposals, isLoading } = useProposals()
  const { votes } = useGovernanceHistoryStore()

  const activeDaos = new Set(
    proposals
      .filter((p) => p.status === "voting" || p.status === "reveal")
      .map((p) => p.daoId)
  ).size

  const openProposals = proposals.filter(
    (p) => p.status === "voting" || p.status === "reveal"
  ).length

  const yourVotes = votes.length
  const unrevealed = votes.filter((v) => v.status === "committed").length

  const stats = [
    { label: "Active DAOs", value: isLoading ? "..." : activeDaos.toString() },
    {
      label: "Open Proposals",
      value: isLoading ? "..." : openProposals.toString(),
    },
    { label: "Your Votes", value: yourVotes.toString() },
    { label: "Unrevealed", value: unrevealed.toString() },
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
