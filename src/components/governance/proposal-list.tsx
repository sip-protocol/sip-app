"use client"

import { cn } from "@/lib/utils"
import { useProposals, type ProposalFilter } from "@/hooks/use-proposals"
import { useGovernanceHistoryStore } from "@/stores/governance-history"
import { ProposalCard } from "./proposal-card"

interface ProposalListProps {
  onVote?: (proposalId: string) => void
  onReveal?: (proposalId: string) => void
}

const FILTER_TABS: { value: ProposalFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "voting", label: "Voting" },
  { value: "reveal", label: "Reveal" },
  { value: "completed", label: "Completed" },
]

export function ProposalList({ onVote, onReveal }: ProposalListProps) {
  const {
    proposals,
    isLoading,
    filter,
    setFilter,
    daos,
    selectedDao,
    setSelectedDao,
  } = useProposals()

  const { votes } = useGovernanceHistoryStore()

  const committedProposalIds = new Set(
    votes
      .filter((v) => v.status === "committed")
      .map((v) => v.proposalId),
  )

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-sip-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">
          Loading proposals...
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
              filter === tab.value
                ? "bg-sip-purple-600 text-white"
                : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DAO filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedDao(null)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap",
            !selectedDao
              ? "bg-sip-purple-900/30 text-sip-purple-300 border border-sip-purple-500/30"
              : "bg-[var(--surface-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
          )}
        >
          All DAOs
        </button>
        {daos.map((dao) => (
          <button
            key={dao.id}
            type="button"
            onClick={() => setSelectedDao(dao.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap",
              selectedDao === dao.id
                ? "bg-sip-purple-900/30 text-sip-purple-300 border border-sip-purple-500/30"
                : "bg-[var(--surface-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
            )}
          >
            {dao.name}
          </button>
        ))}
      </div>

      {/* Proposal grid */}
      {proposals.length === 0 ? (
        <div className="text-center py-12 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl">
          <p className="text-4xl mb-4">🗳️</p>
          <p className="text-sm text-[var(--text-secondary)]">
            No proposals match your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={onVote}
              onReveal={onReveal}
              hasCommittedVote={committedProposalIds.has(proposal.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
