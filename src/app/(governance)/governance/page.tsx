import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Private Governance",
  description:
    "Vote on DAO proposals with cryptographic privacy using Pedersen commit-reveal.",
}

const actions = [
  {
    name: "Browse DAOs",
    description: "Explore Realms DAOs and their active proposals",
    href: "/governance",
    icon: "🏛️",
    color: "bg-blue-600",
    disabled: true,
  },
  {
    name: "Private Vote",
    description: "Cast hidden votes using Pedersen commit-reveal",
    href: "/governance/vote",
    icon: "🗳️",
    color: "bg-sip-purple-500",
    disabled: true,
  },
]

const stats = [
  { label: "Active DAOs", value: "—" },
  { label: "Open Proposals", value: "—" },
  { label: "Your Votes", value: "—" },
  { label: "Unrevealed", value: "—" },
]

export default function GovernancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Private Governance
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Vote on DAO proposals without revealing your choice until the reveal
          period. Powered by Pedersen commitments on Realms.
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
      <div className="mt-10 p-4 rounded-xl bg-blue-900/20 border border-blue-800">
        <div className="flex gap-3">
          <span className="text-xl">🗳️</span>
          <div>
            <p className="font-medium text-blue-100">
              Commit-Reveal Voting
            </p>
            <p className="text-sm text-blue-300 mt-1">
              Your vote is hidden behind a Pedersen commitment until the reveal
              period. No one — not even validators — can see how you voted
              before reveals begin. Viewing keys allow selective disclosure for
              compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
