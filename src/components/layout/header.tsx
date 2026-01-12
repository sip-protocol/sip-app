"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ExternalLink } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"

interface NavItem {
  label: string
  href: string
  external?: boolean
}

const navItems: NavItem[] = [
  { label: "Payments", href: "/payments" },
  { label: "Wallet", href: "/wallet" },
  { label: "DEX", href: "/dex" },
  { label: "Enterprise", href: "/enterprise" },
]

const externalLinks: NavItem[] = [
  { label: "Docs", href: "https://docs.sip-protocol.org", external: true },
  { label: "GitHub", href: "https://github.com/sip-protocol", external: true },
]

export function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { publicKey, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial scroll position
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu handler
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  const handleWalletClick = useCallback(() => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }, [connected, disconnect, setVisible])

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-gray-950/80 backdrop-blur-lg border-b border-gray-800/50"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Logo size="md" showText={true} href="/" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActiveLink(item.href)
                      ? "text-white bg-gray-800"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="w-px h-6 bg-gray-800 mx-2" />

              {externalLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  {item.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>

            {/* Right Side: Wallet + Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              {/* Wallet Button */}
              <button
                onClick={handleWalletClick}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25"
              >
                {connected && publicKey
                  ? truncateAddress(publicKey.toBase58())
                  : "Connect Wallet"}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-16 right-0 z-40 w-64 h-[calc(100vh-4rem)] bg-gray-950 border-l border-gray-800 transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActiveLink(item.href)
                  ? "text-white bg-gray-800"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t border-gray-800 my-4" />

          {externalLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              {item.label}
              <ExternalLink className="w-4 h-4" />
            </a>
          ))}
        </nav>
      </div>
    </>
  )
}
