"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SIPProvider } from "@/contexts"

const navItems = [
  { name: "Swap", href: "/dex" },
  { name: "Jupiter", href: "/dex/jupiter" },
]

export default function DexLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dex") return pathname === "/dex"
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* DEX Sub-Navigation */}
      <div className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive(item.href)
                    ? "border-purple-500 text-white"
                    : "border-transparent text-gray-400 hover:text-white hover:border-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-900/30">
        <SIPProvider>{children}</SIPProvider>
      </main>
    </div>
  )
}
