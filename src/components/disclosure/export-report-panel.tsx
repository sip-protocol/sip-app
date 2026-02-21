"use client"

import { useState, useCallback, useMemo } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { usePaymentHistoryStore } from "@/stores/payment-history"

type ExportFormat = "json" | "csv"

/**
 * ExportReportPanel - Panel for generating compliance reports from payment history
 *
 * Features:
 * - Date range selection
 * - Export format selection (JSON/CSV)
 * - Generate and download report from real payment history
 */
export function ExportReportPanel() {
  const { publicKey } = useWallet()
  const walletAddress = publicKey?.toBase58() ?? ""
  const allEntries = usePaymentHistoryStore((s) => s.getAll(walletAddress))

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [format, setFormat] = useState<ExportFormat>("json")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredEntries = useMemo(() => {
    let entries = allEntries
    if (startDate) {
      const startTs = new Date(startDate).getTime()
      entries = entries.filter((e) => e.timestamp >= startTs)
    }
    if (endDate) {
      const endTs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000
      entries = entries.filter((e) => e.timestamp < endTs)
    }
    return entries
  }, [allEntries, startDate, endDate])

  const handleGenerateReport = useCallback(() => {
    if (!walletAddress) {
      setError("Wallet not connected")
      return
    }
    if (filteredEntries.length === 0) {
      setError("No transactions in the selected range")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const transactions = filteredEntries.map((e) => ({
        timestamp: new Date(e.timestamp).toISOString(),
        type: e.type,
        amount: e.amount,
        token: e.token,
        txSignature: e.txSignature,
        stealthAddress: e.stealthAddress,
      }))

      let content: string
      let filename: string
      let mimeType: string

      if (format === "json") {
        const report = {
          metadata: {
            generatedAt: new Date().toISOString(),
            walletAddress,
            dateRange: {
              start: startDate || "all",
              end: endDate || "all",
            },
            totalTransactions: transactions.length,
            format: "json",
          },
          transactions,
        }
        content = JSON.stringify(report, null, 2)
        filename = `sip-audit-report-${Date.now()}.json`
        mimeType = "application/json"
      } else {
        const headers = "timestamp,type,amount,token,txSignature,stealthAddress"
        const rows = transactions.map((tx) =>
          [
            tx.timestamp,
            tx.type,
            tx.amount,
            tx.token,
            tx.txSignature,
            tx.stealthAddress,
          ].join(",")
        )
        content = [headers, ...rows].join("\n")
        filename = `sip-audit-report-${Date.now()}.csv`
        mimeType = "text/csv"
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }, [walletAddress, filteredEntries, startDate, endDate, format])

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
          <span className="text-3xl">🔗</span>
        </div>
        <p className="text-[var(--text-secondary)]">
          Connect wallet to export report
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex gap-3">
          <span className="text-xl">📊</span>
          <div>
            <p className="font-medium text-amber-400">Generate Audit Report</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Export your stealth payment history for compliance audits, tax
              reports, or internal accounting.
            </p>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Date Range (optional)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-tertiary)] mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] text-sm focus:outline-none focus:border-sip-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-tertiary)] mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] text-sm focus:outline-none focus:border-sip-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Export Format */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Export Format</label>
        <div className="flex gap-3">
          <button
            onClick={() => setFormat("json")}
            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
              format === "json"
                ? "border-sip-purple-500 bg-sip-purple-500/10 text-sip-purple-400"
                : "border-[var(--border-default)] hover:border-[var(--border-hover)]"
            }`}
          >
            JSON
            <span className="block text-xs text-[var(--text-tertiary)] mt-1">
              Structured data
            </span>
          </button>
          <button
            onClick={() => setFormat("csv")}
            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
              format === "csv"
                ? "border-sip-purple-500 bg-sip-purple-500/10 text-sip-purple-400"
                : "border-[var(--border-default)] hover:border-[var(--border-hover)]"
            }`}
          >
            CSV
            <span className="block text-xs text-[var(--text-tertiary)] mt-1">
              Spreadsheet compatible
            </span>
          </button>
        </div>
      </div>

      {/* Transaction Preview */}
      <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)]">
        {allEntries.length > 0 ? (
          <p className="text-sm">
            <span className="font-medium">{filteredEntries.length}</span>{" "}
            transaction{filteredEntries.length !== 1 ? "s" : ""} matching
            {startDate || endDate ? " date range" : ""}{" "}
            <span className="text-[var(--text-tertiary)]">
              ({allEntries.length} total)
            </span>
          </p>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            No stealth payment history yet. Send or claim private payments
            first!
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerateReport}
        disabled={filteredEntries.length === 0 || isGenerating}
        className="w-full py-3 px-4 rounded-xl bg-sip-purple-600 text-white font-medium hover:bg-sip-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? "Generating..." : "📥 Generate & Download Report"}
      </button>
    </div>
  )
}
