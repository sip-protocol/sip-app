"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { ClaimButton } from "./claim-button"
import type { DetectedPayment } from "@/hooks/use-scan-payments"
import { cn } from "@/lib/utils"

type TransactionType = "all" | "received" | "sent"
type TransactionStatus = "all" | "pending" | "claimed" | "confirmed"
type SortOrder = "newest" | "oldest" | "amount-high" | "amount-low"

interface SentPayment {
  id: string
  recipient: string
  amount: number
  token: string
  timestamp: number
  status: "pending" | "confirmed" | "failed"
  txHash: string
}

interface PaymentListProps {
  payments: DetectedPayment[]
  sentPayments?: SentPayment[]
  onClaim: (paymentId: string) => Promise<void>
  className?: string
  pageSize?: number
}

// Format relative date outside component to avoid impure function during render
function formatRelativeDate(timestamp: number, now: number): string {
  const diff = now - timestamp

  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  }
  const days = Math.floor(diff / 86400000)
  return `${days} day${days !== 1 ? "s" : ""} ago`
}

export function PaymentList({
  payments,
  sentPayments = [],
  onClaim,
  className,
  pageSize = 10,
}: PaymentListProps) {
  // Use state to store the current time, initialized once
  const [now, setNow] = useState(() => Date.now())

  // Filters
  const [txType, setTxType] = useState<TransactionType>("all")
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>("all")
  const [tokenFilter, setTokenFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  // Track previous filter state to reset page when filters change
  const filterKey = `${txType}-${statusFilter}-${tokenFilter}-${sortOrder}`
  const prevFilterKeyRef = useRef(filterKey)

  // Update time when payments change (deferred to avoid sync setState in effect)
  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()))
  }, [payments, sentPayments])

  // Reset page when filters change
  useEffect(() => {
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey
      queueMicrotask(() => setCurrentPage(1))
    }
  }, [filterKey])

  // Get unique tokens for filter
  const uniqueTokens = useMemo(() => {
    const tokens = new Set<string>()
    payments.forEach((p) => tokens.add(p.token))
    sentPayments.forEach((p) => tokens.add(p.token))
    return Array.from(tokens).sort()
  }, [payments, sentPayments])

  // Combined and filtered transactions
  const filteredTransactions = useMemo(() => {
    // Combine received and sent into unified type
    type Transaction = {
      id: string
      type: "received" | "sent"
      amount: number
      token: string
      timestamp: number
      status: string
      txHash: string
      claimed?: boolean
      recipient?: string
    }

    let combined: Transaction[] = []

    // Add received payments
    if (txType === "all" || txType === "received") {
      combined.push(
        ...payments.map((p) => ({
          id: p.id,
          type: "received" as const,
          amount: p.amount,
          token: p.token,
          timestamp: p.timestamp,
          status: p.claimed ? "claimed" : "pending",
          txHash: p.txHash,
          claimed: p.claimed,
        }))
      )
    }

    // Add sent payments
    if (txType === "all" || txType === "sent") {
      combined.push(
        ...sentPayments.map((p) => ({
          id: p.id,
          type: "sent" as const,
          amount: p.amount,
          token: p.token,
          timestamp: p.timestamp,
          status: p.status,
          txHash: p.txHash,
          recipient: p.recipient,
        }))
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      combined = combined.filter((tx) => {
        if (statusFilter === "pending") return tx.status === "pending"
        if (statusFilter === "claimed") return tx.claimed === true
        if (statusFilter === "confirmed")
          return tx.status === "confirmed" || tx.claimed === true
        return true
      })
    }

    // Apply token filter
    if (tokenFilter !== "all") {
      combined = combined.filter((tx) => tx.token === tokenFilter)
    }

    // Sort
    combined.sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return b.timestamp - a.timestamp
        case "oldest":
          return a.timestamp - b.timestamp
        case "amount-high":
          return b.amount - a.amount
        case "amount-low":
          return a.amount - b.amount
        default:
          return 0
      }
    })

    return combined
  }, [payments, sentPayments, txType, statusFilter, tokenFilter, sortOrder])

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + pageSize
  )

  const formatAmount = (amount: number, token: string) => {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${token}`
  }

  // Stats summary
  const stats = useMemo(() => {
    const received = payments.reduce((sum, p) => sum + p.amount, 0)
    const sent = sentPayments.reduce((sum, p) => sum + p.amount, 0)
    const unclaimed = payments.filter((p) => !p.claimed).length
    return {
      received,
      sent,
      unclaimed,
      total: payments.length + sentPayments.length,
    }
  }, [payments, sentPayments])

  if (payments.length === 0 && sentPayments.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-12 bg-[var(--surface-secondary)] rounded-xl",
          className
        )}
      >
        <p className="text-4xl mb-3">📭</p>
        <p className="text-[var(--text-secondary)]">No transactions yet</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Send or receive private payments to see them here
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Received"
          value={`${stats.received.toFixed(2)}`}
          icon="↓"
          color="green"
        />
        <StatCard
          label="Sent"
          value={`${stats.sent.toFixed(2)}`}
          icon="↑"
          color="purple"
        />
        <StatCard
          label="Unclaimed"
          value={`${stats.unclaimed}`}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          label="Total"
          value={`${stats.total}`}
          icon="📊"
          color="gray"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Type Toggle */}
          <div className="flex rounded-lg bg-[var(--surface-secondary)] p-1">
            {(["all", "received", "sent"] as TransactionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTxType(type)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                  txType === type
                    ? "bg-sip-purple-600 text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
            showFilters
              ? "bg-sip-purple-500/20 text-sip-purple-400"
              : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <FilterIcon className="w-3.5 h-3.5" />
          Filters
          {(statusFilter !== "all" || tokenFilter !== "all") && (
            <span className="w-2 h-2 bg-sip-purple-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-default)] space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as TransactionStatus)
                }
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-primary)] border border-[var(--border-default)] focus:outline-none focus:border-sip-purple-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="claimed">Claimed</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>

            {/* Token Filter */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
                Token
              </label>
              <select
                value={tokenFilter}
                onChange={(e) => setTokenFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-primary)] border border-[var(--border-default)] focus:outline-none focus:border-sip-purple-500"
              >
                <option value="all">All Tokens</option>
                {uniqueTokens.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
                Sort By
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-primary)] border border-[var(--border-default)] focus:outline-none focus:border-sip-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Highest Amount</option>
                <option value="amount-low">Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(statusFilter !== "all" || tokenFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all")
                setTokenFilter("all")
              }}
              className="text-xs text-sip-purple-400 hover:text-sip-purple-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-3">
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((tx) => (
            <div
              key={tx.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl",
                "bg-[var(--surface-secondary)] border border-[var(--border-default)]",
                "transition-all hover:border-[var(--border-hover)]",
                tx.claimed && "opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Direction Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                    tx.type === "received"
                      ? "bg-sip-green-500/10 text-sip-green-400"
                      : "bg-sip-purple-500/10 text-sip-purple-400"
                  )}
                >
                  {tx.type === "received" ? "↓" : "↑"}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        tx.type === "received"
                          ? "text-sip-green-400"
                          : "text-sip-purple-400"
                      )}
                    >
                      {tx.type === "received" ? "+" : "-"}
                      {formatAmount(tx.amount, tx.token)}
                    </span>
                    {tx.claimed && (
                      <span className="text-xs text-sip-green-400 bg-sip-green-500/10 px-2 py-0.5 rounded">
                        Claimed
                      </span>
                    )}
                    {tx.status === "pending" && !tx.claimed && (
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                    {tx.status === "confirmed" && tx.type === "sent" && (
                      <span className="text-xs text-sip-green-400 bg-sip-green-500/10 px-2 py-0.5 rounded">
                        Confirmed
                      </span>
                    )}
                    {tx.status === "failed" && (
                      <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                        Failed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-sm text-[var(--text-muted)]">
                    <span className="font-mono truncate max-w-[150px]">
                      {tx.txHash}
                    </span>
                    <span>•</span>
                    <span>{formatRelativeDate(tx.timestamp, now)}</span>
                    {tx.recipient && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[100px]">
                          To: {tx.recipient.slice(0, 8)}...
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex-shrink-0 ml-4">
                {tx.type === "received" && !tx.claimed ? (
                  <ClaimButton
                    paymentId={tx.id}
                    claimed={tx.claimed || false}
                    onClaim={onClaim}
                  />
                ) : (
                  <a
                    href={`https://solscan.io/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-sip-purple-400 transition-colors"
                  >
                    View →
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-[var(--surface-tertiary)] rounded-xl">
            <p className="text-sm text-[var(--text-muted)]">
              No transactions match your filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-tertiary)]">
            Showing {startIndex + 1}-
            {Math.min(startIndex + pageSize, filteredTransactions.length)} of{" "}
            {filteredTransactions.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 text-xs font-medium rounded-lg transition-colors",
                      currentPage === page
                        ? "bg-sip-purple-600 text-white"
                        : "bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)]"
                    )}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  label: string
  value: string
  icon: string
  color: "green" | "purple" | "yellow" | "gray"
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colors = {
    green: "text-sip-green-400 bg-sip-green-500/10",
    purple: "text-sip-purple-400 bg-sip-purple-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    gray: "text-[var(--text-secondary)] bg-[var(--surface-tertiary)]",
  }

  return (
    <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-default)]">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            "w-6 h-6 rounded-lg flex items-center justify-center text-sm",
            colors[color]
          )}
        >
          {icon}
        </span>
        <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

// Filter Icon
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  )
}
