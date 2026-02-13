import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Private Vote",
  description: "Cast hidden votes using Pedersen commit-reveal on Realms DAOs.",
}

export default function GovernanceVotePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Private Vote</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Select a proposal, commit your vote privately, and reveal it when the
          voting period ends.
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">🗳️</p>
        <h2 className="text-lg font-semibold mb-2">No active proposals</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Browse DAOs to find proposals you can vote on. Your votes are hidden
          behind Pedersen commitments until the reveal phase.
        </p>
      </div>
    </div>
  )
}
