import Link from "next/link"
import { Logo } from "@/components/ui/logo"

// Social Icons (inline SVGs to avoid deprecated lucide icons)
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function DocsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

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
    icon: TwitterIcon,
    href: "https://x.com/sipprotocol",
    label: "Twitter",
  },
  {
    icon: GithubIcon,
    href: "https://github.com/sip-protocol",
    label: "GitHub",
  },
  { icon: DocsIcon, href: "https://docs.sip-protocol.org", label: "Docs" },
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
                    <social.icon className="w-5 h-5" />
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
