"use client"

import { cn } from "@/lib/utils"
import { truncate } from "@/lib/utils"
import { DaoBadge } from "./dao-badge"
import type { PrivateVoteRecord } from "@/lib/governance/types"

interface VoteHistoryCardProps {
  vote: PrivateVoteRecord
  onReveal?: (voteId: string) => void
  className?: string
}

export function VoteHistoryCard({
  vote,
  onReveal,
  className,
}: VoteHistoryCardProps) {
  const isCommitted = vote.status === "committed"
  const isRevealed = vote.status === "revealed"

  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5",
        "hover:border-[var(--border-hover)] transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <DaoBadge name={vote.daoName} icon="/tokens/sol.png" size="sm" />
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
            isCommitted && "bg-amber-500/20 border-amber-500/30 text-amber-300",
            isRevealed && "bg-sip-green-500/20 border-sip-green-500/30 text-sip-green-300",
            !isCommitted && !isRevealed && "bg-gray-500/20 border-gray-500/30 text-gray-400",
          )}
        >
          {isCommitted ? "Committed" : isRevealed ? "Revealed" : vote.status}
        </span>
      </div>

      {/* Proposal title */}
      <h4 className="font-medium text-sm mb-3 line-clamp-1">
        {vote.proposalTitle}
      </h4>

      {/* Details */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Choice</span>
          <span className={cn("font-medium", isRevealed ? "text-sip-green-400" : "text-sip-purple-400")}>
            {isRevealed ? vote.choiceLabel : "🔒 Hidden"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Weight</span>
          <span>
            {isRevealed
              ? `${Number(vote.revealedWeight || vote.weight).toLocaleString()} tokens`
              : "🔒 Hidden"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Commitment</span>
          <code className="font-mono text-[var(--text-tertiary)]">
            {truncate(vote.encryptedVote.ciphertext, 6, 4)}
          </code>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">
            {isRevealed ? "Revealed" : "Committed"}
          </span>
          <span className="text-[var(--text-tertiary)]">
            {new Date(
              isRevealed ? (vote.revealedAt ?? vote.startedAt) : (vote.committedAt ?? vote.startedAt),
            ).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Reveal CTA */}
      {isCommitted && onReveal && (
        <button
          type="button"
          onClick={() => onReveal(vote.id)}
          className="w-full mt-4 py-2 px-4 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors"
        >
          Reveal Vote
        </button>
      )}
    </div>
  )
}
