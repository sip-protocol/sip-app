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
    name: "Wallet",
    description: "Manage your viewing keys and stealth addresses",
    href: "/wallet",
    icon: "👛",
    status: "coming" as const,
    gradient: "from-blue-500 to-blue-700",
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
    gradient: "from-amber-500 to-amber-700",
  },
]

export default function HubPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--surface-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-sip-purple-600 to-sip-purple-400 bg-clip-text text-transparent">
              SIP
            </span>
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Protocol
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <a
              href="https://docs.sip-protocol.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Docs
            </a>
            <a
              href="https://github.com/sip-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
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

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] bg-[var(--surface-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Built by{" "}
            <a
              href="https://sip-protocol.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sip-purple-600 hover:underline"
            >
              SIP Protocol
            </a>
          </p>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <span>Privacy is a right, not a privilege.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
