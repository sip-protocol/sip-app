import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Providers } from "@/providers"
import { Header, Footer } from "@/components/layout"
import { AdvisorWidget } from "@/components/advisor"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "SIP Protocol | Private Payments",
    template: "%s | SIP Protocol",
  },
  description:
    "The world-class privacy application for Web3. Send and receive private payments with stealth addresses and cryptographic privacy.",
  keywords: [
    "privacy",
    "crypto",
    "solana",
    "stealth addresses",
    "private payments",
    "web3",
    "blockchain",
    "SIP Protocol",
  ],
  authors: [{ name: "SIP Protocol", url: "https://sip-protocol.org" }],
  creator: "SIP Protocol",
  publisher: "SIP Protocol",
  metadataBase: new URL("https://app.sip-protocol.org"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.sip-protocol.org",
    siteName: "SIP Protocol",
    title: "SIP Protocol | Private Payments",
    description:
      "The world-class privacy application for Web3. Send and receive private payments with stealth addresses.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SIP Protocol - Private Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIP Protocol | Private Payments",
    description:
      "The world-class privacy application for Web3. Send and receive private payments.",
    images: ["/og-image.png"],
    creator: "@saborproject",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#030505", // Dark-only theme (matches sip-website)
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col bg-gray-950 text-white`}
      >
        <Providers>
          <Header />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
          <AdvisorWidget />
        </Providers>
      </body>
    </html>
  )
}
