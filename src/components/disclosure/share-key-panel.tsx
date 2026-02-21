"use client"

import { useState, useCallback } from "react"
import type { ViewingKey } from "@sip-protocol/types"
import { ViewingKeyQR } from "./viewing-key-qr"
import {
  useViewingKeyDisclosure,
  type ShareableKey,
} from "@/hooks/use-viewing-key-disclosure"
import { useStealthKeys } from "@/hooks/use-stealth-keys"

interface ShareKeyPanelProps {
  onKeyGenerated?: (key: ViewingKey) => void
}

/**
 * ShareKeyPanel - Panel for sharing viewing keys
 *
 * Features:
 * - List of stored viewing keys
 * - Generate new key
 * - QR code display
 * - Copy to clipboard
 * - Download JSON export
 */
export function ShareKeyPanel({ onKeyGenerated }: ShareKeyPanelProps) {
  const { keys, generateKey, removeKey } = useViewingKeyDisclosure()
  const { keys: stealthKeys } = useStealthKeys()
  const [selectedKey, setSelectedKey] = useState<ShareableKey | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newKeyLabel, setNewKeyLabel] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [stealthKeyCopied, setStealthKeyCopied] = useState(false)

  const handleCopyStealthKey = useCallback(async () => {
    if (!stealthKeys) return
    try {
      await navigator.clipboard.writeText(stealthKeys.viewingPublicKey)
      setStealthKeyCopied(true)
      setTimeout(() => setStealthKeyCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [stealthKeys])

  const handleGenerateKey = useCallback(() => {
    setIsGenerating(true)
  }, [])

  const handleConfirmGenerate = useCallback(() => {
    try {
      const key = generateKey(newKeyLabel || undefined)
      onKeyGenerated?.(key)

      // Select the newly generated key
      const newShareable = keys.find((k) => k.viewingKey.hash === key.hash)
      if (newShareable) {
        setSelectedKey(newShareable)
      }
    } finally {
      setIsGenerating(false)
      setNewKeyLabel("")
    }
  }, [generateKey, newKeyLabel, onKeyGenerated, keys])

  const handleCopyKey = useCallback(async (jsonExport: string) => {
    try {
      await navigator.clipboard.writeText(jsonExport)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [])

  const handleDownloadKey = useCallback((key: ShareableKey) => {
    const blob = new Blob([key.getJsonExport()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `viewing-key-${key.viewingKey.hash.slice(0, 8)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Stealth Viewing Key — for scanning incoming payments */}
      <div className="p-4 rounded-xl border border-sip-purple-500/30 bg-sip-purple-500/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sip-purple-400">Stealth Viewing Key</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Share this key to allow someone to detect your incoming stealth payments
            </p>
          </div>
        </div>

        {stealthKeys ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[var(--surface-secondary)]">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Viewing Public Key (base58)</p>
              <p className="font-mono text-xs break-all">
                {stealthKeys.viewingPublicKey}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyStealthKey}
                className="flex-1 py-2 px-4 rounded-lg border border-[var(--border-default)] text-sm font-medium hover:bg-[var(--surface-secondary)] transition-colors"
              >
                {stealthKeyCopied ? "✓ Copied!" : "Copy Key"}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs text-amber-400">
                ⚠️ Sharing this key reveals ALL incoming stealth payments to your wallet. Only share with trusted auditors.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[var(--surface-secondary)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              No stealth keys generated yet. Generate them in the Receive page first.
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-default)]" />
      <p className="text-xs text-[var(--text-tertiary)]">SDK Viewing Keys (for encrypted transaction disclosure)</p>

      {/* Generate New Key */}
      {!isGenerating ? (
        <button
          onClick={handleGenerateKey}
          className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[var(--border-default)] hover:border-sip-purple-500 hover:bg-sip-purple-500/10 transition-colors text-[var(--text-secondary)] hover:text-sip-purple-400"
        >
          <span className="text-xl mr-2">+</span>
          Generate New Viewing Key
        </button>
      ) : (
        <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)]">
          <label className="block text-sm font-medium mb-2">
            Key Label (optional)
          </label>
          <input
            type="text"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            placeholder="e.g., Audit Q1 2026, Tax Report"
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-default)] text-sm focus:outline-none focus:border-sip-purple-500"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConfirmGenerate}
              className="flex-1 py-2 px-4 rounded-lg bg-sip-purple-600 text-white text-sm font-medium hover:bg-sip-purple-700 transition-colors"
            >
              Generate
            </button>
            <button
              onClick={() => {
                setIsGenerating(false)
                setNewKeyLabel("")
              }}
              className="py-2 px-4 rounded-lg border border-[var(--border-default)] text-sm hover:bg-[var(--surface-tertiary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Key List */}
      {keys.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">
            Your Viewing Keys ({keys.length})
          </h3>

          <div className="space-y-2">
            {keys.map((key) => (
              <button
                key={key.viewingKey.hash}
                onClick={() =>
                  setSelectedKey(
                    selectedKey?.viewingKey.hash === key.viewingKey.hash
                      ? null
                      : key
                  )
                }
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedKey?.viewingKey.hash === key.viewingKey.hash
                    ? "border-sip-purple-500 bg-sip-purple-500/10"
                    : "border-[var(--border-default)] hover:border-[var(--border-hover)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {key.label || `Key ${key.viewingKey.hash.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      Created {formatDate(key.createdAt)} • Path:{" "}
                      {key.viewingKey.path}
                    </p>
                  </div>
                  <span className="text-lg">
                    {selectedKey?.viewingKey.hash === key.viewingKey.hash
                      ? "▼"
                      : "▶"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Key Details */}
      {selectedKey && (
        <div className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <ViewingKeyQR
              data={selectedKey.qrData}
              size={180}
              label={selectedKey.label}
            />
          </div>

          {/* Key Hash */}
          <div className="p-3 rounded-lg bg-[var(--surface-secondary)]">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Key Hash</p>
            <p className="font-mono text-xs break-all">
              {selectedKey.viewingKey.hash}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => handleCopyKey(selectedKey.getJsonExport())}
              className="flex-1 py-2.5 px-4 rounded-lg border border-[var(--border-default)] text-sm font-medium hover:bg-[var(--surface-secondary)] transition-colors"
            >
              {copySuccess ? "✓ Copied!" : "Copy JSON"}
            </button>
            <button
              onClick={() => handleDownloadKey(selectedKey)}
              className="flex-1 py-2.5 px-4 rounded-lg border border-[var(--border-default)] text-sm font-medium hover:bg-[var(--surface-secondary)] transition-colors"
            >
              Download
            </button>
            <button
              onClick={() => {
                removeKey(selectedKey.viewingKey.hash)
                setSelectedKey(null)
              }}
              className="py-2.5 px-4 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {keys.length === 0 && !isGenerating && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
            <span className="text-3xl">🔑</span>
          </div>
          <p className="text-[var(--text-secondary)]">
            No viewing keys yet. Generate one to share with auditors.
          </p>
        </div>
      )}
    </div>
  )
}
