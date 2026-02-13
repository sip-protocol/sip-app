"use client"

import { cn } from "@/lib/utils"
import { DaoBadge } from "./dao-badge"
import { ProposalStatusBadge } from "./proposal-status-badge"
import type { Proposal } from "@/lib/governance/types"

interface ProposalCardProps {
  proposal: Proposal
  onVote?: (proposalId: string) => void
  onReveal?: (proposalId: string) => void
  hasCommittedVote?: boolean
  className?: string
}

function formatCountdown(targetTime: number): string {
  const diff = targetTime - Date.now()
  if (diff <= 0) return "Ended"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

export function ProposalCard({
  proposal,
  onVote,
  onReveal,
  hasCommittedVote,
  className,
}: ProposalCardProps) {
  const quorumPercent = Math.min(
    100,
    Math.round((proposal.totalVotes / proposal.quorum) * 100),
  )

  const deadlineTime =
    proposal.status === "voting" ? proposal.endTime : proposal.revealTime

  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5",
        "hover:border-[var(--border-hover)] hover:shadow-md transition-all",
        className,
      )}
    >
      {/* Header: DAO badge + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <DaoBadge
          name={proposal.daoName}
          icon={proposal.daoIcon}
          size="sm"
        />
        <ProposalStatusBadge status={proposal.status} />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
        {proposal.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-[var(--text-tertiary)] mb-4 line-clamp-2">
        {proposal.description}
      </p>

      {/* Quorum bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
          <span>{proposal.totalVotes} votes</span>
          <span>Quorum: {proposal.quorum}</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-sip-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${quorumPercent}%` }}
          />
        </div>
      </div>

      {/* Footer: deadline + CTA */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-tertiary)]">
          {formatCountdown(deadlineTime)}
        </span>

        {proposal.status === "voting" && onVote && (
          <button
            type="button"
            onClick={() => onVote(proposal.id)}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-sip-purple-600 text-white hover:bg-sip-purple-500 transition-colors"
          >
            Vote
          </button>
        )}

        {proposal.status === "reveal" && hasCommittedVote && onReveal && (
          <button
            type="button"
            onClick={() => onReveal(proposal.id)}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors"
          >
            Reveal
          </button>
        )}
      </div>
    </div>
  )
}
