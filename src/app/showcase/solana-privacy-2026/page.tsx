"use client"

/**
 * Solana Privacy Hackathon 2026 Showcase Page
 *
 * Sections:
 * 1. HeroSection (+ achievement badges)
 * 2. VideoGallerySection
 * 3. HackathonTracksSection
 * 4. PrivacyProvidersSection
 * 5. FeaturesSection
 * 6. TractionSection
 * 7. BlogSection (Encrypt.trade alignment)
 * 8. TechStackSection
 * 9. LinksSection
 */

import { motion } from "framer-motion"
import {
  Shield,
  Lock,
  Wrench,
  Globe,
  Layers,
  Target,
  Zap,
  Eye,
  Trophy,
  BookOpen,
  ExternalLink,
  Github,
  FileText,
  ChevronDown,
  ArrowRight,
  Play,
  Key,
} from "lucide-react"
import {
  TEST_COUNTS,
  SDK_VERSION,
  ACHIEVEMENTS,
  DEPLOYMENTS,
} from "@/lib/constants"
import { PhoneMockup, PhoneScreen } from "@/components/ui/PhoneMockup"

// CDN base URL for demo videos
const CDN_BASE =
  "https://cdn.sip-protocol.org/videos/showcase/solana-privacy-2026"

export default function SolanaPrivacy2026Page() {
  return (
    <>
      <HeroSection />
      <VideoGallerySection />
      <HackathonTracksSection />
      <PrivacyProvidersSection />
      <FeaturesSection />
      <TractionSection />
      <BlogSection />
      <TechStackSection />
      <LinksSection />
    </>
  )
}

// ============================================================================
// Hero Section
// ============================================================================

function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen lg:min-h-[90vh] flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Hackathon Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                <Shield className="w-4 h-4" />
                Solana Privacy Hackathon 2026
              </span>
            </motion.div>

            {/* Achievement Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-3"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Trophy className="w-3.5 h-3.5" />
                Zypherpunk 2025 Winner
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl sm:text-5xl font-bold"
            >
              SIP Privacy{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Mobile Wallet
              </span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-lg text-gray-400"
            >
              Privacy-first Solana wallet with compliant privacy. Full stealth
              address implementation with viewing keys for institutional
              compliance.
            </motion.p>

            {/* Key Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">Mainnet</div>
                <div className="text-xs text-gray-500">Live on Solana</div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold text-emerald-400">647+</div>
                <div className="text-xs text-gray-500">Tests Passing</div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <div className="text-2xl font-bold text-teal-400">8</div>
                <div className="text-xs text-gray-500">Demo Videos</div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4"
            >
              <a
                href="https://github.com/sip-protocol/sip-mobile"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-center text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                View Source
              </a>
              <a
                href="https://docs.sip-protocol.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-center text-gray-300 border border-gray-700 rounded-lg hover:text-white hover:border-gray-600 transition-all font-medium"
              >
                Documentation
              </a>
            </motion.div>
          </div>

          {/* Phone Mockup with App Screenshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative flex justify-center"
          >
            {/* Glow effect behind phone */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-64 h-96 bg-gradient-to-r from-green-500/30 to-cyan-500/30 rounded-full blur-3xl" />
            </div>

            {/* Phone mockup with screenshot */}
            <PhoneMockup variant="seeker" className="relative z-10">
              <PhoneScreen
                src="/images/showcase/solana-privacy-2026/home-screen.png"
                alt="SIP Privacy App - Home screen showing private balance and recent transactions"
              />
            </PhoneMockup>

            {/* Floating feature badges - hidden on mobile */}
            <div className="absolute -right-4 top-16 z-20 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900/90 border border-green-500/30 shadow-lg"
              >
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-white">
                  Stealth Addresses
                </span>
              </motion.div>
            </div>

            <div className="absolute -left-4 top-32 z-20 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900/90 border border-cyan-500/30 shadow-lg"
              >
                <Lock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-white">
                  Compliant Privacy
                </span>
              </motion.div>
            </div>

            <div className="absolute -right-8 bottom-24 z-20 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900/90 border border-purple-500/30 shadow-lg"
              >
                <Key className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-white">
                  Viewing Keys
                </span>
              </motion.div>
            </div>
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
// Video Gallery Section
// ============================================================================

const videos = [
  {
    id: "01-onboarding",
    title: "Onboarding & Education",
    description: "Interactive education slides explaining privacy concepts",
    src: `${CDN_BASE}/01-onboarding-education.mp4`,
    category: "Getting Started",
  },
  {
    id: "02-wallet",
    title: "Wallet Setup",
    description: "Create or import wallet with secure key storage",
    src: `${CDN_BASE}/02-wallet-setup.mp4`,
    category: "Getting Started",
  },
  {
    id: "03-settings",
    title: "Settings & Navigation",
    description: "All tabs and settings menu walkthrough",
    src: `${CDN_BASE}/03-settings-all-menus.mp4`,
    category: "Getting Started",
  },
  {
    id: "04-devnet",
    title: "Devnet E2E Flow",
    description: "Send → Scan → Claim cycle on devnet",
    src: `${CDN_BASE}/04-devnet-send-scan-claim.mp4`,
    category: "Privacy Transactions",
  },
  {
    id: "05-mainnet",
    title: "Mainnet E2E Flow",
    description: "Send → Scan → Claim cycle on mainnet",
    src: `${CDN_BASE}/05-mainnet-send-scan-claim.mp4`,
    category: "Privacy Transactions",
  },
  {
    id: "06-explorer",
    title: "On-Chain Verification",
    description: "View transaction on Solscan explorer",
    src: `${CDN_BASE}/06-view-on-explorer.mp4`,
    category: "Privacy Transactions",
  },
  {
    id: "07-compliant",
    title: "Compliant Privacy Flow",
    description: "Send → Scan → Claim with Compliant privacy level",
    src: `${CDN_BASE}/07-compliant-send-scan-claim.mp4`,
    category: "Compliance",
  },
  {
    id: "08-viewing-keys",
    title: "Viewing Keys & Compliance",
    description: "Export viewing keys and compliance dashboard",
    src: `${CDN_BASE}/08-viewing-keys-compliance.mp4`,
    category: "Compliance",
  },
]

function VideoGallerySection() {
  const categories = [...new Set(videos.map((v) => v.category))]

  return (
    <section className="py-16 border-t border-gray-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold"
          >
            Demo Videos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-gray-400"
          >
            8 videos demonstrating full functionality on Seeker device
          </motion.p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              {category === "Getting Started" && (
                <Play className="w-5 h-5 text-green-400" />
              )}
              {category === "Privacy Transactions" && (
                <Shield className="w-5 h-5 text-purple-400" />
              )}
              {category === "Compliance" && (
                <Lock className="w-5 h-5 text-cyan-400" />
              )}
              {category}
            </h3>
            <div className="flex flex-wrap gap-8 justify-center">
              {videos
                .filter((v) => v.category === category)
                .map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Phone mockup frame for video */}
                    <div className="relative w-[200px]">
                      {/* Outer frame */}
                      <div className="relative rounded-[2rem] p-2 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                        {/* Inner bezel */}
                        <div className="relative rounded-[1.5rem] bg-black p-0.5 overflow-hidden">
                          {/* Screen area */}
                          <div className="relative rounded-[1.25rem] overflow-hidden bg-gray-950">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                              <div className="w-14 h-4 bg-black rounded-b-lg flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                              </div>
                            </div>
                            {/* Video */}
                            <div className="relative aspect-[9/19.5]">
                              <video
                                src={video.src}
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                                playsInline
                              />
                            </div>
                          </div>
                        </div>
                        {/* Side buttons */}
                        <div className="absolute -right-0.5 top-16 w-0.5 h-8 bg-gray-600 rounded-r-sm" />
                        <div className="absolute -left-0.5 top-14 w-0.5 h-5 bg-gray-600 rounded-l-sm" />
                        <div className="absolute -left-0.5 top-22 w-0.5 h-8 bg-gray-600 rounded-l-sm" />
                      </div>
                    </div>
                    {/* Title below phone */}
                    <div className="mt-4 text-center max-w-[200px]">
                      <h4 className="font-medium text-white">{video.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {video.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============================================================================
// Hackathon Tracks Section
// ============================================================================

const tracks = [
  {
    icon: Lock,
    name: "Private Payments",
    description: "Stealth addresses + shielded SOL transfers",
    color: "green",
  },
  {
    icon: Wrench,
    name: "Privacy Tooling",
    description: "SDK, React hooks, CLI for developers",
    color: "purple",
  },
  {
    icon: Globe,
    name: "Open Track",
    description: "Full SIP Protocol as privacy standard",
    color: "cyan",
  },
]

const colorClasses = {
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: "bg-green-500/20 text-green-400",
    text: "text-green-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: "bg-purple-500/20 text-purple-400",
    text: "text-purple-400",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    icon: "bg-cyan-500/20 text-cyan-400",
    text: "text-cyan-400",
  },
}

function HackathonTracksSection() {
  return (
    <section className="py-24 border-t border-gray-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20"
          >
            <Target className="w-4 h-4" />
            Track Alignment
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl sm:text-4xl font-bold"
          >
            Built for Solana Privacy
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-400 max-w-2xl mx-auto"
          >
            SIP Protocol addresses multiple hackathon tracks with
            production-ready privacy infrastructure
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tracks.map((track, index) => {
            const colors =
              colorClasses[track.color as keyof typeof colorClasses]
            return (
              <motion.div
                key={track.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl ${colors.bg} border ${colors.border}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center mb-4`}
                >
                  <track.icon className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>
                  {track.name}
                </h3>
                <p className="text-sm text-gray-400">{track.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Privacy Providers Section
// ============================================================================

const providers = [
  // Privacy Backends
  {
    name: "Arcium",
    type: "MPC Compute",
    description: "Confidential DeFi computations",
    status: "integration",
  },
  {
    name: "ShadowWire",
    type: "Bulletproofs",
    description: "Radr Labs ZK privacy transfers",
    status: "integration",
  },
  {
    name: "Inco",
    type: "FHE Encryption",
    description: "Fully homomorphic encryption backend",
    status: "integration",
  },
  {
    name: "MagicBlock",
    type: "TEE Privacy",
    description: "Ephemeral rollups for privacy",
    status: "integration",
  },
  // RPC Providers
  {
    name: "Helius",
    type: "RPC + DAS",
    description: "Token scanning and subscriptions",
    status: "integration",
  },
  {
    name: "QuickNode",
    type: "Yellowstone gRPC",
    description: "Real-time transfer streaming",
    status: "integration",
  },
  // Compliance
  {
    name: "Range",
    type: "Compliance",
    description: "Attestation-gated viewing keys",
    status: "integration",
  },
  // ZK
  {
    name: "Aztec/Noir",
    type: "ZK Circuits",
    description: "Browser-based proof generation",
    status: "integration",
  },
]

function PrivacyProvidersSection() {
  return (
    <section className="py-24 border-t border-gray-800/50 bg-gray-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
          >
            <Layers className="w-4 h-4" />
            Sponsor Integrations
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl sm:text-4xl font-bold"
          >
            8 Sponsor Technologies
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-400 max-w-2xl mx-auto"
          >
            SIP is middleware &mdash; we integrate privacy providers, not
            compete. One API wrapping multiple backends with 3,500+ lines of
            production code.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                  {provider.type}
                </span>
                {provider.status === "planned" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-500">
                    Planned
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{provider.name}</h3>
              <p className="text-sm text-gray-400">{provider.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Features Section
// ============================================================================

const features = [
  {
    icon: Shield,
    title: "Stealth Addresses",
    description:
      "One-time addresses for every transaction. Unlinkable recipients via EIP-5564.",
  },
  {
    icon: Layers,
    title: "Pedersen Commitments",
    description:
      "Hide amounts cryptographically. Verify without revealing values.",
  },
  {
    icon: Eye,
    title: "Viewing Keys",
    description:
      "Selective disclosure for compliance. Privacy + auditability for institutions.",
  },
  {
    icon: Zap,
    title: "Same-Chain Privacy",
    description:
      "Native Solana privacy. No bridges, no delays, no external dependencies.",
  },
]

function FeaturesSection() {
  return (
    <section className="py-24 border-t border-gray-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20"
          >
            <Shield className="w-4 h-4" />
            Core Technology
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl sm:text-4xl font-bold"
          >
            Privacy as a Feature
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-green-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Traction Section
// ============================================================================

function TractionSection() {
  const metrics = [
    {
      value: ACHIEVEMENTS.zypherpunk.badge,
      label: "Zypherpunk Winner",
      detail: `${ACHIEVEMENTS.zypherpunk.ranking}, 3 tracks`,
      icon: Trophy,
      color: "yellow",
    },
    {
      value: TEST_COUNTS.totalDisplay,
      label: "Tests Passing",
      detail: "SDK + React + CLI + API",
      icon: Shield,
      color: "cyan",
    },
    {
      value: "Mainnet",
      label: "Live Deployment",
      detail: DEPLOYMENTS.mainnet.programId.slice(0, 8) + "...",
      icon: Zap,
      color: "green",
    },
    {
      value: SDK_VERSION.display,
      label: "npm Published",
      detail: "@sip-protocol/sdk",
      icon: FileText,
      color: "purple",
    },
  ]

  const metricColors = {
    yellow: "from-yellow-900/30 to-amber-900/30 border-yellow-500/20",
    cyan: "from-cyan-900/30 to-blue-900/30 border-cyan-500/20",
    green: "from-green-900/30 to-emerald-900/30 border-green-500/20",
    purple: "from-purple-900/30 to-pink-900/30 border-purple-500/20",
  }

  const textColors = {
    yellow: "from-yellow-400 to-amber-400",
    cyan: "from-cyan-400 to-blue-400",
    green: "from-green-400 to-emerald-400",
    purple: "from-purple-400 to-pink-400",
  }

  return (
    <section className="py-24 border-t border-gray-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          >
            <Trophy className="w-4 h-4" />
            Traction
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl sm:text-4xl font-bold"
          >
            Built, Not Vaporware
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${metricColors[metric.color as keyof typeof metricColors]} border text-center`}
            >
              <div
                className={`text-3xl font-bold bg-gradient-to-r ${textColors[metric.color as keyof typeof textColors]} bg-clip-text text-transparent`}
              >
                {metric.value}
              </div>
              <div className="mt-2 text-white font-medium">{metric.label}</div>
              <div className="mt-1 text-sm text-gray-500">{metric.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Blog Section (Encrypt.trade alignment)
// ============================================================================

const encryptTradeDeliverables = [
  {
    title: "Privacy Score Tool",
    excerpt: "How exposed is your wallet? Surveillance analyzer.",
    href: "/privacy-score",
    category: "Track 1",
    isInternal: true,
  },
  {
    title: "Privacy Without Jargon",
    excerpt: "why your wallet is a glass house, explained simply",
    href: "https://blog.sip-protocol.org/blog/privacy-without-jargon",
    category: "Track 2",
  },
  {
    title: "Stealth Addresses for Humans",
    excerpt: "one-time addresses without the math",
    href: "https://blog.sip-protocol.org/blog/stealth-addresses-for-humans",
    category: "Track 2",
  },
  {
    title: "Viewing Keys TL;DR",
    excerpt: "how to be private AND compliant",
    href: "https://blog.sip-protocol.org/blog/viewing-keys-tldr",
    category: "Track 2",
  },
]

const categoryColors: Record<string, string> = {
  "Track 1": "bg-green-500/10 text-green-400",
  "Track 2": "bg-orange-500/10 text-orange-400",
}

function BlogSection() {
  return (
    <section className="py-24 border-t border-gray-800/50 bg-gray-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20"
          >
            <BookOpen className="w-4 h-4" />
            Encrypt.Trade Bounty
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl sm:text-4xl font-bold"
          >
            Privacy Education
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-400 max-w-2xl mx-auto"
          >
            Track 1: Surveillance analyzer tool &bull; Track 2: Educational
            content without jargon
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {encryptTradeDeliverables.map((item, index) => (
            <motion.a
              key={item.title}
              href={item.href}
              target={item.isInternal ? undefined : "_blank"}
              rel={item.isInternal ? undefined : "noopener noreferrer"}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-orange-500/50 transition-colors ${item.category === "Track 1" ? "ring-2 ring-green-500/30" : ""}`}
            >
              <span
                className={`text-xs px-2 py-1 rounded-full ${categoryColors[item.category]}`}
              >
                {item.category}:{" "}
                {item.category === "Track 1" ? "$500" : "Education"}
              </span>
              <h3 className="mt-4 text-lg font-semibold group-hover:text-orange-400 transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-400">{item.excerpt}</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-orange-400">
                {item.isInternal ? "Try it" : "Read more"}{" "}
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Tech Stack Section
// ============================================================================

const techStack = [
  { name: "TypeScript", category: "Language" },
  { name: "@noble/curves", category: "Crypto" },
  { name: "Anchor", category: "Programs" },
  { name: "Noir", category: "ZK Proofs" },
  { name: "Vitest", category: "Testing" },
  { name: "React 19", category: "Frontend" },
  { name: "Next.js 16", category: "Framework" },
  { name: "Solana", category: "Blockchain" },
]

function TechStackSection() {
  return (
    <section className="py-24 border-t border-gray-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold"
          >
            Tech Stack
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3"
        >
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-sm"
            >
              <span className="text-white font-medium">{tech.name}</span>
              <span className="text-gray-500 ml-2">{tech.category}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// Links Section
// ============================================================================

function LinksSection() {
  return (
    <section className="py-24 border-t border-gray-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-r from-green-900/50 to-cyan-900/50 border border-green-500/20 overflow-hidden"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>

          <div className="px-8 py-16 sm:px-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Explore?
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Try the live app, read the docs, or dive into the code.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/payments"
                className="px-8 py-3 text-white bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg hover:from-green-600 hover:to-cyan-600 transition-all font-medium flex items-center gap-2"
              >
                Try Private Payments
                <ArrowRight className="w-4 h-4" />
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
                href="https://github.com/sip-protocol/sip-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-gray-300 border border-gray-600 rounded-lg hover:text-white hover:border-gray-500 transition-all font-medium flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                View Code
              </a>
            </div>

            {/* Quick links */}
            <div className="mt-12 pt-8 border-t border-green-500/20">
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
                  blog.sip-protocol.org
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
      </div>
    </section>
  )
}
