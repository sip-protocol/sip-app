"use client"

import { useState, useCallback } from "react"
import type { EncryptedTransaction } from "@sip-protocol/types"
import { useViewingKeyDisclosure } from "@/hooks/use-viewing-key-disclosure"

type ExportFormat = "json" | "csv"

interface ExportReportPanelProps {
  encryptedTransactions?: EncryptedTransaction[]
}

/**
 * ExportReportPanel - Panel for generating compliance reports
 *
 * Features:
 * - Select viewing key
 * - Date range selection
 * - Export format selection
 * - Generate and download report
 */
export function ExportReportPanel({
  encryptedTransactions = [],
}: ExportReportPanelProps) {
  const { keys, decryptTransaction } = useViewingKeyDisclosure()

  const [selectedKeyHash, setSelectedKeyHash] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [format, setFormat] = useState<ExportFormat>("json")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedKey = keys.find((k) => k.viewingKey.hash === selectedKeyHash)

  const handleGenerateReport = useCallback(async () => {
    if (!selectedKey) {
      setError("Please select a viewing key")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Decrypt all transactions with the selected key
      const decryptedTxs = encryptedTransactions
        .map((encrypted) => {
          const result = decryptTransaction(selectedKey.viewingKey, encrypted)
          if (result.success && result.data) {
            return result.data
          }
          return null
        })
        .filter(Boolean)

      // Filter by date range if specified
      let filteredTxs = decryptedTxs
      if (startDate) {
        const startTs = new Date(startDate).getTime()
        filteredTxs = filteredTxs.filter((tx) => tx && tx.timestamp >= startTs)
      }
      if (endDate) {
        const endTs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 // End of day
        filteredTxs = filteredTxs.filter((tx) => tx && tx.timestamp < endTs)
      }

      // Generate report
      const report = {
        metadata: {
          generatedAt: new Date().toISOString(),
          viewingKeyHash: selectedKey.viewingKey.hash,
          viewingKeyLabel: selectedKey.label,
          dateRange: {
            start: startDate || "all",
            end: endDate || "all",
          },
          totalTransactions: filteredTxs.length,
          format,
        },
        transactions: filteredTxs,
      }

      // Download report
      let content: string
      let filename: string
      let mimeType: string

      if (format === "json") {
        content = JSON.stringify(report, null, 2)
        filename = `sip-audit-report-${Date.now()}.json`
        mimeType = "application/json"
      } else {
        // CSV format
        const headers = ["timestamp", "sender", "recipient", "amount"]
        const rows = filteredTxs.map((tx) => {
          if (!tx) return ""
          return [
            new Date(tx.timestamp).toISOString(),
            tx.sender,
            tx.recipient,
            tx.amount,
          ].join(",")
        })
        content = [headers.join(","), ...rows].join("\n")
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
  }, [
    selectedKey,
    encryptedTransactions,
    startDate,
    endDate,
    format,
    decryptTransaction,
  ])

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex gap-3">
          <span className="text-xl">📊</span>
          <div>
            <p className="font-medium text-amber-400">Generate Audit Report</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Export decrypted transaction data for compliance audits, tax
              reports, or internal accounting.
            </p>
          </div>
        </div>
      </div>

      {/* Select Viewing Key */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Select Viewing Key</label>
        {keys.length > 0 ? (
          <select
            value={selectedKeyHash}
            onChange={(e) => setSelectedKeyHash(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] text-sm focus:outline-none focus:border-sip-purple-500"
          >
            <option value="">Choose a viewing key...</option>
            {keys.map((key) => (
              <option key={key.viewingKey.hash} value={key.viewingKey.hash}>
                {key.label || `Key ${key.viewingKey.hash.slice(0, 8)}`} - Path:{" "}
                {key.viewingKey.path}
              </option>
            ))}
          </select>
        ) : (
          <div className="p-4 rounded-xl border border-[var(--border-default)] text-center">
            <p className="text-[var(--text-secondary)]">
              No viewing keys available. Generate one in the &quot;Share
              Key&quot; tab first.
            </p>
          </div>
        )}
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
      {encryptedTransactions.length > 0 && (
        <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)]">
          <p className="text-sm">
            <span className="font-medium">{encryptedTransactions.length}</span>{" "}
            encrypted transactions available for export
          </p>
        </div>
      )}

      {encryptedTransactions.length === 0 && (
        <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)]">
          <p className="text-sm text-[var(--text-secondary)]">
            No encrypted transactions to export. Send some private payments
            first!
          </p>
        </div>
      )}

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
        disabled={
          !selectedKeyHash || encryptedTransactions.length === 0 || isGenerating
        }
        className="w-full py-3 px-4 rounded-xl bg-sip-purple-600 text-white font-medium hover:bg-sip-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? "Generating..." : "📥 Generate & Download Report"}
      </button>
    </div>
  )
}
