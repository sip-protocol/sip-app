import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Private Bridge",
  description:
    "Bridge tokens across chains with cryptographic privacy via Wormhole NTT and stealth addresses.",
}

const actions = [
  {
    name: "Bridge Tokens",
    description: "Transfer tokens cross-chain with privacy-preserving stealth addresses",
    href: "/bridge",
    icon: "🌉",
    color: "bg-cyan-500",
    disabled: true,
  },
  {
    name: "Bridge History",
    description: "Track your cross-chain transfers and claim pending bridged tokens",
    href: "/bridge/history",
    icon: "📋",
    color: "bg-blue-500",
    disabled: true,
  },
]

const stats = [
  { label: "Supported Chains", value: "—" },
  { label: "Total Bridged", value: "—" },
  { label: "Privacy Score", value: "—" },
  { label: "Pending", value: "—" },
]

export default function BridgePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Private Bridge
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Cross-chain token transfers with stealth addresses. Bridge between
          Solana, Ethereum, and more — privately.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
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
          <div
            key={action.href + action.name}
            className={`group bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-6 ${
              action.disabled
                ? "opacity-60"
                : "hover:border-[var(--border-hover)] hover:shadow-md"
            } transition-all`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${action.color} text-white flex-shrink-0`}
              >
                {action.icon}
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {action.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-cyan-900/20 border border-cyan-800">
        <div className="flex gap-3">
          <span className="text-xl">🌉</span>
          <div>
            <p className="font-medium text-cyan-100">
              Powered by Wormhole NTT
            </p>
            <p className="text-sm text-cyan-300 mt-1">
              Native Token Transfers enable cross-chain bridging directly to
              stealth addresses. Your destination address stays private — even
              the bridge relayer cannot link sender to receiver.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
