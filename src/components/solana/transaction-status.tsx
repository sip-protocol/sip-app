"use client"

import type { SolanaTxStatus } from "@/hooks/use-solana-transaction"

interface TransactionStatusProps {
  status: SolanaTxStatus
  txSignature: string | null
  explorerUrl: string | null
  error: string | null
}

const STATUS_CONFIG: Record<
  SolanaTxStatus,
  { label: string; color: string } | null
> = {
  idle: null,
  building: { label: "Building transaction...", color: "text-zinc-400" },
  signing: { label: "Signing with wallet...", color: "text-yellow-400" },
  sending: { label: "Sending transaction...", color: "text-blue-400" },
  confirming: { label: "Confirming on Solana...", color: "text-blue-400" },
  confirmed: { label: "Confirmed", color: "text-emerald-400" },
  error: { label: "Transaction failed", color: "text-red-400" },
}

export function TransactionStatus({
  status,
  txSignature,
  explorerUrl,
  error,
}: TransactionStatusProps) {
  const config = STATUS_CONFIG[status]
  if (!config) return null

  return (
    <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>

      {txSignature && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-zinc-500">TX:</span>
          <code className="text-xs text-zinc-400">
            {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
          </code>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              View on Explorer
            </a>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-400/80">{error}</p>
      )}
    </div>
  )
}
