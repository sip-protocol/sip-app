"use client"

import { useState, useCallback } from "react"
import type { ViewingKey, EncryptedTransaction } from "@sip-protocol/types"
import type { TransactionData } from "@sip-protocol/sdk"
import { ViewingKeyInput } from "./viewing-key-input"
import { DecryptedTxCard, DecryptionErrorCard } from "./decrypted-tx-card"
import { useViewingKeyDisclosure } from "@/hooks/use-viewing-key-disclosure"

/**
 * ViewWithKeyPanel - Panel for auditors to view transactions
 *
 * Features:
 * - Import viewing key (paste or upload)
 * - Paste encrypted transaction data
 * - Decrypt and display transaction details
 */
export function ViewWithKeyPanel() {
  const { decryptTransaction } = useViewingKeyDisclosure()

  const [viewingKey, setViewingKey] = useState<ViewingKey | null>(null)
  const [encryptedData, setEncryptedData] = useState("")
  const [decryptedData, setDecryptedData] = useState<TransactionData | null>(
    null
  )
  const [decryptionError, setDecryptionError] = useState<string | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)

  const handleKeyParsed = useCallback((key: ViewingKey) => {
    setViewingKey(key)
    setDecryptedData(null)
    setDecryptionError(null)
  }, [])

  const handleDecrypt = useCallback(() => {
    if (!viewingKey) {
      setInputError("Please import a viewing key first")
      return
    }

    if (!encryptedData.trim()) {
      setInputError("Please paste encrypted transaction data")
      return
    }

    setInputError(null)
    setDecryptionError(null)

    try {
      const parsed = JSON.parse(encryptedData.trim()) as EncryptedTransaction

      if (!parsed.ciphertext || !parsed.nonce || !parsed.viewingKeyHash) {
        setInputError("Invalid encrypted transaction format")
        return
      }

      const result = decryptTransaction(viewingKey, parsed)

      if (result.success && result.data) {
        setDecryptedData(result.data)
        setDecryptionError(null)
      } else {
        setDecryptionError(result.error || "Decryption failed")
        setDecryptedData(null)
      }
    } catch {
      setInputError(
        "Invalid JSON format. Please paste valid encrypted transaction data."
      )
    }
  }, [viewingKey, encryptedData, decryptTransaction])

  const handleClear = useCallback(() => {
    setViewingKey(null)
    setEncryptedData("")
    setDecryptedData(null)
    setDecryptionError(null)
    setInputError(null)
  }, [])

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <div className="flex gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <p className="font-medium text-blue-400">
              For Auditors & Compliance Officers
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Use a viewing key shared with you to decrypt and verify
              transaction details. This does not give you spending access.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Import Viewing Key */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-sip-purple-500/20 text-sip-purple-400 text-sm mr-2">
              1
            </span>
            Import Viewing Key
          </h3>
          {viewingKey && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              ✓ Key loaded
            </span>
          )}
        </div>

        {!viewingKey ? (
          <ViewingKeyInput onKeyParsed={handleKeyParsed} />
        ) : (
          <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-400">
                  Viewing Key Loaded
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-mono">
                  Hash: {viewingKey.hash.slice(0, 16)}...
                </p>
              </div>
              <button
                onClick={() => setViewingKey(null)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
              >
                Change Key
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Paste Encrypted Data */}
      <div className="space-y-3">
        <h3 className="font-medium">
          <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-sip-purple-500/20 text-sip-purple-400 text-sm mr-2">
            2
          </span>
          Paste Encrypted Transaction
        </h3>

        <textarea
          value={encryptedData}
          onChange={(e) => {
            setEncryptedData(e.target.value)
            setInputError(null)
          }}
          placeholder='{"ciphertext": "0x...", "nonce": "0x...", "viewingKeyHash": "0x..."}'
          rows={4}
          className="w-full p-4 rounded-xl border border-[var(--border-default)] bg-transparent text-sm font-mono resize-none focus:outline-none focus:border-sip-purple-500 placeholder:text-[var(--text-tertiary)]"
        />

        {inputError && (
          <p className="text-sm text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            {inputError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDecrypt}
          disabled={!viewingKey || !encryptedData.trim()}
          className="flex-1 py-3 px-4 rounded-xl bg-sip-purple-600 text-white font-medium hover:bg-sip-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔓 Decrypt Transaction
        </button>
        <button
          onClick={handleClear}
          className="py-3 px-4 rounded-xl border border-[var(--border-default)] font-medium hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Step 3: Results */}
      {(decryptedData || decryptionError) && (
        <div className="space-y-3">
          <h3 className="font-medium">
            <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-sip-purple-500/20 text-sip-purple-400 text-sm mr-2">
              3
            </span>
            Decryption Result
          </h3>

          {decryptedData && <DecryptedTxCard data={decryptedData} />}
          {decryptionError && <DecryptionErrorCard error={decryptionError} />}
        </div>
      )}
    </div>
  )
}
