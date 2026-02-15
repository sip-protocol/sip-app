"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useFundProject } from "@/hooks/use-fund-project"
import { DeSciPrivacyToggle } from "./desci-privacy-toggle"
import { DeSciStatus } from "./desci-status"
import { StealthFundingDisplay } from "./stealth-funding-display"
import { FundingTierBadge } from "./funding-tier-badge"
import { RESEARCH_CATEGORY_LABELS } from "@/lib/desci/constants"
import type { Project, FundingTier } from "@/lib/desci/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const FUNDING_TIERS: { value: FundingTier; label: string }[] = [
  { value: "micro", label: "Micro" },
  { value: "seed", label: "Seed" },
  { value: "research", label: "Research" },
  { value: "grant", label: "Grant" },
]

interface FundFormProps {
  project: Project
  onFunded?: () => void
}

export function FundForm({ project, onFunded }: FundFormProps) {
  const { connected } = useWallet()

  const [tier, setTier] = useState<FundingTier>(project.tier)
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    fundProject,
    reset: resetFund,
  } = useFundProject()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const privacyLabel: Record<PrivacyOption, string> = {
    shielded: "\u{1F512} Shielded",
    compliant: "\u{1F441}\uFE0F Compliant",
    transparent: "\u{1F513} Transparent",
  }

  const isFormReady = connected && status === "idle"
  const isFunding =
    status === "selecting_project" ||
    status === "generating_stealth_funding" ||
    status === "funding"
  const isFunded = status === "funded"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await fundProject({
        projectId: project.id,
        tier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, project.id, tier, privacyLevel, fundProject, privacyMap]
  )

  const handleReset = useCallback(() => {
    resetFund()
    onFunded?.()
  }, [resetFund, onFunded])

  // Funded state
  if (isFunded && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <DeSciStatus currentStep="funded" mode="fund" />
        <StealthFundingDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          projectTitle={activeRecord.projectTitle ?? ""}
          tier={activeRecord.tier ?? "micro"}
        />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Project</span>
            <span className="text-lime-400 font-medium">{project.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Category</span>
            <span className="text-[var(--text-primary)]">
              {RESEARCH_CATEGORY_LABELS[project.category]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Tier</span>
            <FundingTierBadge tier={tier} />
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-sip-green-500 font-medium">
              {privacyLabel[privacyLevel]}
            </span>
          </div>
          {activeRecord.commitmentHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">
                Contribution ID
              </span>
              <code className="text-xs font-mono text-[var(--text-tertiary)]">
                {activeRecord.commitmentHash}
              </code>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Back to Projects
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
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{project.icon}</span>
          <h2 className="text-lg font-semibold">{project.title}</h2>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">
          {project.description}
        </p>
      </div>

      {/* Project details */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-tertiary)]">Category</p>
            <p className="font-semibold">
              {RESEARCH_CATEGORY_LABELS[project.category]}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Default Tier</p>
            <FundingTierBadge tier={project.tier} />
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Contributors</p>
            <p className="font-semibold">{project.contributorCount}</p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Status</p>
            <p className="font-semibold text-lime-400">
              {project.isActive ? "Active" : "Closed"}
            </p>
          </div>
        </div>
      </div>

      {/* Tier selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Funding Tier
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as FundingTier)}
          disabled={isFunding}
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
          disabled={isFunding}
        />
      </div>

      {/* Status (during fund) */}
      {isFunding && (
        <div className="mb-6">
          <DeSciStatus
            currentStep={
              status as
                | "selecting_project"
                | "generating_stealth_funding"
                | "funding"
            }
            mode="fund"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <DeSciStatus currentStep="failed" mode="fund" error={error} />
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
          : isFunding
            ? "Funding..."
            : "Fund Project"}
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
          <span className="text-[var(--text-primary)]">BIO Protocol</span>
        </div>
      </div>
    </form>
  )
}
