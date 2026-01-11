import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Send Payment",
  description: "Send a private payment using stealth addresses.",
}

export default function SendPaymentPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Send Payment</h1>
        <p className="text-[var(--text-secondary)]">
          Send a private payment to any stealth address
        </p>
      </div>

      {/* Send Form Card */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8">
        {/* Amount Input */}
        <div className="mb-6">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
          >
            Amount
          </label>
          <div className="relative">
            <input
              type="text"
              id="amount"
              placeholder="0.00"
              className="w-full px-4 py-4 text-3xl font-semibold bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-sip-purple-500/20 transition-all"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-medium bg-[var(--surface-tertiary)] hover:bg-[var(--border-default)] rounded-lg transition-colors flex items-center gap-2"
            >
              <span>SOL</span>
              <span className="text-[var(--text-tertiary)]">▼</span>
            </button>
          </div>
        </div>

        {/* Recipient Input */}
        <div className="mb-6">
          <label
            htmlFor="recipient"
            className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
          >
            Recipient Stealth Address
          </label>
          <input
            type="text"
            id="recipient"
            placeholder="sip:solana:02abc...123:03def...456"
            className="w-full px-4 py-3 bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-sip-purple-500/20 transition-all font-mono text-sm"
          />
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">
            Enter the recipient&apos;s SIP stealth meta-address
          </p>
        </div>

        {/* Privacy Level */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
            Privacy Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                level: "shielded",
                label: "Shielded",
                desc: "Full privacy",
                active: true,
              },
              {
                level: "compliant",
                label: "Compliant",
                desc: "With viewing key",
                active: false,
              },
              {
                level: "transparent",
                label: "Transparent",
                desc: "No privacy",
                active: false,
              },
            ].map((option) => (
              <button
                key={option.level}
                type="button"
                className={`p-3 rounded-xl border text-left transition-all ${
                  option.active
                    ? "border-sip-purple-500 bg-sip-purple-50 dark:bg-sip-purple-900/20"
                    : "border-[var(--border-default)] hover:border-[var(--border-hover)]"
                }`}
              >
                <p
                  className={`font-medium text-sm ${option.active ? "text-sip-purple-700 dark:text-sip-purple-300" : ""}`}
                >
                  {option.label}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {option.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <button
          type="button"
          disabled
          className="w-full py-4 px-6 text-lg font-semibold rounded-xl bg-sip-purple-600 text-white hover:bg-sip-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Connect Wallet to Send
        </button>

        {/* Transaction Details */}
        <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Network Fee</span>
            <span className="text-[var(--text-primary)]">~0.00001 SOL</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-sip-green-500 font-medium">
              🔒 Fully Shielded
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
