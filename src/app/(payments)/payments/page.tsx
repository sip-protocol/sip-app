import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Private Payments",
  description:
    "Send and receive shielded payments with stealth addresses and cryptographic privacy.",
}

const actions = [
  {
    name: "Send Payment",
    description: "Send a private payment to any stealth address",
    href: "/payments/send",
    icon: "↗️",
    color: "bg-sip-purple-500",
  },
  {
    name: "Receive Payment",
    description: "Generate a one-time stealth address to receive funds",
    href: "/payments/receive",
    icon: "↘️",
    color: "bg-sip-green-500",
  },
  {
    name: "Scan Payments",
    description: "Scan the blockchain for incoming payments",
    href: "/payments/scan",
    icon: "🔍",
    color: "bg-blue-500",
  },
  {
    name: "History",
    description: "View your transaction history",
    href: "/payments/history",
    icon: "📜",
    color: "bg-amber-500",
  },
  {
    name: "Disclose",
    description: "Share viewing keys for compliance audits",
    href: "/payments/disclose",
    icon: "🔓",
    color: "bg-teal-500",
  },
]

export default function PaymentsDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Private Payments
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Send and receive payments with cryptographic privacy. Your
          transactions, your business.
        </p>
      </div>

      {/* Quick Stats (Placeholder) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Balance", value: "—" },
          { label: "Sent", value: "—" },
          { label: "Received", value: "—" },
          { label: "Pending", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-6 hover:border-[var(--border-hover)] hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${action.color} text-white flex-shrink-0`}
              >
                {action.icon}
              </div>
              <div>
                <h2 className="font-semibold text-lg group-hover:text-sip-purple-600 transition-colors">
                  {action.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-sip-purple-900/20 border border-sip-purple-800">
        <div className="flex gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="font-medium text-sip-purple-100">
              Your privacy is protected
            </p>
            <p className="text-sm text-sip-purple-300 mt-1">
              Stealth addresses ensure your transactions are unlinkable.
              Pedersen commitments hide the amounts. Viewing keys enable
              selective disclosure for compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
