"use client"

import { useState, useCallback } from "react"
import { VoteHistoryList } from "@/components/governance/vote-history-list"
import { RevealForm } from "@/components/governance/reveal-form"
import { useGovernanceHistoryStore } from "@/stores/governance-history"

export function VotePageClient() {
  const [revealingVoteId, setRevealingVoteId] = useState<string | null>(null)
  const { getVote } = useGovernanceHistoryStore()

  const handleReveal = useCallback((voteId: string) => {
    setRevealingVoteId(voteId)
  }, [])

  const handleBack = useCallback(() => {
    setRevealingVoteId(null)
  }, [])

  // Reveal form view
  if (revealingVoteId) {
    const vote = getVote(revealingVoteId)
    if (!vote) {
      setRevealingVoteId(null)
      return null
    }
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to votes
        </button>
        <RevealForm vote={vote} onComplete={handleBack} />
      </div>
    )
  }

  // History view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Your Votes</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Manage your committed and revealed votes. Reveal pending votes when
          the voting period ends.
        </p>
      </div>

      <VoteHistoryList onReveal={handleReveal} />
    </div>
  )
}
