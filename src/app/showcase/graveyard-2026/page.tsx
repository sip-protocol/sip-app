"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  deathStory: string
  revivalStory: string
  cryptoPrimitive: string
  sponsorRole: string
  beforeAfter: [string, string]
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
    deathStory:
      "On-chain DAOs collapsed because visible votes let whales manipulate outcomes. Proposals became predictable \u2014 minority voters stopped participating knowing whales would just copy-trade the winning side. Voter turnout on Realms dropped to single digits.",
    revivalStory:
      "Commit-reveal voting hides ballots until the reveal phase. Voters commit a Pedersen commitment of their choice, then reveal simultaneously. No one can front-run or copy votes. Viewing keys let DAO auditors verify vote legitimacy without exposing individual ballots.",
    cryptoPrimitive: "Pedersen Commitments",
    sponsorRole: "DAO governance infrastructure and on-chain voting programs",
    beforeAfter: [
      "Whales see votes in real-time and copy-trade the winning side",
      "All ballots hidden until simultaneous reveal \u2014 no front-running possible",
    ],
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
    integration: "on-chain",
    deathStory:
      "Wallet-linked social profiles became liability maps. Doxxing was trivial \u2014 connect a wallet to see every transaction, every NFT, every DeFi position. Users abandoned Solana social platforms for pseudonymous alternatives on Web2.",
    revivalStory:
      "Stealth social identities decouple your profile from your wallet. Each social interaction uses a one-time stealth address. Followers can verify you\u2019re real via viewing keys without linking your posts to your portfolio.",
    cryptoPrimitive: "Stealth Addresses",
    sponsorRole: "Decentralized social graph and identity infrastructure",
    beforeAfter: [
      "Your social profile exposes your entire financial history",
      "Post, follow, and interact with unlinkable stealth identities",
    ],
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
    integration: "on-chain",
    deathStory:
      "Transparent reward programs exposed customer behavior patterns. Competitors could analyze who earned what, reverse-engineer strategies, and poach high-value users. Brands stopped investing in on-chain loyalty.",
    revivalStory:
      "Anonymous reward claims via stealth addresses. Brands verify engagement through Pedersen commitments that prove completion, but can\u2019t see who claimed what. Viewing keys let brands audit program metrics without individual tracking.",
    cryptoPrimitive: "Pedersen Commitments",
    sponsorRole: "On-chain loyalty and incentive distribution platform",
    beforeAfter: [
      "Competitors analyze reward claims to poach your best customers",
      "Engagement proven cryptographically \u2014 individual claims invisible",
    ],
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
    deathStory:
      "Public minting revealed collector identities and purchase prices. Whales got front-run on drops. Artists lost sales to bots that analyzed wallet patterns to snipe underpriced pieces. The collector class left for private galleries.",
    revivalStory:
      "Stealth NFT minting to unlinkable addresses. Collectors buy with hidden identity, artists get paid, and the marketplace stays fair. Compressed NFTs via Bubblegum keep costs low. Viewing keys let galleries verify provenance.",
    cryptoPrimitive: "Stealth Addresses",
    sponsorRole: "Curated NFT marketplace and artist platform on Solana",
    beforeAfter: [
      "Bots front-run drops by analyzing collector wallet patterns",
      "Collectors mint to stealth addresses \u2014 identity and price hidden",
    ],
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
    deathStory:
      "Green staking on Solana died because visible stake accounts let validators discriminate. Carbon offset purchases were front-run. Environmental DAOs couldn\u2019t operate privately, and participants were targeted for their on-chain activity.",
    revivalStory:
      "Private protocol migration with hidden amounts. Stealth addresses for green stake delegation. Pedersen commitments prove carbon offset amounts without revealing the staker. Sunrise validators see commitment proofs, not wallet addresses.",
    cryptoPrimitive: "Pedersen Commitments",
    sponsorRole: "Climate-positive staking and carbon offset infrastructure",
    beforeAfter: [
      "Validators discriminate based on visible stake accounts",
      "Stake delegated via stealth addresses \u2014 commitment proofs only",
    ],
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
    integration: "on-chain",
    deathStory:
      "Creator channels became spam magnets \u2014 subscriber lists were fully public. Exclusive content was trivially pirated because NFT ownership was visible. Creators couldn\u2019t monetize premium tiers when anyone could see who subscribed.",
    revivalStory:
      "Encrypted stealth drops where subscribers are invisible. Content encrypted per-subscriber using viewing keys. DRiP channels become truly exclusive \u2014 ownership verified cryptographically, subscriber list hidden.",
    cryptoPrimitive: "Viewing Keys",
    sponsorRole: "Creator-to-fan NFT distribution and channel platform",
    beforeAfter: [
      "Subscriber lists public \u2014 exclusive content trivially pirated",
      "Subscribers invisible, content encrypted per-viewer via viewing keys",
    ],
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
    integration: "on-chain",
    deathStory:
      "Competitive Solana games died because transparent state enabled cheating. In any commit-reveal game, players could read opponents\u2019 moves from the mempool. Esports on Solana was DOA \u2014 no hidden information means no competitive integrity.",
    revivalStory:
      "Commit-reveal gameplay with Pedersen commitments. Players commit encrypted moves, then reveal simultaneously. MagicBlock BOLT ECS provides the game engine, SIP provides the cryptographic fairness layer.",
    cryptoPrimitive: "Pedersen Commitments",
    sponsorRole: "On-chain game engine with BOLT ECS and ephemeral rollups",
    beforeAfter: [
      "Opponents read your moves from the mempool before you play",
      "Moves committed as Pedersen hashes \u2014 simultaneous reveal only",
    ],
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
    integration: "on-chain",
    deathStory:
      "NFT tickets were instantly scalped because ownership and transfer history were public. Bots monitored minting transactions and sniped tickets for resale. Event organizers couldn\u2019t prevent secondary market manipulation.",
    revivalStory:
      "Anti-scalping stealth tickets as compressed NFTs. Ticket ownership verified via Pedersen commitment, not wallet address. Transfer requires viewing key authorization. KYD\u2019s event infrastructure plus SIP\u2019s privacy equals fair ticketing.",
    cryptoPrimitive: "Stealth Addresses",
    sponsorRole: "Event ticketing platform and NFT ticket infrastructure",
    beforeAfter: [
      "Bots snipe tickets on-mint and resell at 10x on secondary markets",
      "Ticket ownership hidden \u2014 transfers require viewing key auth",
    ],
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
    integration: "on-chain",
    deathStory:
      "Wallet-linked metaverse avatars killed anonymity. Your 3D identity was your financial identity. Stalking, harassment, and wealth-based discrimination became rampant. Users retreated to anonymous Web2 metaverses.",
    revivalStory:
      "Stealth avatar identities decoupled from wallets. Enter any Portals room with a fresh stealth address. Prove membership via viewing keys without revealing your main wallet. Private teleportation between worlds.",
    cryptoPrimitive: "Stealth Addresses",
    sponsorRole: "3D metaverse rooms and social spaces on Solana",
    beforeAfter: [
      "Your avatar reveals your wallet \u2014 wealth-based harassment is trivial",
      "Fresh stealth address per room \u2014 prove membership, hide identity",
    ],
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
    integration: "on-chain",
    deathStory:
      "Public research funding created bias \u2014 reviewers could see who funded what and adjusted their evaluations accordingly. Anonymous peer review was impossible when every grant was a public transaction. Researchers self-censored controversial topics.",
    revivalStory:
      "Anonymous research funding via stealth transfers. Fund BioDAOs without revealing your identity. Pedersen commitments prove funding amounts for milestone tracking. Viewing keys enable selective auditing without compromising researcher privacy.",
    cryptoPrimitive: "Viewing Keys",
    sponsorRole: "Decentralized science funding and BioDAO infrastructure",
    beforeAfter: [
      "Reviewers see funder identity and bias their evaluations",
      "Funding anonymous \u2014 milestones tracked via commitment proofs",
    ],
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
    integration: "on-chain",
    deathStory:
      "Public listening data was monetized without consent. Record labels tracked wallet-linked listening habits to manipulate royalty negotiations. Artists couldn\u2019t see who streamed them but labels could see everything. Listeners left for Web2 streaming.",
    revivalStory:
      "Stealth listener identities. Stream on Audius with a one-time stealth address per session. Artists get aggregate metrics via Pedersen commitments, listeners keep their habits private. Viewing keys for voluntary fan-artist connections.",
    cryptoPrimitive: "Stealth Addresses",
    sponsorRole: "Decentralized music streaming and artist royalty platform",
    beforeAfter: [
      "Labels track your listening habits to manipulate royalty deals",
      "One-time stealth address per session \u2014 aggregate metrics only",
    ],
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
  { value: "1,108+", label: "Tests Passing" },
  { value: "Mainnet", label: "Anchor Program" },
  { value: "11/11", label: "On-Chain" },
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
            <div
              key={stage.title}
              className="flex flex-col sm:flex-row items-center w-full sm:w-auto"
            >
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
                <h3
                  className={`font-semibold text-sm mb-1 ${stage.titleColor}`}
                >
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
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)

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
            primitives. Click any track to see the full death &amp; revival
            story.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPONSOR_TRACKS.map((track, index) => {
            const badge = INTEGRATION_BADGES[track.integration]
            const isExpanded = expandedTrack === track.name

            return (
              <motion.div
                key={track.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                layout
                className={isExpanded ? "sm:col-span-2 lg:col-span-3" : ""}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setExpandedTrack(isExpanded ? null : track.name)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setExpandedTrack(isExpanded ? null : track.name)
                    }
                  }}
                  className={`group block p-5 rounded-xl border transition-all cursor-pointer ${
                    isExpanded
                      ? "border-purple-500/40 bg-gray-900/80"
                      : "border-gray-800 bg-gray-900/50 hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-gradient-to-br ${track.gradient} text-white`}
                    >
                      {track.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm group-hover:text-purple-400 transition-colors">
                          {track.name}
                        </h3>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {track.primitive}
                      </p>

                      {/* Compact Death/Revival one-liners (always visible) */}
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

                  {/* Expandable narrative card */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 pt-5 border-t border-gray-800 space-y-4">
                          {/* Death story */}
                          <div className="rounded-lg bg-red-950/20 border border-red-500/10 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Skull className="w-4 h-4 text-red-400" />
                              <span className="text-sm font-semibold text-red-400">
                                Why It Died
                              </span>
                            </div>
                            <p className="text-sm text-red-300/70 leading-relaxed">
                              {track.deathStory}
                            </p>
                          </div>

                          {/* Revival story */}
                          <div className="rounded-lg bg-green-950/20 border border-green-500/10 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sprout className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-semibold text-green-400">
                                How SIP Revives It
                              </span>
                            </div>
                            <p className="text-sm text-green-300/70 leading-relaxed">
                              {track.revivalStory}
                            </p>
                          </div>

                          {/* Before/After comparison */}
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="rounded-lg bg-gray-800/50 border border-red-500/10 p-3">
                              <div className="text-xs font-semibold text-red-400/80 uppercase tracking-wider mb-1.5">
                                Before Privacy
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {track.beforeAfter[0]}
                              </p>
                            </div>
                            <div className="rounded-lg bg-gray-800/50 border border-green-500/10 p-3">
                              <div className="text-xs font-semibold text-green-400/80 uppercase tracking-wider mb-1.5">
                                After Privacy
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {track.beforeAfter[1]}
                              </p>
                            </div>
                          </div>

                          {/* Badges row: sponsor role + crypto primitive */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                              <Shield className="w-3 h-3" />
                              {track.cryptoPrimitive}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full">
                              Powered by {track.sponsor}
                            </span>
                            <span className="text-xs text-gray-600 hidden sm:inline">
                              {track.sponsorRole}
                            </span>
                          </div>

                          {/* Try it link */}
                          <div className="pt-2">
                            <Link
                              href={track.href}
                              className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ArrowRight className="w-4 h-4" />
                              Try {track.name} Live
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
      value: "1,108+",
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
