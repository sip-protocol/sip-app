"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Shield,
  Lock,
  Eye,
  Trophy,
  ExternalLink,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  Github,
  FileText,
  ChevronDown,
  ArrowRight,
  Skull,
  Sprout,
  AlertTriangle,
  Sparkles,
  CheckCircle,
} from "lucide-react"
import { DEPLOYMENTS } from "@/lib/constants"

// ============================================================================
// Data
// ============================================================================

type IntegrationLevel = "live-api" | "sdk" | "on-chain" | "enhanced-sim"

interface SponsorTrack {
  name: string
  sponsor: string
  href: string
  icon: string
  gradient: string
  primitive: string
  whyDied: string
  revival: string
  integration: IntegrationLevel
}

const SPONSOR_TRACKS: SponsorTrack[] = [
  {
    name: "Private Governance",
    sponsor: "Realms",
    href: "/governance",
    icon: "\u{1F5F3}\uFE0F",
    gradient: "from-blue-500 to-blue-700",
    primitive: "Commit-reveal voting",
    whyDied: "Visible votes enabled whale manipulation",
    revival: "Commit-reveal ballots hide votes",
    integration: "on-chain",
  },
  {
    name: "Anonymous Social",
    sponsor: "Tapestry",
    href: "/social",
    icon: "\u{1F3AD}",
    gradient: "from-pink-500 to-pink-700",
    primitive: "Stealth social identities",
    whyDied: "Public wallets enabled doxxing",
    revival: "Stealth social identities",
    integration: "sdk",
  },
  {
    name: "Privacy Loyalty",
    sponsor: "Torque",
    href: "/loyalty",
    icon: "\u{1F3C6}",
    gradient: "from-amber-500 to-amber-700",
    primitive: "Anonymous reward claims",
    whyDied: "Transparent rewards exposed behavior",
    revival: "Anonymous stealth claims",
    integration: "live-api",
  },
  {
    name: "Privacy Art",
    sponsor: "Exchange Art",
    href: "/art",
    icon: "\u{1F3A8}",
    gradient: "from-rose-500 to-rose-700",
    primitive: "Stealth NFT minting",
    whyDied: "Public minting revealed collectors",
    revival: "Stealth NFT minting",
    integration: "on-chain",
  },
  {
    name: "Green Migration",
    sponsor: "Sunrise Stake",
    href: "/migrations",
    icon: "\u{1F331}",
    gradient: "from-green-500 to-green-700",
    primitive: "Private protocol migration",
    whyDied: "Visible migrations were front-run",
    revival: "Private token consolidation",
    integration: "on-chain",
  },
  {
    name: "Privacy NFTs",
    sponsor: "DRiP",
    href: "/channel",
    icon: "\u{1F4E1}",
    gradient: "from-violet-500 to-violet-700",
    primitive: "Encrypted NFT drops",
    whyDied: "Subscriber lists became spam targets",
    revival: "Encrypted stealth drops",
    integration: "live-api",
  },
  {
    name: "Privacy Arena",
    sponsor: "MagicBlock",
    href: "/gaming",
    icon: "\u{1F3AE}",
    gradient: "from-orange-500 to-orange-700",
    primitive: "Commit-reveal gameplay",
    whyDied: "Transparent state enabled cheating",
    revival: "Commit-reveal gameplay",
    integration: "enhanced-sim",
  },
  {
    name: "Privacy Ticketing",
    sponsor: "KYD Labs",
    href: "/ticketing",
    icon: "\u{1F3AB}",
    gradient: "from-teal-500 to-teal-700",
    primitive: "Anti-scalping stealth tickets",
    whyDied: "Visible ownership enabled scalping",
    revival: "Anti-scalping stealth tickets",
    integration: "live-api",
  },
  {
    name: "Privacy Metaverse",
    sponsor: "Portals",
    href: "/metaverse",
    icon: "\u{1F310}",
    gradient: "from-indigo-500 to-indigo-700",
    primitive: "Stealth avatar identities",
    whyDied: "Wallet-linked avatars killed anonymity",
    revival: "Stealth avatar identities",
    integration: "enhanced-sim",
  },
  {
    name: "Privacy DeSci",
    sponsor: "BIO Protocol",
    href: "/desci",
    icon: "\u{1F9EC}",
    gradient: "from-lime-500 to-lime-700",
    primitive: "Anonymous research funding",
    whyDied: "Public funding biased peer review",
    revival: "Anonymous research funding",
    integration: "enhanced-sim",
  },
  {
    name: "Privacy Music",
    sponsor: "Audius",
    href: "/music",
    icon: "\u{1F3B5}",
    gradient: "from-pink-500 to-pink-700",
    primitive: "Stealth listener identity",
    whyDied: "Public listening data was monetized",
    revival: "Stealth listener identity",
    integration: "live-api",
  },
]

const CRYPTO_PRIMITIVES = [
  {
    icon: Shield,
    title: "Stealth Addresses",
    description: "Unlinkable recipients",
    detail:
      "One-time addresses per interaction. No one can link your wallet to your activity.",
    color: "green",
  },
  {
    icon: Lock,
    title: "Pedersen Commitments",
    description: "Hidden amounts",
    detail:
      "Cryptographic commitments hide values while remaining mathematically verifiable.",
    color: "purple",
  },
  {
    icon: Eye,
    title: "Viewing Keys",
    description: "Compliance without surveillance",
    detail:
      "Selective disclosure lets auditors verify without exposing data to the public.",
    color: "cyan",
  },
]

const STATS = [
  { value: "11", label: "Sponsor Tracks" },
  { value: "865+", label: "Tests Passing" },
  { value: "Mainnet", label: "Anchor Program" },
  { value: "v0.7.3", label: "SDK Version" },
]

const INTEGRATION_BADGES: Record<
  IntegrationLevel,
  { label: string; color: string }
> = {
  "live-api": { label: "Live API", color: "bg-green-800 text-green-300" },
  sdk: { label: "SDK", color: "bg-blue-800 text-blue-300" },
  "on-chain": { label: "On-Chain", color: "bg-purple-800 text-purple-300" },
  "enhanced-sim": { label: "Enhanced", color: "bg-amber-800 text-amber-300" },
}

// ============================================================================
// Page
// ============================================================================

export default function GraveyardShowcase2026() {
  return (
    <>
      <HeroSection />
      <PrimitivesSection />
      <ResurrectionSection />
      <TracksSection />
      <TractionSection />
      <LinksSection />
    </>
  )
}

// ============================================================================
// Hero
// ============================================================================

function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[80vh] flex items-center">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Shield className="w-4 h-4" />
              Solana Graveyard Hackathon 2026
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Trophy className="w-3.5 h-3.5" />
              Zypherpunk 2025 Winner
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
          >
            Privacy for Every{" "}
            <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              Dead Category
            </span>{" "}
            on Solana
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto"
          >
            11 categories died because users were exposed. SIP resurrects them
            with one privacy layer &mdash; stealth addresses, hidden amounts,
            and viewing keys for compliance.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800"
              >
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
          >
            <a
              href="https://app.sip-protocol.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-green-500 rounded-lg hover:from-purple-600 hover:to-green-600 transition-all font-medium flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Try the App
            </a>
            <a
              href="https://github.com/sip-protocol/sip-app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 text-gray-300 border border-gray-700 rounded-lg hover:text-white hover:border-gray-600 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-gray-600 animate-bounce" />
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// Cryptographic Primitives
// ============================================================================

const primitiveColors = {
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: "text-green-400",
    accent: "text-green-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: "text-purple-400",
    accent: "text-purple-400",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    icon: "text-cyan-400",
    accent: "text-cyan-400",
  },
}

function PrimitivesSection() {
  return (
    <section className="py-20 border-t border-gray-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-gray-500 uppercase tracking-wider"
          >
            One Privacy Layer, Three Primitives
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {CRYPTO_PRIMITIVES.map((item, index) => {
            const colors =
              primitiveColors[item.color as keyof typeof primitiveColors]
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl ${colors.bg} border ${colors.border} text-center`}
              >
                <item.icon className={`w-8 h-8 mx-auto mb-3 ${colors.icon}`} />
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className={`text-sm font-medium mb-2 ${colors.accent}`}>
                  {item.description}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.detail}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Category Resurrection (NEW)
// ============================================================================

function ResurrectionSection() {
  const stages = [
    {
      icon: AlertTriangle,
      title: "The Problem",
      description: "Transparent blockchains expose everything",
      tint: "from-red-900/30 to-red-900/10",
      border: "border-red-500/20",
      iconColor: "text-red-400",
      titleColor: "text-red-400",
    },
    {
      icon: Sparkles,
      title: "The Solution",
      description: "One privacy layer with three primitives",
      tint: "from-purple-900/30 to-purple-900/10",
      border: "border-purple-500/20",
      iconColor: "text-purple-400",
      titleColor: "text-purple-400",
    },
    {
      icon: CheckCircle,
      title: "The Result",
      description: "Dead categories come alive again",
      tint: "from-green-900/30 to-green-900/10",
      border: "border-green-500/20",
      iconColor: "text-green-400",
      titleColor: "text-green-400",
    },
  ]

  return (
    <section className="py-20 border-t border-gray-800/50 bg-gray-900/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold"
          >
            From Exposure to Revival
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-gray-400 max-w-2xl mx-auto"
          >
            11 categories died because users were exposed. We&apos;re building
            the antidote.
          </motion.p>
        </div>

        {/* Horizontal flow (desktop) / Vertical flow (mobile) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0">
          {stages.map((stage, index) => (
            <div key={stage.title} className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`flex-1 p-6 rounded-2xl bg-gradient-to-b ${stage.tint} border ${stage.border} text-center sm:min-w-[200px]`}
              >
                <stage.icon
                  className={`w-8 h-8 mx-auto mb-3 ${stage.iconColor}`}
                />
                <h3 className={`font-semibold text-sm mb-1 ${stage.titleColor}`}>
                  {stage.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {stage.description}
                </p>
              </motion.div>

              {/* Arrow between stages */}
              {index < stages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.1 }}
                  className="flex items-center justify-center px-3 py-2"
                >
                  <ArrowRight className="w-5 h-5 text-gray-600 hidden sm:block" />
                  <ChevronDown className="w-5 h-5 text-gray-600 sm:hidden" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Sponsor Tracks Grid
// ============================================================================

function TracksSection() {
  return (
    <section className="py-20 border-t border-gray-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"
          >
            11 Sponsor Tracks
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl sm:text-4xl font-bold"
          >
            Every Dead Category, Resurrected
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-400 max-w-2xl mx-auto"
          >
            Each sponsor track gets a dedicated privacy application built with
            real cryptography &mdash; not mocks, not simulations of the core
            primitives.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPONSOR_TRACKS.map((track, index) => {
            const badge = INTEGRATION_BADGES[track.integration]
            return (
              <motion.div
                key={track.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={track.href}
                  className="group block p-5 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-gradient-to-br ${track.gradient} text-white`}
                    >
                      {track.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm group-hover:text-purple-400 transition-colors">
                          {track.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {track.primitive}
                      </p>

                      {/* Death/Revival narrative */}
                      <div className="mb-2 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Skull className="w-3 h-3 text-red-400/60 flex-shrink-0" />
                          <span className="text-xs text-red-400/60 leading-tight">
                            {track.whyDied}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Sprout className="w-3 h-3 text-green-400/60 flex-shrink-0" />
                          <span className="text-xs text-green-400/60 leading-tight">
                            {track.revival}
                          </span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex text-xs font-medium text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                          {track.sponsor}
                        </span>
                        <span
                          className={`inline-flex text-xs font-medium px-2 py-0.5 rounded ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Traction
// ============================================================================

function TractionSection() {
  const metrics = [
    {
      value: "$6,500",
      label: "Zypherpunk Winner",
      detail: "#9 of 93, 3 tracks",
      color: "from-yellow-900/30 to-amber-900/30 border-yellow-500/20",
      text: "from-yellow-400 to-amber-400",
    },
    {
      value: "865+",
      label: "Tests Passing",
      detail: "SDK + React + App + 11 Tracks",
      color: "from-green-900/30 to-emerald-900/30 border-green-500/20",
      text: "from-green-400 to-emerald-400",
    },
    {
      value: "Mainnet",
      label: "Anchor Program",
      detail: DEPLOYMENTS.mainnet.programId.slice(0, 12) + "...",
      color: "from-cyan-900/30 to-teal-900/30 border-cyan-500/20",
      text: "from-cyan-400 to-teal-400",
    },
    {
      value: "$10K",
      label: "Superteam Grant",
      detail: "Approved Jan 2026",
      color: "from-purple-900/30 to-pink-900/30 border-purple-500/20",
      text: "from-purple-400 to-pink-400",
    },
  ]

  return (
    <section className="py-20 border-t border-gray-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold"
          >
            Built, Not Vaporware
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 rounded-xl bg-gradient-to-br ${metric.color} border text-center`}
            >
              <div
                className={`text-2xl font-bold bg-gradient-to-r ${metric.text} bg-clip-text text-transparent`}
              >
                {metric.value}
              </div>
              <div className="mt-1 text-white font-medium text-sm">
                {metric.label}
              </div>
              <div className="mt-1 text-xs text-gray-500">{metric.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Links
// ============================================================================

function LinksSection() {
  return (
    <section className="py-20 border-t border-gray-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-r from-purple-900/40 to-green-900/40 border border-purple-500/20 overflow-hidden"
        >
          <div className="px-8 py-12 sm:px-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">Try It Live</h2>
            <p className="mt-3 text-gray-400 max-w-xl mx-auto">
              All 11 tracks are live at app.sip-protocol.org. Real cryptography,
              real stealth addresses, real Anchor program on mainnet.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://app.sip-protocol.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-white bg-gradient-to-r from-purple-500 to-green-500 rounded-lg hover:from-purple-600 hover:to-green-600 transition-all font-medium flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Open App
              </a>
              <a
                href="https://docs.sip-protocol.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-gray-300 border border-gray-600 rounded-lg hover:text-white hover:border-gray-500 transition-all font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Documentation
              </a>
              <a
                href="https://github.com/sip-protocol/sip-app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-gray-300 border border-gray-600 rounded-lg hover:text-white hover:border-gray-500 transition-all font-medium flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                Source Code
              </a>
            </div>

            {/* Quick links */}
            <div className="mt-10 pt-6 border-t border-purple-500/20">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <a
                  href="https://sip-protocol.org"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  sip-protocol.org
                </a>
                <a
                  href="https://blog.sip-protocol.org"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  blog
                </a>
                <a
                  href="https://www.npmjs.com/package/@sip-protocol/sdk"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  npm: @sip-protocol/sdk
                </a>
                <a
                  href={`https://solscan.io/account/${DEPLOYMENTS.mainnet.programId}`}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Solscan (Mainnet)
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            Built with{" "}
            <code className="text-purple-500/70">@sip-protocol/sdk v0.7.3</code>{" "}
            &mdash; Anchor program live on Solana mainnet
          </p>
        </div>
      </div>
    </section>
  )
}
