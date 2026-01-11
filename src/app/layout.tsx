import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  )
}
