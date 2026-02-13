"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { truncate, copyToClipboard } from "@/lib/utils"
import type { SerializedEncryptedVote } from "@/lib/governance/types"

interface VoteCommitmentDisplayProps {
  encryptedVote: SerializedEncryptedVote
  revealDeadline?: number
  className?: string
}

function formatCountdown(targetTime: number): string {
  const diff = targetTime - Date.now()
  if (diff <= 0) return "Now"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function VoteCommitmentDisplay({
  encryptedVote,
  revealDeadline,
  className,
}: VoteCommitmentDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-sip-purple-800/50 bg-sip-purple-900/10 p-4",
        className,
      )}
    >
      {/* Hidden vote callout */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔒</span>
        <div>
          <p className="text-sm font-medium text-sip-purple-300">
            Your vote is hidden
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Encrypted with Pedersen commitment — invisible until reveal
          </p>
        </div>
      </div>

      {/* Commitment details */}
      <div className="space-y-2">
        {/* Ciphertext hash */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Commitment
          </span>
          <button
            type="button"
            onClick={() => handleCopy(encryptedVote.ciphertext, "ciphertext")}
            className="flex items-center gap-1.5 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(encryptedVote.ciphertext, 8, 6)}
            </code>
            <span className="text-xs text-[var(--text-tertiary)]">
              {copied === "ciphertext" ? "✓" : "📋"}
            </span>
          </button>
        </div>

        {/* Encryption key hash */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Key Hash
          </span>
          <button
            type="button"
            onClick={() =>
              handleCopy(encryptedVote.encryptionKeyHash, "keyHash")
            }
            className="flex items-center gap-1.5 group"
          >
            <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              {truncate(encryptedVote.encryptionKeyHash, 8, 6)}
            </code>
            <span className="text-xs text-[var(--text-tertiary)]">
              {copied === "keyHash" ? "✓" : "📋"}
            </span>
          </button>
        </div>

        {/* Proposal ID */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Proposal
          </span>
          <code className="text-xs font-mono text-[var(--text-tertiary)]">
            {encryptedVote.proposalId}
          </code>
        </div>

        {/* Reveal countdown */}
        {revealDeadline && (
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-default)]">
            <span className="text-xs text-[var(--text-secondary)]">
              Reveal available in
            </span>
            <span className="text-xs font-medium text-amber-400">
              {formatCountdown(revealDeadline)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
