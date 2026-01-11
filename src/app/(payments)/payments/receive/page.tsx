import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Receive Payment",
  description: "Generate a stealth address to receive private payments.",
}

export default function ReceivePaymentPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Receive Payment</h1>
        <p className="text-[var(--text-secondary)]">
          Generate a one-time stealth address to receive funds privately
        </p>
      </div>

      {/* Stealth Address Card */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8">
        {/* QR Code Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 bg-[var(--surface-secondary)] rounded-xl flex items-center justify-center border border-[var(--border-default)]">
            <div className="text-center">
              <p className="text-4xl mb-2">🔐</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Connect wallet to
                <br />
                generate address
              </p>
            </div>
          </div>
        </div>

        {/* Address Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Your Stealth Meta-Address
          </label>
          <div className="relative">
            <div className="w-full px-4 py-3 bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl font-mono text-sm text-[var(--text-tertiary)] break-all">
              Connect wallet to view your stealth meta-address
            </div>
            <button
              type="button"
              disabled
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors disabled:opacity-50"
              title="Copy address"
            >
              📋
            </button>
          </div>
        </div>

        {/* Connect Button */}
        <button
          type="button"
          className="w-full py-4 px-6 text-lg font-semibold rounded-xl bg-sip-green-500 text-white hover:bg-sip-green-600 transition-colors"
        >
          Connect Wallet to Generate
        </button>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
          <h3 className="font-medium mb-3">How it works</h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-2">
              <span className="text-sip-purple-500">1.</span>
              Share your stealth meta-address with the sender
            </li>
            <li className="flex gap-2">
              <span className="text-sip-purple-500">2.</span>
              Sender generates a one-time address just for you
            </li>
            <li className="flex gap-2">
              <span className="text-sip-purple-500">3.</span>
              Only you can discover and claim the payment
            </li>
          </ul>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-6 p-4 rounded-xl bg-sip-green-50 dark:bg-sip-green-900/20 border border-sip-green-200 dark:border-sip-green-800">
        <div className="flex gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="font-medium text-sip-green-900 dark:text-sip-green-100">
              One-time addresses
            </p>
            <p className="text-sm text-sip-green-700 dark:text-sip-green-300 mt-1">
              Each payment uses a unique derived address. Your transactions
              cannot be linked together.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
