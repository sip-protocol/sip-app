import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Anonymous Social",
  description:
    "Privacy-first social interactions powered by stealth identities and Tapestry Protocol.",
}

const actions = [
  {
    name: "Anonymous Feed",
    description: "Browse and post content with your stealth identity",
    href: "/social",
    icon: "📰",
    color: "bg-pink-500",
    disabled: true,
  },
  {
    name: "Stealth Profile",
    description: "Manage your anonymous on-chain identity",
    href: "/social/profile",
    icon: "👤",
    color: "bg-violet-500",
    disabled: true,
  },
  {
    name: "Private Connections",
    description: "Follow and connect without revealing your identity",
    href: "/social/connections",
    icon: "🤝",
    color: "bg-indigo-500",
    disabled: true,
  },
]

const stats = [
  { label: "Identities", value: "—" },
  { label: "Connections", value: "—" },
  { label: "Posts", value: "—" },
  { label: "Privacy Level", value: "—" },
]

export default function SocialPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Anonymous Social
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          The first privacy layer for on-chain social. Post, follow, and connect
          without revealing your wallet address.
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
      <div className="mt-10 p-4 rounded-xl bg-pink-900/20 border border-pink-800">
        <div className="flex gap-3">
          <span className="text-xl">🎭</span>
          <div>
            <p className="font-medium text-pink-100">
              Powered by Tapestry Protocol
            </p>
            <p className="text-sm text-pink-300 mt-1">
              Stealth identities let you participate in on-chain social without
              linking your activity to your wallet. Create multiple personas,
              each with its own stealth address.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
