import Link from "next/link"
import { XLogoIcon, GithubLogoIcon, BookOpenIcon } from "@phosphor-icons/react"
import { Logo } from "@/components/ui/logo"

const footerSections = [
  {
    title: "Protocol",
    links: [
      { label: "About", href: "https://sip-protocol.org/about" },
      { label: "Roadmap", href: "https://sip-protocol.org/roadmap" },
      { label: "Whitepaper", href: "https://sip-protocol.org/whitepaper" },
    ],
  },
  {
    title: "Applications",
    links: [
      { label: "Payments", href: "/payments" },
      { label: "Wallet", href: "/wallet" },
      { label: "DEX", href: "/dex" },
      { label: "Enterprise", href: "/enterprise" },
    ],
  },
  {
    title: "Developers",
    links: [
      {
        label: "Documentation",
        href: "https://docs.sip-protocol.org",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/sip-protocol",
        external: true,
      },
      {
        label: "SDK",
        href: "https://www.npmjs.com/package/@sip-protocol/sdk",
        external: true,
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        label: "Twitter",
        href: "https://x.com/sipprotocol",
        external: true,
      },
      { label: "Blog", href: "https://blog.sip-protocol.org", external: true },
    ],
  },
]

const socialLinks = [
  {
    icon: XLogoIcon,
    href: "https://x.com/sipprotocol",
    label: "Twitter",
  },
  {
    icon: GithubLogoIcon,
    href: "https://github.com/sip-protocol",
    label: "GitHub",
  },
  { icon: BookOpenIcon, href: "https://docs.sip-protocol.org", label: "Docs" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Logo size="md" showText={true} href="https://sip-protocol.org" />
              <p className="mt-4 text-sm text-gray-400 max-w-xs">
                The privacy standard for Web3. Stealth addresses, hidden
                amounts, and viewing keys for compliance.
              </p>
              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : link.href.startsWith("http") ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} SIP Protocol. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Built with 💜 for Web3 privacy
          </p>
        </div>
      </div>
    </footer>
  )
}
