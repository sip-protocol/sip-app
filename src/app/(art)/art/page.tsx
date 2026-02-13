import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Art",
  description:
    "Generate unique privacy-themed art from your transactions. Mint as compressed NFTs.",
}

const actions = [
  {
    name: "Art Gallery",
    description: "Browse privacy art generated from shielded transactions",
    href: "/art",
    icon: "🖼️",
    color: "bg-rose-500",
    disabled: true,
  },
  {
    name: "Create Art",
    description: "Generate deterministic art from transaction parameters",
    href: "/art/create",
    icon: "🎨",
    color: "bg-fuchsia-500",
    disabled: true,
  },
  {
    name: "Mint NFT",
    description: "Mint your privacy art as compressed NFTs on Exchange Art",
    href: "/art/mint",
    icon: "💎",
    color: "bg-violet-500",
    disabled: true,
  },
]

const stats = [
  { label: "Art Created", value: "—" },
  { label: "NFTs Minted", value: "—" },
  { label: "Collection", value: "—" },
  { label: "Art Styles", value: "3" },
]

export default function ArtPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Art</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Every privacy transaction creates unique generative art. Three styles —
          Cipher Bloom, Stealth Grid, Commitment Flow — each derived from your
          transaction parameters.
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
      <div className="mt-10 p-4 rounded-xl bg-rose-900/20 border border-rose-800">
        <div className="flex gap-3">
          <span className="text-xl">🎨</span>
          <div>
            <p className="font-medium text-rose-100">
              Deterministic Generative Art
            </p>
            <p className="text-sm text-rose-300 mt-1">
              Art parameters are derived from public transaction data (timestamp,
              block hash, ephemeral key) — never from private information. Same
              inputs always produce the same art. Mint as compressed NFTs for
              ~$0.001 each.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
