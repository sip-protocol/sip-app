"use client"

import { useMemo, useState } from "react"
import { cn, truncate } from "@/lib/utils"
import { usePaymentHistoryStore } from "@/stores/payment-history"
import { useSwapHistoryStore } from "@/stores/swap-history"
import { useGovernanceHistoryStore } from "@/stores/governance-history"

interface AuditEntry {
  id: string
  type: "payment" | "swap" | "vote"
  label: string
  detail: string
  status: string
  timestamp: number
  txSignature?: string
  privacyLevel?: string
}

type AuditFilter = "all" | "payments" | "swaps" | "votes"

interface AuditTrailProps {
  walletAddress: string | null
}

const TYPE_STYLES: Record<AuditEntry["type"], string> = {
  payment: "bg-green-500/10 text-green-400 border border-green-500/20",
  swap: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  vote: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
    case "revealed":
      return "text-green-400"
    case "committed":
    case "pending":
      return "text-amber-400"
    case "failed":
      return "text-red-400"
    default:
      return "text-[var(--text-secondary)]"
  }
}

function formatTimestamp(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

export function AuditTrail({ walletAddress }: AuditTrailProps) {
  const [filter, setFilter] = useState<AuditFilter>("all")

  const payments = usePaymentHistoryStore((s) => s.getAll(walletAddress ?? ""))
  const swaps = useSwapHistoryStore((s) => s.swaps)
  const votes = useGovernanceHistoryStore((s) => s.votes)

  const entries = useMemo<AuditEntry[]>(() => {
    const result: AuditEntry[] = []

    for (const p of payments) {
      result.push({
        id: p.id,
        type: "payment",
        label: `${p.type === "sent" ? "Sent" : "Claimed"} ${p.amount} ${p.token}`,
        detail: truncate(p.stealthAddress, 8, 6),
        status: "completed",
        timestamp: p.timestamp,
        txSignature: p.txSignature,
      })
    }

    for (const s of swaps) {
      result.push({
        id: s.id,
        type: "swap",
        label: `${s.fromToken} \u2192 ${s.toToken}`,
        detail: `${s.fromAmount} ${s.fromToken} \u2192 ${s.toAmount} ${s.toToken}`,
        status: s.status,
        timestamp: s.timestamp,
        txSignature: s.txHash,
        privacyLevel: s.privacyLevel,
      })
    }

    for (const v of votes) {
      const proposalSnippet = truncate(v.proposalId, 12, 0).replace(/\.+$/, "")
      result.push({
        id: v.id,
        type: "vote",
        label: `Vote on ${proposalSnippet}...`,
        detail: v.status === "revealed" && v.revealedChoice !== undefined
          ? v.choiceLabel
          : "Encrypted",
        status: v.status,
        timestamp: v.startedAt,
        txSignature: v.txSignature,
        privacyLevel: v.privacyLevel,
      })
    }

    return result.sort((a, b) => b.timestamp - a.timestamp)
  }, [payments, swaps, votes])

  const filtered = useMemo(() => {
    if (filter === "all") return entries
    if (filter === "payments") return entries.filter((e) => e.type === "payment")
    if (filter === "swaps") return entries.filter((e) => e.type === "swap")
    return entries.filter((e) => e.type === "vote")
  }, [entries, filter])

  const tabs: { value: AuditFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "payments", label: "Payments" },
    { value: "swaps", label: "Swaps" },
    { value: "votes", label: "Votes" },
  ]

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl">
        <p className="text-4xl mb-4">📋</p>
        <h3 className="text-lg font-semibold mb-2">No transactions</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Your payment, swap, and governance activity will appear here as a
          unified audit trail.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === tab.value
                ? "bg-sip-purple-600 text-white"
                : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-4 p-4 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full shrink-0",
                  TYPE_STYLES[entry.type]
                )}
              >
                {entry.type}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{entry.label}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {entry.detail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className={cn("text-xs font-medium capitalize", getStatusColor(entry.status))}>
                {entry.status}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {formatTimestamp(entry.timestamp)}
              </span>
              {entry.txSignature && (
                <a
                  href={`https://solscan.io/tx/${entry.txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sip-purple-400 hover:text-sip-purple-300 transition-colors"
                >
                  Tx
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
