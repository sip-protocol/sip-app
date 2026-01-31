/**
 * Centralized constants for SIP App
 *
 * Keep these in sync with actual metrics:
 * - SDK tests: pnpm test --run (in sip-protocol/packages/sdk)
 * - App tests: pnpm test --run (in sip-app)
 */

// SDK Version - auto-read from package.json dependency
import packageJson from "../../package.json"

function getSDKVersion(): string {
  const dep = packageJson.dependencies?.["@sip-protocol/sdk"] || "0.0.0"
  // Remove ^ or ~ prefix if present
  return dep.replace(/^[\^~]/, "")
}

export const SDK_VERSION = {
  /** Raw version number (e.g., "0.7.3") */
  version: getSDKVersion(),
  /** Display format with 'v' prefix (e.g., "v0.7.3") */
  get display() {
    return `v${this.version}`
  },
  /** Full package name with version */
  get full() {
    return `@sip-protocol/sdk v${this.version}`
  },
  /** npm URL */
  npmUrl: "https://www.npmjs.com/package/@sip-protocol/sdk",
}

// Test counts - updated 2026-01-31
export const TEST_COUNTS = {
  sdk: 6603,
  react: 82,
  cli: 10,
  api: 18,
  reactNative: 10,
  app: 25,
  get total() {
    return (
      this.sdk + this.react + this.cli + this.api + this.reactNative + this.app
    )
  },
  // Formatted strings for display
  get sdkDisplay() {
    return `${this.sdk.toLocaleString()}+`
  },
  get totalDisplay() {
    return `${this.total.toLocaleString()}+`
  },
  get detailDisplay() {
    return `SDK: ${this.sdk.toLocaleString()} | React: ${this.react} | CLI: ${this.cli} | API: ${this.api} | RN: ${this.reactNative} | App: ${this.app}`
  },
}

// Project status - current phase and milestone
export const PROJECT_STATUS = {
  currentPhase: 4,
  currentPhaseName: "Same-Chain Expansion",
  currentMilestone: "M17",
  currentMilestoneName: "Solana Same-Chain Privacy",
  completedMilestones: 17,
  totalMilestones: 22,
  phasesComplete: 3,
  totalPhases: 5,
}

// Achievements and awards
export const ACHIEVEMENTS = {
  zypherpunk: {
    id: "zypherpunk-2025",
    title: "Zypherpunk Hackathon Winner",
    track: "3 Tracks (NEAR + Tachyon + pumpfun)",
    ranking: "#9 of 93",
    date: "December 2025",
    link: "https://zypherpunk.xyz",
    badge: "Winner",
  },
  superteam: {
    id: "superteam-grant-2026",
    title: "Superteam Indonesia Grant",
    badge: "Approved",
    date: "January 2026",
  },
} as const

// Program deployments
export const DEPLOYMENTS = {
  mainnet: {
    programId: "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at",
    configPda: "BVawZkppFewygA5nxdrLma4ThKx8Th7bW4KTCkcWTZwZ",
    date: "2026-01-31",
  },
  devnet: {
    programId: "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at",
    configPda: "BVawZkppFewygA5nxdrLma4ThKx8Th7bW4KTCkcWTZwZ",
    date: "2026-01-24",
  },
} as const
