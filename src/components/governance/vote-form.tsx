"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useGovernanceVote } from "@/hooks/use-governance-vote"
import { useVoterWeight } from "@/hooks/use-voter-weight"
import { DaoBadge } from "./dao-badge"
import { ProposalStatusBadge } from "./proposal-status-badge"
import { VoteChoiceSelector } from "./vote-choice-selector"
import { GovernancePrivacyToggle } from "./governance-privacy-toggle"
import { VoteSummary } from "./vote-summary"
import { VoteStatus } from "./vote-status"
import { VoteCommitmentDisplay } from "./vote-commitment-display"
import type { Proposal } from "@/lib/governance/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface VoteFormProps {
  proposal: Proposal
  onBack?: () => void
}

export function VoteForm({ proposal, onBack }: VoteFormProps) {
  const { connected } = useWallet()

  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeVote,
    error,
    commitVote,
    reset: resetVote,
  } = useGovernanceVote()

  const { weight } = useVoterWeight(proposal.daoId)

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const privacyLabel: Record<PrivacyOption, string> = {
    shielded: "🔒 Shielded",
    compliant: "👁️ Compliant",
    transparent: "🔓 Transparent",
  }

  const isFormReady =
    connected &&
    selectedChoice !== null &&
    weight &&
    BigInt(weight) > BigInt(0) &&
    status === "idle"

  const isCommitting = status === "encrypting" || status === "committing"

  const isCommitted = status === "committed"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || selectedChoice === null || !weight) return

      await commitVote({
        proposalId: proposal.id,
        choice: selectedChoice,
        weight,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [
      isFormReady,
      selectedChoice,
      weight,
      proposal.id,
      privacyLevel,
      commitVote,
      privacyMap,
    ]
  )

  const handleReset = useCallback(() => {
    resetVote()
    setSelectedChoice(null)
  }, [resetVote])

  // Committed state
  if (isCommitted && activeVote) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <VoteStatus currentStep="committed" mode="commit" />
        <VoteCommitmentDisplay
          encryptedVote={activeVote.encryptedVote}
          revealDeadline={proposal.endTime}
        />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Your Choice</span>
            <span className="text-sip-purple-400 font-medium">
              🔒 Hidden until reveal
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">DAO</span>
            <span>{proposal.daoName}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            Vote on Another Proposal
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
            >
              Back
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {/* Proposal Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <DaoBadge name={proposal.daoName} icon={proposal.daoIcon} />
          <ProposalStatusBadge status={proposal.status} />
        </div>
        <h2 className="text-lg font-semibold mb-1">{proposal.title}</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          {proposal.description}
        </p>
      </div>

      {/* Vote Choice Selector */}
      <div className="mb-6">
        <VoteChoiceSelector
          choices={proposal.choices}
          selected={selectedChoice}
          onSelect={setSelectedChoice}
          weight={weight}
          disabled={isCommitting}
        />
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <GovernancePrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isCommitting}
        />
      </div>

      {/* Pre-submit Summary */}
      {isFormReady && selectedChoice !== null && weight && (
        <div className="mb-6">
          <VoteSummary
            proposalTitle={proposal.title}
            daoName={proposal.daoName}
            choiceLabel={proposal.choices[selectedChoice]}
            weight={weight}
            privacyLabel={privacyLabel[privacyLevel]}
          />
        </div>
      )}

      {/* Vote Status (during commit) */}
      {isCommitting && (
        <div className="mb-6">
          <VoteStatus
            currentStep={activeVote?.status ?? "encrypting"}
            mode="commit"
          />
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="mb-6">
          <VoteStatus currentStep="failed" mode="commit" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-sip-purple-600 to-sip-purple-700 text-white hover:from-sip-purple-500 hover:to-sip-purple-600"
            : "bg-sip-purple-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet to Vote"
          : isCommitting
            ? "Committing Vote..."
            : selectedChoice === null
              ? "Select Your Vote"
              : "Commit Vote"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Privacy</span>
          <span className="text-sip-green-500 font-medium">
            {privacyLabel[privacyLevel]}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">
            Pedersen Commitments
          </span>
        </div>
      </div>
    </form>
  )
}
