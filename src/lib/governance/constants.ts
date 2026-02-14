import type { DAO, Proposal, ProposalStatus, VoteStep } from "./types"

export const SAMPLE_DAOS: DAO[] = [
  {
    id: "marinade",
    name: "Marinade Finance",
    icon: "/tokens/mnde.png",
    token: "MNDE",
    description: "Liquid staking governance for Solana",
    proposalCount: 3,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    icon: "/tokens/jup.png",
    token: "JUP",
    description: "DEX aggregator governance",
    proposalCount: 2,
  },
  {
    id: "mango",
    name: "Mango Markets",
    icon: "/tokens/mngo.png",
    token: "MNGO",
    description: "Perpetual DEX governance",
    proposalCount: 2,
  },
  {
    id: "drift",
    name: "Drift Protocol",
    icon: "/tokens/drift.png",
    token: "DRIFT",
    description: "Derivatives protocol governance",
    proposalCount: 2,
  },
  {
    id: "jito",
    name: "Jito",
    icon: "/tokens/jto.png",
    token: "JTO",
    description: "MEV and liquid staking governance",
    proposalCount: 1,
  },
]

const now = Date.now()
const HOUR = 3600_000
const DAY = 24 * HOUR

function deterministicKey(proposalId: string): string {
  let hash = 0
  for (let i = 0; i < proposalId.length; i++) {
    hash = ((hash << 5) - hash + proposalId.charCodeAt(i)) | 0
  }
  const hex = Math.abs(hash).toString(16).padStart(64, "a")
  return `0x${hex}`
}

export const SAMPLE_PROPOSALS: Proposal[] = [
  // Voting phase (3)
  {
    id: "prop-mnde-01",
    daoId: "marinade",
    daoName: "Marinade Finance",
    daoIcon: "/tokens/mnde.png",
    title: "Increase validator set from 400 to 500",
    description:
      "Proposal to expand the Marinade validator delegation set to improve decentralization and network resilience.",
    choices: ["For", "Against", "Abstain"],
    status: "voting",
    startTime: now - 2 * DAY,
    endTime: now + 3 * DAY,
    revealTime: now + 4 * DAY,
    totalVotes: 142,
    quorum: 200,
    encryptionKey: deterministicKey("prop-mnde-01"),
  },
  {
    id: "prop-jup-01",
    daoId: "jupiter",
    daoName: "Jupiter",
    daoIcon: "/tokens/jup.png",
    title: "Allocate 10M JUP to liquidity incentives",
    description:
      "Deploy 10M JUP tokens from the DAO treasury to incentivize liquidity providers across key trading pairs.",
    choices: ["For", "Against", "Abstain"],
    status: "voting",
    startTime: now - 1 * DAY,
    endTime: now + 4 * DAY,
    revealTime: now + 5 * DAY,
    totalVotes: 89,
    quorum: 150,
    encryptionKey: deterministicKey("prop-jup-01"),
  },
  {
    id: "prop-drift-01",
    daoId: "drift",
    daoName: "Drift Protocol",
    daoIcon: "/tokens/drift.png",
    title: "Launch DRIFT staking with 12% APY",
    description:
      "Introduce DRIFT token staking with protocol revenue sharing, targeting 12% APY for long-term stakers.",
    choices: ["For", "Against", "Abstain"],
    status: "voting",
    startTime: now - 12 * HOUR,
    endTime: now + 5 * DAY,
    revealTime: now + 6 * DAY,
    totalVotes: 45,
    quorum: 100,
    encryptionKey: deterministicKey("prop-drift-01"),
  },
  // Reveal phase (3)
  {
    id: "prop-mnde-02",
    daoId: "marinade",
    daoName: "Marinade Finance",
    daoIcon: "/tokens/mnde.png",
    title: "Reduce unstaking period from 2 to 1 epoch",
    description:
      "Shorten the mSOL unstaking delay to improve capital efficiency for users.",
    choices: ["For", "Against", "Abstain"],
    status: "reveal",
    startTime: now - 7 * DAY,
    endTime: now - 1 * DAY,
    revealTime: now + 1 * DAY,
    totalVotes: 287,
    quorum: 200,
    encryptionKey: deterministicKey("prop-mnde-02"),
  },
  {
    id: "prop-jup-02",
    daoId: "jupiter",
    daoName: "Jupiter",
    daoIcon: "/tokens/jup.png",
    title: "Integrate Pyth price feeds for limit orders",
    description:
      "Use Pyth Network oracle feeds instead of on-chain TWAP for limit order execution.",
    choices: ["For", "Against", "Abstain"],
    status: "reveal",
    startTime: now - 6 * DAY,
    endTime: now - 12 * HOUR,
    revealTime: now + 2 * DAY,
    totalVotes: 203,
    quorum: 150,
    encryptionKey: deterministicKey("prop-jup-02"),
  },
  {
    id: "prop-mngo-01",
    daoId: "mango",
    daoName: "Mango Markets",
    daoIcon: "/tokens/mngo.png",
    title: "Add SOL-PERP with 20x max leverage",
    description:
      "List a SOL perpetual futures market with up to 20x leverage and dynamic funding rates.",
    choices: ["For", "Against", "Abstain"],
    status: "reveal",
    startTime: now - 8 * DAY,
    endTime: now - 2 * DAY,
    revealTime: now + 12 * HOUR,
    totalVotes: 156,
    quorum: 100,
    encryptionKey: deterministicKey("prop-mngo-01"),
  },
  // Completed (2)
  {
    id: "prop-mnde-03",
    daoId: "marinade",
    daoName: "Marinade Finance",
    daoIcon: "/tokens/mnde.png",
    title: "Fund bug bounty program with 500K MNDE",
    description:
      "Allocate 500K MNDE from treasury for a security bug bounty program on Immunefi.",
    choices: ["For", "Against", "Abstain"],
    status: "completed",
    startTime: now - 14 * DAY,
    endTime: now - 7 * DAY,
    revealTime: now - 5 * DAY,
    totalVotes: 312,
    quorum: 200,
    encryptionKey: deterministicKey("prop-mnde-03"),
  },
  {
    id: "prop-jto-01",
    daoId: "jito",
    daoName: "Jito",
    daoIcon: "/tokens/jto.png",
    title: "Approve JTO emissions schedule for Q1 2026",
    description:
      "Ratify the quarterly JTO token emissions plan for staking rewards and ecosystem grants.",
    choices: ["For", "Against", "Abstain"],
    status: "completed",
    startTime: now - 21 * DAY,
    endTime: now - 14 * DAY,
    revealTime: now - 12 * DAY,
    totalVotes: 445,
    quorum: 300,
    encryptionKey: deterministicKey("prop-jto-01"),
  },
  // Cancelled (1)
  {
    id: "prop-mngo-02",
    daoId: "mango",
    daoName: "Mango Markets",
    daoIcon: "/tokens/mngo.png",
    title: "Migrate to Anchor v0.30 framework",
    description:
      "Upgrade the Mango v4 program from Anchor v0.28 to v0.30 for improved tooling.",
    choices: ["For", "Against", "Abstain"],
    status: "cancelled",
    startTime: now - 10 * DAY,
    endTime: now - 5 * DAY,
    revealTime: now - 3 * DAY,
    totalVotes: 23,
    quorum: 100,
    encryptionKey: deterministicKey("prop-mngo-02"),
  },
  // Extra voting proposal for drift
  {
    id: "prop-drift-02",
    daoId: "drift",
    daoName: "Drift Protocol",
    daoIcon: "/tokens/drift.png",
    title: "Reduce insurance fund fee from 5% to 3%",
    description:
      "Lower the insurance fund contribution fee on profitable trades to attract more volume.",
    choices: ["For", "Against", "Abstain"],
    status: "voting",
    startTime: now - 6 * HOUR,
    endTime: now + 6 * DAY,
    revealTime: now + 7 * DAY,
    totalVotes: 12,
    quorum: 100,
    encryptionKey: deterministicKey("prop-drift-02"),
  },
]

export const SIMULATION_DELAYS: Record<VoteStep, number> = {
  encrypting: 1500,
  committing: 2000,
  committed: 0,
  revealing: 1500,
  revealed: 0,
  failed: 0,
}

export const MAX_GOVERNANCE_HISTORY = 100

export const VOTE_CHOICES = ["For", "Against", "Abstain"]

export function getProposalsByStatus(status: ProposalStatus): Proposal[] {
  return SAMPLE_PROPOSALS.filter((p) => p.status === status)
}

export function getProposalsByDao(daoId: string): Proposal[] {
  return SAMPLE_PROPOSALS.filter((p) => p.daoId === daoId)
}

export function getProposal(proposalId: string): Proposal | undefined {
  return SAMPLE_PROPOSALS.find((p) => p.id === proposalId)
}

export function getDao(daoId: string): DAO | undefined {
  return SAMPLE_DAOS.find((d) => d.id === daoId)
}
