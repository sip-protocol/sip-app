import Link from "next/link"

export default function DexLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border-default)] bg-[var(--surface-primary)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-sip-purple-600 to-sip-purple-400 bg-clip-text text-transparent">
                SIP
              </span>
              <span className="text-xs font-medium text-[var(--text-tertiary)] hidden sm:inline">
                Private DEX
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/dex"
                className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-lg transition-colors"
              >
                Swap
              </Link>
              <Link
                href="/dex/jupiter"
                className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-lg transition-colors"
              >
                Jupiter
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-[var(--surface-secondary)]">{children}</main>
    </div>
  )
}
