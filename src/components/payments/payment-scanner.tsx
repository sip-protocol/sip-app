"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useStealthKeys } from "@/hooks/use-stealth-keys"
import { useScanPayments } from "@/hooks/use-scan-payments"
import { ScanProgress } from "./scan-progress"
import { PaymentList } from "./payment-list"
import { cn } from "@/lib/utils"

interface PaymentScannerProps {
  className?: string
}

export function PaymentScanner({ className }: PaymentScannerProps) {
  const { connected } = useWallet()
  const { keys } = useStealthKeys()
  const { payments, isScanning, error, progress, scan, claim } =
    useScanPayments()

  if (!connected) {
    return (
      <div
        className={cn(
          "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-8 text-center",
          className
        )}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sip-purple-500/20 flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Connect Wallet to Scan
        </h2>
        <p className="text-[var(--text-secondary)]">
          Connect your Solana wallet to scan for incoming stealth payments.
        </p>
      </div>
    )
  }

  if (!keys) {
    return (
      <div
        className={cn(
          "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-8 text-center",
          className
        )}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Generate Stealth Keys First
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          You need to generate your stealth keys before you can scan for
          payments.
        </p>
        <a
          href="/payments/receive"
          className="inline-block px-6 py-3 text-sm font-medium rounded-xl bg-sip-purple-600 text-white hover:bg-sip-purple-700 transition-colors"
        >
          Go to Receive Page
        </a>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Payment Scanner
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Scan the blockchain for incoming stealth payments
          </p>
        </div>

        <button
          type="button"
          onClick={scan}
          disabled={isScanning}
          className={cn(
            "px-6 py-2.5 text-sm font-medium rounded-xl transition-colors",
            isScanning
              ? "bg-sip-purple-600/50 text-white/70 cursor-not-allowed"
              : "bg-sip-purple-600 text-white hover:bg-sip-purple-700"
          )}
        >
          {isScanning ? "Scanning..." : "Scan Now"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Progress */}
      {(isScanning || progress > 0) && (
        <div className="mb-6">
          <ScanProgress progress={progress} isScanning={isScanning} />
        </div>
      )}

      {/* Payment List */}
      {progress === 100 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            Detected Payments ({payments.length})
          </h3>
          <PaymentList payments={payments} onClaim={claim} />
        </div>
      )}

      {/* Stats */}
      {payments.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface-secondary)]">
              <p className="text-sm text-[var(--text-muted)]">Total Found</p>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">
                {payments.length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface-secondary)]">
              <p className="text-sm text-[var(--text-muted)]">Claimed</p>
              <p className="text-2xl font-semibold text-sip-green-400">
                {payments.filter((p) => p.claimed).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
