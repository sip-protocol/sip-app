"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useReviewProject } from "@/hooks/use-review-project"
import { DeSciPrivacyToggle } from "./desci-privacy-toggle"
import { DeSciStatus } from "./desci-status"
import { StealthFundingDisplay } from "./stealth-funding-display"
import {
  FUNDING_TIER_COLORS,
  SAMPLE_CONTRIBUTIONS,
} from "@/lib/desci/constants"
import type { FundingTier } from "@/lib/desci/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const FUNDING_TIERS: { value: FundingTier; label: string }[] = [
  { value: "micro", label: "Micro" },
  { value: "seed", label: "Seed" },
  { value: "research", label: "Research" },
  { value: "grant", label: "Grant" },
]

interface ReviewFormProps {
  onReviewed?: () => void
}

export function ReviewForm({ onReviewed }: ReviewFormProps) {
  const { connected } = useWallet()

  const [tier, setTier] = useState<FundingTier>("micro")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    reviewProject,
    reset: resetReview,
  } = useReviewProject()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  // Use the first contribution as the reviewable project
  const reviewableProject = SAMPLE_CONTRIBUTIONS[0]

  const isFormReady = connected && status === "idle" && reviewableProject
  const isReviewing =
    status === "generating_proof" || status === "submitting_review"
  const isReviewed = status === "reviewed"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || !reviewableProject) return

      await reviewProject({
        projectId: reviewableProject.projectId,
        tier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [
      isFormReady,
      reviewableProject,
      tier,
      privacyLevel,
      reviewProject,
      privacyMap,
    ]
  )

  const handleReset = useCallback(() => {
    resetReview()
    setTier("micro")
    onReviewed?.()
  }, [resetReview, onReviewed])

  // Reviewed state
  if (isReviewed && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <DeSciStatus currentStep="reviewed" mode="review" />
        <StealthFundingDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          projectTitle={activeRecord.projectTitle ?? ""}
          tier={activeRecord.tier ?? "micro"}
        />

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Review Another Project
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Anonymous Peer Review</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Submit anonymous peer reviews via stealth identity — reviewers remain
          unlinkable to prevent retaliation or bias
        </p>
      </div>

      {/* Reviewable project */}
      {reviewableProject ? (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sip-green-400">
                Project Available
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Project:{" "}
                {reviewableProject.projectId
                  .replace("project-", "")
                  .replace(/-/g, " ")}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                FUNDING_TIER_COLORS[reviewableProject.tier].bg,
                FUNDING_TIER_COLORS[reviewableProject.tier].color
              )}
            >
              {FUNDING_TIER_COLORS[reviewableProject.tier].label}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No projects to review. Fund a project first!
          </p>
        </div>
      )}

      {/* Tier selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Funding Tier
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as FundingTier)}
          disabled={isReviewing}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-lime-500 transition-colors"
        >
          {FUNDING_TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <DeSciPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isReviewing}
        />
      </div>

      {/* Status (during review) */}
      {isReviewing && (
        <div className="mb-6">
          <DeSciStatus
            currentStep={status as "generating_proof" | "submitting_review"}
            mode="review"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <DeSciStatus currentStep="failed" mode="review" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-lime-500 to-lime-700 text-white hover:from-lime-400 hover:to-lime-600"
            : "bg-lime-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet"
          : isReviewing
            ? "Reviewing..."
            : "Submit Review"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Review</span>
          <span className="text-lime-400 font-medium">
            Anonymous Peer Review
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">BIO Protocol</span>
        </div>
      </div>
    </form>
  )
}
