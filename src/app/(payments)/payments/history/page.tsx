"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { EncryptedTransaction } from "@sip-protocol/types"
import type { TransactionData } from "@sip-protocol/sdk"
import { useViewingKeyDisclosure } from "@/hooks/use-viewing-key-disclosure"
import { DecryptedTxCard } from "@/components/disclosure"

type FilterType = "all" | "sent" | "received" | "pending"

interface HistoryTransaction {
  id: string
  encrypted: EncryptedTransaction
  decrypted?: TransactionData
  type?: "sent" | "received"
  status: "confirmed" | "pending"
  timestamp: number
}

// Mock data for demonstration - in production this would come from SDK scanning
const mockTransactions: HistoryTransaction[] = []

export default function PaymentHistoryPage() {
  const { keys, decryptTransaction } = useViewingKeyDisclosure()

  const [filter, setFilter] = useState<FilterType>("all")
  const [transactions] = useState<HistoryTransaction[]>(mockTransactions)
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)

  // Attempt to decrypt transactions with available viewing keys
  const decryptedTransactions = useMemo(() => {
    if (keys.length === 0) return transactions

    return transactions.map((tx) => {
      if (tx.decrypted) return tx

      // Try each key until one works
      for (const keyData of keys) {
        const result = decryptTransaction(keyData.viewingKey, tx.encrypted)
        if (result.success && result.data) {
          return { ...tx, decrypted: result.data }
        }
      }

      return tx
    })
  }, [transactions, keys, decryptTransaction])

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return decryptedTransactions

    return decryptedTransactions.filter((tx) => {
      if (filter === "pending") return tx.status === "pending"
      if (filter === "sent") return tx.type === "sent"
      if (filter === "received") return tx.type === "received"
      return true
    })
  }, [decryptedTransactions, filter])

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

      {/* Viewing Keys Status */}
      {keys.length > 0 ? (
        <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <span>✓</span>
            <span>
              {keys.length} viewing key{keys.length > 1 ? "s" : ""} available
              for decryption
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <span>⚠️</span>
              <span>No viewing keys - transactions will remain encrypted</span>
            </div>
            <Link
              href="/payments/disclose"
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              Add Key
            </Link>
          </div>
        </div>
      )}

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
          {filteredTransactions.map((tx) => (
            <div key={tx.id}>
              <button
                type="button"
                onClick={() =>
                  setSelectedTxId(selectedTxId === tx.id ? null : tx.id)
                }
                className="w-full p-4 hover:bg-[var(--surface-secondary)] transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "sent"
                          ? "bg-red-500/20 text-red-400"
                          : tx.type === "received"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {tx.type === "sent"
                        ? "↗️"
                        : tx.type === "received"
                          ? "↘️"
                          : "🔒"}
                    </div>
                    <div>
                      <p className="font-medium">
                        {tx.decrypted ? (
                          tx.type === "sent" ? (
                            "Sent"
                          ) : (
                            "Received"
                          )
                        ) : (
                          <span className="text-[var(--text-tertiary)]">
                            Encrypted Transaction
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {formatTimestamp(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    {tx.decrypted ? (
                      <p
                        className={`font-semibold ${
                          tx.type === "sent" ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {tx.type === "sent" ? "-" : "+"}
                        {tx.decrypted.amount}
                      </p>
                    ) : (
                      <p className="text-[var(--text-tertiary)]">
                        <span className="text-lg">🔒</span>
                      </p>
                    )}
                    <span className="text-[var(--text-tertiary)]">
                      {selectedTxId === tx.id ? "▼" : "▶"}
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {selectedTxId === tx.id && tx.decrypted && (
                <div className="px-4 pb-4">
                  <DecryptedTxCard data={tx.decrypted} />
                </div>
              )}

              {selectedTxId === tx.id && !tx.decrypted && (
                <div className="px-4 pb-4">
                  <div className="p-4 rounded-xl bg-[var(--surface-secondary)] text-center">
                    <p className="text-[var(--text-secondary)] mb-3">
                      This transaction is encrypted. Import the correct viewing
                      key to decrypt.
                    </p>
                    <Link
                      href="/payments/disclose"
                      className="inline-block px-4 py-2 text-sm font-medium rounded-lg bg-sip-purple-600 text-white hover:bg-sip-purple-700 transition-colors"
                    >
                      Import Viewing Key
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
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
            <p className="font-medium">About encrypted history</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Transactions are encrypted by default. Import viewing keys in the{" "}
              <Link
                href="/payments/disclose"
                className="text-sip-purple-400 hover:underline"
              >
                Disclose
              </Link>{" "}
              section to decrypt and view transaction details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
