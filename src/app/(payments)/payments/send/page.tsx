import type { Metadata } from "next"
import { SendShieldedForm } from "@/components/payments"

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

      {/* Form */}
      <SendShieldedForm />

      {/* Info Banner */}
      <div className="mt-8 p-4 rounded-xl bg-sip-purple-900/20 border border-sip-purple-800">
        <div className="flex gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="font-medium text-sip-purple-100">
              How shielded payments work
            </p>
            <p className="text-sm text-sip-purple-300 mt-1">
              Your payment is sent to a one-time stealth address derived from
              the recipient&apos;s meta-address. The amount is hidden using a
              Pedersen commitment. Only the recipient can discover and claim the
              funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
