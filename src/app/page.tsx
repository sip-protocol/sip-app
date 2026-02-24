"use client"

import Link from "next/link"
import { SDK_VERSION, TEST_COUNTS } from "@/lib/constants"
import {
  PaperPlaneTilt,
  ShieldCheck,
  Bridge,
  Wallet,
  ArrowsClockwise,
  Buildings,
  Scales,
  MaskHappy,
  Trophy,
  Palette,
  Leaf,
  Broadcast,
  GameController,
  Ticket,
  GlobeHemisphereWest,
  Dna,
  MusicNote,
} from "@phosphor-icons/react"
import type { ReactNode } from "react"

interface AppCard {
  name: string
  description: string
  href: string
  icon: ReactNode
  gradient: string
  sponsor?: string
  comingSoon?: boolean
}

const ICON_SIZE = 24

const coreApps: AppCard[] = [
  {
    name: "Private Payments",
    description: "Send and receive shielded payments with stealth addresses",
    href: "/payments",
    icon: <PaperPlaneTilt size={ICON_SIZE} weight="duotone" />,
    gradient: "from-sip-purple-500 to-sip-purple-700",
  },
  {
    name: "Privacy Score",
    description: "Analyze how surveilled your wallet is",
    href: "/privacy-score",
    icon: <ShieldCheck size={ICON_SIZE} weight="duotone" />,
    gradient: "from-red-500 to-orange-500",
  },
  {
    name: "Private Bridge",
    description: "Cross-chain transfers with stealth addresses",
    href: "/bridge",
    icon: <Bridge size={ICON_SIZE} weight="duotone" />,
    gradient: "from-cyan-500 to-cyan-700",
    sponsor: "Wormhole",
  },
  {
    name: "Wallet",
    description: "Manage your viewing keys and stealth addresses",
    href: "/wallet",
    icon: <Wallet size={ICON_SIZE} weight="duotone" />,
    gradient: "from-slate-500 to-slate-700",
    comingSoon: true,
  },
  {
    name: "Private DEX",
    description: "Swap tokens with cryptographic privacy",
    href: "/dex",
    icon: <ArrowsClockwise size={ICON_SIZE} weight="duotone" />,
    gradient: "from-emerald-500 to-emerald-700",
    comingSoon: true,
  },
  {
    name: "Enterprise",
    description: "Compliance dashboard and audit tools",
    href: "/enterprise",
    icon: <Buildings size={ICON_SIZE} weight="duotone" />,
    gradient: "from-gray-500 to-gray-700",
    comingSoon: true,
  },
]

const privacyApps: AppCard[] = [
  {
    name: "Private Governance",
    description: "Commit-reveal voting on DAOs with Pedersen commitments",
    href: "/governance",
    icon: <Scales size={ICON_SIZE} weight="duotone" />,
    gradient: "from-blue-500 to-blue-700",
    sponsor: "Realms",
  },
  {
    name: "Anonymous Social",
    description: "Privacy-first social with stealth identities",
    href: "/social",
    icon: <MaskHappy size={ICON_SIZE} weight="duotone" />,
    gradient: "from-pink-500 to-pink-700",
    sponsor: "Tapestry",
  },
  {
    name: "Privacy Loyalty",
    description: "Earn rewards for privacy actions via campaigns",
    href: "/loyalty",
    icon: <Trophy size={ICON_SIZE} weight="duotone" />,
    gradient: "from-amber-500 to-amber-700",
    sponsor: "Torque",
  },
  {
    name: "Privacy Art",
    description: "Generate unique art from transactions, mint as NFTs",
    href: "/art",
    icon: <Palette size={ICON_SIZE} weight="duotone" />,
    gradient: "from-rose-500 to-rose-700",
    sponsor: "Exchange Art",
  },
  {
    name: "Green Migration",
    description: "Migrate dead protocols with privacy-preserving staking",
    href: "/migrations",
    icon: <Leaf size={ICON_SIZE} weight="duotone" />,
    gradient: "from-green-500 to-green-700",
    sponsor: "Sunrise Stake",
  },
  {
    name: "Privacy NFTs",
    description: "Encrypted NFT drops and privacy education",
    href: "/channel",
    icon: <Broadcast size={ICON_SIZE} weight="duotone" />,
    gradient: "from-violet-500 to-violet-700",
    sponsor: "DRiP",
  },
  {
    name: "Privacy Arena",
    description: "Commit-reveal games with cryptographic commitments",
    href: "/gaming",
    icon: <GameController size={ICON_SIZE} weight="duotone" />,
    gradient: "from-orange-500 to-orange-700",
    sponsor: "MagicBlock",
  },
  {
    name: "Privacy Ticketing",
    description: "Anti-scalping stealth tickets and private attendance",
    href: "/ticketing",
    icon: <Ticket size={ICON_SIZE} weight="duotone" />,
    gradient: "from-teal-500 to-teal-700",
    sponsor: "KYD Labs",
  },
  {
    name: "Privacy Metaverse",
    description:
      "Stealth avatars, private teleportation, anonymous exploration",
    href: "/metaverse",
    icon: <GlobeHemisphereWest size={ICON_SIZE} weight="duotone" />,
    gradient: "from-indigo-500 to-indigo-700",
    sponsor: "Portals",
  },
  {
    name: "Privacy DeSci",
    description:
      "Anonymous research funding, private peer review, stealth contributions",
    href: "/desci",
    icon: <Dna size={ICON_SIZE} weight="duotone" />,
    gradient: "from-lime-500 to-lime-700",
    sponsor: "BIO Protocol",
  },
  {
    name: "Privacy Music",
    description:
      "Private streaming, stealth royalty payments, encrypted playlists",
    href: "/music",
    icon: <MusicNote size={ICON_SIZE} weight="duotone" />,
    gradient: "from-pink-500 to-pink-700",
    sponsor: "Audius",
  },
]

const STATS = [
  { label: "Privacy Apps", value: "13" },
  { label: "Tests", value: TEST_COUNTS.totalDisplay },
  { label: "Status", value: "Mainnet" },
  { label: "SDK", value: SDK_VERSION.display },
]

import { Detective, LockKey, Eye } from "@phosphor-icons/react"

const HOW_IT_WORKS = [
  {
    icon: <Detective size={28} weight="duotone" />,
    title: "Stealth Addresses",
    description: "Unlinkable recipients",
    detail:
      "One-time addresses generated per transaction. No one can link sender to receiver.",
  },
  {
    icon: <LockKey size={28} weight="duotone" />,
    title: "Pedersen Commitments",
    description: "Hidden amounts",
    detail:
      "Cryptographic commitments hide transaction amounts while remaining mathematically verifiable.",
  },
  {
    icon: <Eye size={28} weight="duotone" />,
    title: "Viewing Keys",
    description: "Compliance without surveillance",
    detail:
      "Selective disclosure lets auditors verify without exposing data to the public.",
  },
]

function AppCardComponent({ app }: { app: AppCard }) {
  return (
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
        ${app.comingSoon ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      {app.comingSoon && (
        <span className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-[var(--surface-tertiary)] text-[var(--text-secondary)]">
          Coming Soon
        </span>
      )}
      <div
        className={`
          w-12 h-12 rounded-lg flex items-center justify-center mb-4
          bg-gradient-to-br ${app.gradient} text-white
        `}
      >
        {app.icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-sip-purple-600 transition-colors">
        {app.name}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-3">
        {app.description}
      </p>
      {app.sponsor && (
        <span className="inline-flex items-center text-xs font-medium text-[var(--text-tertiary)] bg-[var(--surface-secondary)] px-2 py-1 rounded-md border border-[var(--border-default)]">
          {app.sponsor}
        </span>
      )}
    </Link>
  )
}

export default function HubPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            The{" "}
            <span className="bg-gradient-to-r from-sip-purple-600 to-sip-green-500 bg-clip-text text-transparent">
              Privacy Layer
            </span>{" "}
            for Solana
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Stealth addresses, Pedersen commitments, and viewing keys — one SDK
            for private transactions on any Solana app.
          </p>
        </div>

        {/* Stat Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="px-4 py-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-primary)]"
            >
              <span className="font-semibold text-sm text-[var(--text-primary)]">
                {stat.value}
              </span>{" "}
              <span className="text-sm text-[var(--text-tertiary)]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-6">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] text-center"
              >
                <span className="mb-3 block text-sip-purple-400">{item.icon}</span>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-sip-green-500 font-medium mb-2">
                  {item.description}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Applications */}
      <section className="px-4 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-6">
            Core Applications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreApps.map((app) => (
              <AppCardComponent key={app.href} app={app} />
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Applications */}
      <section className="px-4 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-6">
            Privacy Applications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {privacyApps.map((app) => (
              <AppCardComponent key={app.href} app={app} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="px-4 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="p-4 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-default)] text-center space-y-2">
            <p className="text-sm text-[var(--text-tertiary)]">
              Built with{" "}
              <code className="text-sip-purple-400 font-mono text-xs">
                {SDK_VERSION.full}
              </code>{" "}
              &mdash; Anchor program live on mainnet
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              <Link
                href="/showcase/graveyard-2026"
                className="text-sip-purple-400 hover:text-sip-purple-300 transition-colors"
              >
                Solana Graveyard Hackathon 2026 Showcase &rarr;
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
