"use client"

import { PaymentScanner } from "@/components/payments/payment-scanner"

export default function ScanPaymentsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Scan Payments</h1>
        <p className="text-[var(--text-secondary)]">
          Discover incoming payments sent to your stealth addresses
        </p>
      </div>

      {/* Payment Scanner */}
      <PaymentScanner />

      {/* Info */}
      <div className="mt-6 p-4 rounded-xl bg-sip-purple-500/10 border border-sip-purple-500/30">
        <div className="flex gap-3">
          <span className="text-xl">⚡</span>
          <div>
            <p className="font-medium text-sip-purple-400">Powered by Helius</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Fast and efficient scanning using Helius DAS API and webhooks for
              real-time payment notifications.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-6 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6">
        <h3 className="font-medium mb-4">How scanning works</h3>
        <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sip-purple-500/20 text-sip-purple-400 flex items-center justify-center text-xs font-medium">
              1
            </span>
            <span>
              Your viewing key scans the blockchain for stealth payments
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sip-purple-500/20 text-sip-purple-400 flex items-center justify-center text-xs font-medium">
              2
            </span>
            <span>
              Payments are detected without revealing your main address
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sip-purple-500/20 text-sip-purple-400 flex items-center justify-center text-xs font-medium">
              3
            </span>
            <span>Claim funds to your wallet with a single click</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
