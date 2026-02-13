import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Loyalty",
  description:
    "Earn rewards for privacy actions. Complete campaigns without surveillance.",
}

const actions = [
  {
    name: "Active Campaigns",
    description: "Browse privacy challenges and earn stealth rewards",
    href: "/loyalty",
    icon: "🎯",
    color: "bg-amber-500",
    disabled: true,
  },
  {
    name: "Claim Rewards",
    description: "Claim earned rewards to your stealth address",
    href: "/loyalty/rewards",
    icon: "🎁",
    color: "bg-sip-green-500",
    disabled: true,
  },
]

const stats = [
  { label: "Campaigns", value: "—" },
  { label: "Completed", value: "—" },
  { label: "Rewards Earned", value: "—" },
  { label: "Streak", value: "—" },
]

export default function LoyaltyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Privacy Loyalty
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Earn rewards for using privacy features. Complete campaigns, build
          streaks, and claim rewards — all without surveillance.
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
                <h2 className="font-semibold text-lg">{action.name}</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-amber-900/20 border border-amber-800">
        <div className="flex gap-3">
          <span className="text-xl">🏆</span>
          <div>
            <p className="font-medium text-amber-100">
              Powered by Torque Protocol
            </p>
            <p className="text-sm text-amber-300 mt-1">
              Privacy actions are tracked off-chain using Torque events — no
              on-chain footprint. Rewards are distributed to stealth addresses,
              keeping your loyalty activity private.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
