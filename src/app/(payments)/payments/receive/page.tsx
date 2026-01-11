"use client"

import { StealthAddressGenerator } from "@/components/payments/stealth-address-generator"

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

      {/* Stealth Address Generator */}
      <StealthAddressGenerator />

      {/* How it works */}
      <div className="mt-8 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6">
        <h3 className="font-medium mb-4">How it works</h3>
        <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sip-purple-500/20 text-sip-purple-400 flex items-center justify-center text-xs font-medium">
              1
            </span>
            <span>Share your stealth meta-address with the sender</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sip-purple-500/20 text-sip-purple-400 flex items-center justify-center text-xs font-medium">
              2
            </span>
            <span>Sender generates a one-time address just for you</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sip-purple-500/20 text-sip-purple-400 flex items-center justify-center text-xs font-medium">
              3
            </span>
            <span>Only you can discover and claim the payment</span>
          </li>
        </ul>
      </div>

      {/* Security Note */}
      <div className="mt-6 p-4 rounded-xl bg-sip-green-500/10 border border-sip-green-500/30">
        <div className="flex gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="font-medium text-sip-green-400">One-time addresses</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Each payment uses a unique derived address. Your transactions
              cannot be linked together.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
