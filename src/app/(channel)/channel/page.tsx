import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Channel",
  description:
    "Encrypted content distribution. Subscribe with viewing keys, receive privacy education drops via DRiP.",
}

const actions = [
  {
    name: "Channel Feed",
    description: "Browse encrypted privacy education content and drops",
    href: "/channel",
    icon: "📡",
    color: "bg-purple-600",
    disabled: true,
  },
  {
    name: "Create Content",
    description: "Publish encrypted drops for your subscribers",
    href: "/channel/create",
    icon: "✍️",
    color: "bg-indigo-500",
    disabled: true,
  },
]

const stats = [
  { label: "Subscribers", value: "—" },
  { label: "Drops", value: "—" },
  { label: "Encrypted", value: "—" },
  { label: "Access Tier", value: "—" },
]

export default function ChannelPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Privacy Channel
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Encrypted content distribution powered by DRiP. Subscribe with your
          viewing key to access privacy education content and exclusive drops.
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
      <div className="mt-10 p-4 rounded-xl bg-purple-900/20 border border-purple-800">
        <div className="flex gap-3">
          <span className="text-xl">📡</span>
          <div>
            <p className="font-medium text-purple-100">
              Powered by DRiP Protocol
            </p>
            <p className="text-sm text-purple-300 mt-1">
              Content is encrypted with viewing key-gated access. Free, subscriber,
              and premium tiers. Drops are distributed as compressed NFTs — privacy
              education delivered directly to your wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
