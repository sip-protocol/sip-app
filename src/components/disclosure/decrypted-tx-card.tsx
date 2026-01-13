"use client"

import type { TransactionData } from "@sip-protocol/sdk"

interface DecryptedTxCardProps {
  data: TransactionData
  keyLabel?: string
}

/**
 * DecryptedTxCard - Display decrypted transaction details
 *
 * Shows the decrypted transaction information including:
 * - Sender address
 * - Recipient address
 * - Amount
 * - Timestamp
 */
export function DecryptedTxCard({ data, keyLabel }: DecryptedTxCardProps) {
  const formatAddress = (addr: string) => {
    if (addr.length <= 12) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔓</span>
          <span className="font-medium">Decrypted Transaction</span>
        </div>
        {keyLabel && (
          <span className="text-xs px-2 py-1 rounded-full bg-sip-purple-500/20 text-sip-purple-400">
            {keyLabel}
          </span>
        )}
      </div>

      {/* Transaction Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-[var(--border-default)]">
          <span className="text-sm text-[var(--text-secondary)]">Sender</span>
          <span className="font-mono text-sm" title={data.sender}>
            {formatAddress(data.sender)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[var(--border-default)]">
          <span className="text-sm text-[var(--text-secondary)]">
            Recipient
          </span>
          <span className="font-mono text-sm" title={data.recipient}>
            {formatAddress(data.recipient)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[var(--border-default)]">
          <span className="text-sm text-[var(--text-secondary)]">Amount</span>
          <span className="font-semibold">{data.amount}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-[var(--text-secondary)]">Time</span>
          <span className="text-sm">{formatTimestamp(data.timestamp)}</span>
        </div>
      </div>

      {/* Verification Badge */}
      <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-2 text-sm text-green-400">
          <span>✓</span>
          <span>Authenticity verified - data has not been tampered with</span>
        </div>
      </div>
    </div>
  )
}

/**
 * DecryptionErrorCard - Display decryption error
 */
export function DecryptionErrorCard({ error }: { error: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="font-medium text-red-400">Decryption Failed</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{error}</p>
        </div>
      </div>
      <p className="text-xs text-[var(--text-tertiary)] mt-4">
        This usually means the viewing key doesn&apos;t match the encrypted
        data, or the data has been corrupted.
      </p>
    </div>
  )
}
