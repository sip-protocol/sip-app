import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Scan Payments",
  description: "Scan the blockchain for incoming private payments.",
}

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

      {/* Scan Card */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8">
        {/* Scan Status */}
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Ready to Scan</h2>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
            Connect your wallet to scan the blockchain for payments sent to your
            stealth addresses
          </p>
        </div>

        {/* Scan Button */}
        <button
          type="button"
          className="w-full py-4 px-6 text-lg font-semibold rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Connect Wallet to Scan
        </button>

        {/* Scan Settings */}
        <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Auto-scan</span>
            <button
              type="button"
              className="relative w-11 h-6 bg-[var(--surface-tertiary)] rounded-full transition-colors"
              role="switch"
              aria-checked="false"
            >
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Automatically scan for new payments using Helius webhooks
          </p>
        </div>
      </div>

      {/* Recent Scans (Empty State) */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Discoveries</h2>
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-8 text-center">
          <p className="text-[var(--text-tertiary)]">
            No payments discovered yet
          </p>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Scan to discover incoming payments
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <span className="text-xl">⚡</span>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Powered by Helius
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Fast and efficient scanning using Helius DAS API and webhooks for
              real-time payment notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
