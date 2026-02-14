import Link from "next/link"

const apps = [
  {
    name: "Private Payments",
    description: "Send and receive shielded payments with stealth addresses",
    href: "/payments",
    icon: "💸",
    status: "live" as const,
    gradient: "from-sip-purple-500 to-sip-purple-700",
  },
  {
    name: "Privacy Score",
    description: "Analyze how surveilled your wallet is",
    href: "/privacy-score",
    icon: "🔍",
    status: "live" as const,
    gradient: "from-red-500 to-orange-500",
  },
  {
    name: "Private Bridge",
    description: "Cross-chain transfers with stealth addresses via Wormhole",
    href: "/bridge",
    icon: "🌉",
    status: "live" as const,
    gradient: "from-cyan-500 to-cyan-700",
  },
  {
    name: "Private Governance",
    description:
      "Commit-reveal voting on Realms DAOs with Pedersen commitments",
    href: "/governance",
    icon: "🗳️",
    status: "live" as const,
    gradient: "from-blue-500 to-blue-700",
  },
  {
    name: "Anonymous Social",
    description: "Privacy-first social with stealth identities on Tapestry",
    href: "/social",
    icon: "🎭",
    status: "live" as const,
    gradient: "from-pink-500 to-pink-700",
  },
  {
    name: "Privacy Loyalty",
    description: "Earn rewards for privacy actions via Torque campaigns",
    href: "/loyalty",
    icon: "🏆",
    status: "live" as const,
    gradient: "from-amber-500 to-amber-700",
  },
  {
    name: "Privacy Art",
    description: "Generate unique art from transactions, mint as NFTs",
    href: "/art",
    icon: "🎨",
    status: "live" as const,
    gradient: "from-rose-500 to-rose-700",
  },
  {
    name: "Green Migration",
    description: "Migrate dead protocols to Sunrise Stake with privacy",
    href: "/migrations",
    icon: "🌱",
    status: "live" as const,
    gradient: "from-green-500 to-green-700",
  },
  {
    name: "Privacy Channel",
    description: "Encrypted content drops and privacy education via DRiP",
    href: "/channel",
    icon: "📡",
    status: "live" as const,
    gradient: "from-violet-500 to-violet-700",
  },
  {
    name: "Wallet",
    description: "Manage your viewing keys and stealth addresses",
    href: "/wallet",
    icon: "👛",
    status: "coming" as const,
    gradient: "from-slate-500 to-slate-700",
  },
  {
    name: "Private DEX",
    description: "Swap tokens with cryptographic privacy",
    href: "/dex",
    icon: "🔄",
    status: "coming" as const,
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    name: "Enterprise",
    description: "Compliance dashboard and audit tools",
    href: "/enterprise",
    icon: "🏢",
    status: "coming" as const,
    gradient: "from-gray-500 to-gray-700",
  },
]

export default function HubPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Privacy for{" "}
            <span className="bg-gradient-to-r from-sip-purple-600 to-sip-green-500 bg-clip-text text-transparent">
              Everyone
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            The world-class privacy application for Web3. Stealth addresses,
            hidden amounts, and viewing keys for compliance.
          </p>
        </div>

        {/* App Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className={`
                group relative overflow-hidden rounded-xl p-6
                border border-[var(--border-default)]
                bg-[var(--surface-primary)]
                hover:border-[var(--border-hover)]
                hover:shadow-lg
                transition-all duration-200
                ${app.status === "coming" ? "opacity-60 pointer-events-none" : ""}
              `}
            >
              {app.status === "coming" && (
                <span className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-[var(--surface-tertiary)] text-[var(--text-secondary)]">
                  Coming Soon
                </span>
              )}
              <div
                className={`
                  w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4
                  bg-gradient-to-br ${app.gradient} text-white
                `}
              >
                {app.icon}
              </div>
              <h2 className="text-lg font-semibold mb-2 group-hover:text-sip-purple-600 transition-colors">
                {app.name}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {app.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
