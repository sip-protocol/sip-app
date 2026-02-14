"use client"

import { useState, useCallback } from "react"
import { GovernanceStats } from "@/components/governance/governance-stats"
import { ProposalList } from "@/components/governance/proposal-list"
import { VoteForm } from "@/components/governance/vote-form"
import { RevealForm } from "@/components/governance/reveal-form"
import { getProposal } from "@/lib/governance/constants"
import { useGovernanceHistoryStore } from "@/stores/governance-history"

type View = "dashboard" | "vote" | "reveal"

export function GovernancePageClient() {
  const [view, setView] = useState<View>("dashboard")
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null)
  const [activeVoteId, setActiveVoteId] = useState<string | null>(null)

  const { getVote, getVotesForProposal } = useGovernanceHistoryStore()

  const handleVote = useCallback((proposalId: string) => {
    setActiveProposalId(proposalId)
    setView("vote")
  }, [])

  const handleReveal = useCallback(
    (proposalId: string) => {
      const votes = getVotesForProposal(proposalId)
      const committed = votes.find((v) => v.status === "committed")
      if (committed) {
        setActiveVoteId(committed.id)
        setView("reveal")
      }
    },
    [getVotesForProposal]
  )

  const handleBack = useCallback(() => {
    setView("dashboard")
    setActiveProposalId(null)
    setActiveVoteId(null)
  }, [])

  // Vote form view
  if (view === "vote" && activeProposalId) {
    const proposal = getProposal(activeProposalId)
    if (!proposal) {
      return null
    }
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to proposals
        </button>
        <VoteForm proposal={proposal} onBack={handleBack} />
      </div>
    )
  }

  // Reveal form view
  if (view === "reveal" && activeVoteId) {
    const vote = getVote(activeVoteId)
    if (!vote) {
      return null
    }
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to proposals
        </button>
        <RevealForm vote={vote} onComplete={handleBack} />
      </div>
    )
  }

  // Dashboard view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Private Governance
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Vote on DAO proposals without revealing your choice until the reveal
          period. Powered by Pedersen commitments on Realms.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <GovernanceStats />
      </div>

      {/* Proposal List */}
      <ProposalList onVote={handleVote} onReveal={handleReveal} />

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-sip-purple-900/20 border border-sip-purple-800">
        <div className="flex gap-3">
          <span className="text-xl">🗳️</span>
          <div>
            <p className="font-medium text-sip-purple-100">
              Commit-Reveal Voting
            </p>
            <p className="text-sm text-sip-purple-300 mt-1">
              Your vote is hidden behind a Pedersen commitment until the reveal
              period. No one — not even validators — can see how you voted
              before reveals begin. Viewing keys allow selective disclosure for
              compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
