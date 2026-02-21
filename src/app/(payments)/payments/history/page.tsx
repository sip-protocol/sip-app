"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { usePaymentHistoryStore } from "@/stores/payment-history"
import type { HistoryEntry } from "@/stores/payment-history"

type FilterType = "all" | "sent" | "received" | "pending"

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr
  return addr.slice(0, 4) + "..." + addr.slice(-4)
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function PaymentHistoryPage() {
  const { publicKey } = useWallet()
  const walletAddress = publicKey?.toBase58() ?? ""

  const { getAll, getSent, getClaimed } = usePaymentHistoryStore()

  const [filter, setFilter] = useState<FilterType>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredTransactions = useMemo<HistoryEntry[]>(() => {
    if (!walletAddress) return []
    if (filter === "sent") return getSent(walletAddress)
    if (filter === "received") return getClaimed(walletAddress)
    if (filter === "pending") return []
    return getAll(walletAddress)
  }, [walletAddress, filter, getAll, getSent, getClaimed])

  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
            <span className="text-3xl">🔗</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Wallet not connected</h2>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
            Connect your wallet to view your payment history.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">History</h1>
          <p className="text-[var(--text-secondary)]">
            Your private payment transaction history
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/payments/disclose"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-sip-purple-600 text-white hover:bg-sip-purple-700 transition-colors"
          >
            Export Report
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["all", "sent", "received", "pending"] as FilterType[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors capitalize ${
              filter === f
                ? "bg-sip-purple-600 text-white"
                : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {filteredTransactions.length > 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl divide-y divide-[var(--border-default)]">
          {filteredTransactions.map((tx) => {
            const isSent = tx.type === "sent"
            const isExpanded = expandedId === tx.id

            return (
              <div key={tx.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                  className="w-full p-4 hover:bg-[var(--surface-secondary)] transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSent
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {isSent ? "↗" : "↘"}
                      </div>
                      <div>
                        <p className="font-medium">
                          {isSent ? "Sent" : "Received"}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {formatTimestamp(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p
                        className={`font-semibold ${
                          isSent ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {isSent ? "-" : "+"}
                        {tx.amount} {tx.token}
                      </p>
                      <span className="text-[var(--text-tertiary)]">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="p-4 rounded-xl bg-[var(--surface-secondary)] space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">
                          TX Signature
                        </span>
                        <a
                          href={`https://solscan.io/tx/${tx.txSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sip-purple-400 hover:underline font-mono"
                        >
                          {truncateAddress(tx.txSignature)}
                        </a>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">
                          Stealth Address
                        </span>
                        <a
                          href={`https://solscan.io/account/${tx.stealthAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sip-purple-400 hover:underline font-mono"
                        >
                          {truncateAddress(tx.stealthAddress)}
                        </a>
                      </div>

                      {isSent && tx.recipient && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">
                            Recipient
                          </span>
                          <span className="font-mono text-[var(--text-primary)]">
                            {truncateAddress(tx.recipient)}
                          </span>
                        </div>
                      )}

                      {!isSent && tx.transferRecordPda && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">
                            Transfer Record
                          </span>
                          <a
                            href={`https://solscan.io/account/${tx.transferRecordPda}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sip-purple-400 hover:underline font-mono"
                          >
                            {truncateAddress(tx.transferRecordPda)}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
            <span className="text-3xl">📜</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">No transactions yet</h2>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
            Your private payment history will appear here once you send or
            receive payments.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/payments/send"
              className="px-6 py-3 text-sm font-medium rounded-xl bg-sip-purple-600 text-white hover:bg-sip-purple-700 transition-colors"
            >
              Send Payment
            </Link>
            <Link
              href="/payments/receive"
              className="px-6 py-3 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
            >
              Receive Payment
            </Link>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-default)]">
        <div className="flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-medium">History is stored locally</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Your transaction history is saved in this browser only. Clearing
              browser data will remove it. Use{" "}
              <Link
                href="/payments/disclose"
                className="text-sip-purple-400 hover:underline"
              >
                Export Report
              </Link>{" "}
              to save a copy for your records.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
