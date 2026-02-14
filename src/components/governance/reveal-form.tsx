"use client"

import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { truncate } from "@/lib/utils"
import { useGovernanceVote } from "@/hooks/use-governance-vote"
import { DaoBadge } from "./dao-badge"
import { VoteStatus } from "./vote-status"
import type { PrivateVoteRecord } from "@/lib/governance/types"

interface RevealFormProps {
  vote: PrivateVoteRecord
  daoIcon?: string
  onComplete?: () => void
}

export function RevealForm({ vote, daoIcon, onComplete }: RevealFormProps) {
  const { status, activeVote, error, revealVote } = useGovernanceVote()

  const isRevealing = status === "revealing"
  const isRevealed = status === "revealed"

  const handleReveal = useCallback(async () => {
    const result = await revealVote(vote.id)
    if (result && onComplete) {
      onComplete()
    }
  }, [vote.id, revealVote, onComplete])

  // Revealed state
  if (isRevealed && activeVote) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <VoteStatus currentStep="revealed" mode="reveal" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Your Vote</span>
            <span className="text-sip-green-400 font-medium">
              {activeVote.choiceLabel}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Weight</span>
            <span>{Number(activeVote.weight).toLocaleString()} tokens</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Proposal</span>
            <span className="truncate ml-4 max-w-[200px]">
              {activeVote.proposalTitle}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <DaoBadge
          name={vote.daoName}
          icon={daoIcon ?? "/tokens/sol.png"}
          size="md"
        />
        <h3 className="text-lg font-semibold mt-3 mb-1">
          {vote.proposalTitle}
        </h3>
        <p className="text-sm text-[var(--text-tertiary)]">
          Your committed vote is ready to be revealed
        </p>
      </div>

      {/* Committed vote summary */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4 space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Your Vote</span>
          <span className="text-sip-purple-400 font-medium">🔒 Hidden</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Commitment</span>
          <code className="text-xs font-mono text-[var(--text-tertiary)]">
            {truncate(vote.encryptedVote.ciphertext, 8, 6)}
          </code>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Committed</span>
          <span className="text-xs text-[var(--text-tertiary)]">
            {vote.committedAt
              ? new Date(vote.committedAt).toLocaleString()
              : "—"}
          </span>
        </div>
      </div>

      {/* Reveal status */}
      {isRevealing && (
        <div className="mb-6">
          <VoteStatus
            currentStep={activeVote?.status ?? "revealing"}
            mode="reveal"
          />
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="mb-6">
          <VoteStatus currentStep="failed" mode="reveal" error={error} />
        </div>
      )}

      {/* Reveal Button */}
      <button
        type="button"
        onClick={handleReveal}
        disabled={isRevealing}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isRevealing
            ? "bg-amber-600/30 text-white/50 cursor-not-allowed"
            : "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500 hover:to-amber-600"
        )}
      >
        {isRevealing ? "Revealing..." : "Reveal Your Vote"}
      </button>

      <p className="text-xs text-[var(--text-tertiary)] text-center mt-4">
        Revealing decrypts your vote and verifies the Pedersen commitment
        on-chain
      </p>
    </div>
  )
}
