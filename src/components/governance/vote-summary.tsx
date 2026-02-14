"use client"

import { cn } from "@/lib/utils"

interface VoteSummaryProps {
  proposalTitle: string
  daoName: string
  choiceLabel: string
  weight: string
  privacyLabel: string
  className?: string
}

export function VoteSummary({
  proposalTitle,
  daoName,
  choiceLabel,
  weight,
  privacyLabel,
  className,
}: VoteSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4 space-y-2",
        className
      )}
    >
      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
        Vote Summary
      </p>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">DAO</span>
        <span className="text-[var(--text-primary)] font-medium">
          {daoName}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Proposal</span>
        <span className="text-[var(--text-primary)] font-medium truncate ml-4 max-w-[200px]">
          {proposalTitle}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Your Vote</span>
        <span className="text-sip-purple-400 font-medium">{choiceLabel}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Weight</span>
        <span className="text-[var(--text-primary)]">
          {Number(weight).toLocaleString()} tokens
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Privacy</span>
        <span className="text-sip-green-500 font-medium">{privacyLabel}</span>
      </div>
    </div>
  )
}
