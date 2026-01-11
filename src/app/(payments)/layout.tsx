"use client"

import Link from "next/link"
import { WalletButton } from "@/components/shared/wallet-button"

const navItems = [
  { name: "Dashboard", href: "/payments" },
  { name: "Send", href: "/payments/send" },
  { name: "Receive", href: "/payments/receive" },
  { name: "Scan", href: "/payments/scan" },
  { name: "History", href: "/payments/history" },
]

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--surface-primary)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-sip-purple-600 to-sip-purple-400 bg-clip-text text-transparent">
                SIP
              </span>
              <span className="text-xs font-medium text-[var(--text-tertiary)] hidden sm:inline">
                Private Payments
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Wallet */}
            <WalletButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-[var(--border-default)]">
          <div className="flex overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-shrink-0 px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-[var(--surface-secondary)]">{children}</main>
    </div>
  )
}
