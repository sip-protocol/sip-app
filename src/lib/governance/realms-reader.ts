import { Connection, PublicKey } from "@solana/web3.js"
import {
  getRealm,
  getAllProposals,
  getAllGovernances,
  getTokenOwnerRecordsByOwner,
  getGovernance,
  ProposalState,
} from "@solana/spl-governance"
import type { Proposal as SplProposal } from "@solana/spl-governance"
import type { DAO, Proposal, GovernanceMode, ProposalStatus } from "./types"
import { SAMPLE_DAOS, SAMPLE_PROPOSALS } from "./constants"
import { logger } from "@/lib/logger"

// SPL Governance v3 program ID (used by Realms)
const GOVERNANCE_PROGRAM_ID = new PublicKey(
  "GovER5Lthms3bLBqWub97yVRs6buSgstyZvo8jaxYMB6"
)

// Mainnet RPC — use env var or public fallback
const SOLANA_RPC_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_RPC_URL
    ? process.env.NEXT_PUBLIC_RPC_URL
    : "https://solana-rpc.publicnode.com"

// Curated list of real Solana DAO realm addresses (mainnet)
const KNOWN_REALMS: Record<
  string,
  { pubkey: PublicKey; token: string; icon: string; description: string }
> = {
  marinade: {
    pubkey: new PublicKey("4MoTe1sMpPEbm2EMZh9dFtXMGT4Ppcj48nqwR9RTFVQN"),
    token: "MNDE",
    icon: "/tokens/mnde.png",
    description: "Liquid staking governance for Solana",
  },
  mango: {
    pubkey: new PublicKey("DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE"),
    token: "MNGO",
    icon: "/tokens/mngo.png",
    description: "Perpetual DEX governance",
  },
  drift: {
    pubkey: new PublicKey("5VN4GBq7MRzB6LJkMBvLZwbSuLpLAQ4FGVQLB6n2bf1i"),
    token: "DRIFT",
    icon: "/tokens/drift.png",
    description: "Derivatives protocol governance",
  },
  jito: {
    pubkey: new PublicKey("GjpM2GKySRxMtgeJRMmKBjwbR8t3tg9EjJJrqx5nDpXZ"),
    token: "JTO",
    icon: "/tokens/jto.png",
    description: "MEV and liquid staking governance",
  },
  pyth: {
    pubkey: new PublicKey("pytGY6tWRgGinSCvRLnSv4fHfBTMoiDGiCsesmHWM6U"),
    token: "PYTH",
    icon: "/tokens/pyth.png",
    description: "Oracle network governance",
  },
}

// Cache config
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Map SPL ProposalState enum to our ProposalStatus
function mapProposalState(state: ProposalState): ProposalStatus {
  switch (state) {
    case ProposalState.Voting:
      return "voting"
    case ProposalState.Succeeded:
    case ProposalState.Executing:
    case ProposalState.ExecutingWithErrors:
      return "reveal"
    case ProposalState.Completed:
    case ProposalState.Defeated:
    case ProposalState.Vetoed:
      return "completed"
    case ProposalState.Cancelled:
      return "cancelled"
    default:
      // Draft, SigningOff — not voter-facing, but safe fallback
      return "voting"
  }
}

// Generate a deterministic encryption key from a proposal address
function deterministicKey(address: string): string {
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash + address.charCodeAt(i)) | 0
  }
  const hex = Math.abs(hash).toString(16).padStart(64, "a")
  return `0x${hex}`
}

// Extract a BN timestamp (seconds) to milliseconds, with null fallback
function bnToMs(bn: { toNumber: () => number } | null): number {
  if (!bn) return 0
  try {
    return bn.toNumber() * 1000
  } catch {
    return 0
  }
}

// Reverse lookup: realm pubkey string -> dao id
const REALM_PUBKEY_TO_ID = new Map<string, string>(
  Object.entries(KNOWN_REALMS).map(([id, config]) => [
    config.pubkey.toBase58(),
    id,
  ])
)

export class RealmsReader {
  private mode: GovernanceMode
  private connection: Connection | null = null

  // Caches
  private daoCache: CacheEntry<DAO[]> | null = null
  private proposalCache: Map<string, CacheEntry<Proposal[]>> = new Map()
  private singleProposalCache: Map<string, CacheEntry<Proposal>> = new Map()

  constructor(mode: GovernanceMode = "simulation") {
    this.mode = mode
  }

  private getConnection(): Connection {
    if (!this.connection) {
      this.connection = new Connection(SOLANA_RPC_URL, {
        commitment: "confirmed",
      })
    }
    return this.connection
  }

  private isCacheValid<T>(entry: CacheEntry<T> | null | undefined): boolean {
    if (!entry) return false
    return Date.now() - entry.timestamp < CACHE_TTL_MS
  }

  // ─── getDAOs ─────────────────────────────────────────────────────────

  async getDAOs(): Promise<DAO[]> {
    if (this.mode !== "realms") {
      return SAMPLE_DAOS
    }

    if (this.isCacheValid(this.daoCache)) {
      return this.daoCache!.data
    }

    try {
      const connection = this.getConnection()
      const daos: DAO[] = []

      const entries = Object.entries(KNOWN_REALMS)
      const results = await Promise.allSettled(
        entries.map(async ([id, config]) => {
          const realmAccount = await getRealm(connection, config.pubkey)
          const realm = realmAccount.account

          // Fetch governance accounts to sum proposal counts
          const governances = await getAllGovernances(
            connection,
            GOVERNANCE_PROGRAM_ID,
            config.pubkey
          )
          const totalProposals = governances.reduce(
            (sum, g) => sum + g.account.proposalCount,
            0
          )

          return {
            id,
            name: realm.name,
            icon: config.icon,
            token: config.token,
            description: config.description,
            proposalCount: totalProposals,
          } satisfies DAO
        })
      )

      for (const result of results) {
        if (result.status === "fulfilled") {
          daos.push(result.value)
        }
      }

      if (daos.length === 0) {
        logger.warn(
          "[SIP] Failed to fetch any Realms DAOs, falling back to simulation",
          "RealmsReader"
        )
        return SAMPLE_DAOS
      }

      this.daoCache = { data: daos, timestamp: Date.now() }
      return daos
    } catch (error) {
      logger.warn(
        `[SIP] Realms on-chain fetch failed, falling back to simulation: ${error instanceof Error ? error.message : error}`,
        "RealmsReader"
      )
      return SAMPLE_DAOS
    }
  }

  // ─── getProposals ────────────────────────────────────────────────────

  async getProposals(
    daoId?: string,
    status?: ProposalStatus
  ): Promise<Proposal[]> {
    if (this.mode !== "realms") {
      return this.filterProposals(SAMPLE_PROPOSALS, daoId, status)
    }

    const realmIds = daoId ? [daoId] : Object.keys(KNOWN_REALMS)
    const allProposals: Proposal[] = []

    // Fetch all realms in parallel
    const fetchResults = await Promise.allSettled(
      realmIds.map(async (id) => {
        const cacheKey = id
        const cached = this.proposalCache.get(cacheKey)
        if (this.isCacheValid(cached)) {
          return { id, proposals: cached!.data }
        }

        const realmConfig = KNOWN_REALMS[id]
        if (!realmConfig) return { id, proposals: [] as Proposal[] }

        const proposals = await this.fetchProposalsForRealm(id, realmConfig)
        this.proposalCache.set(cacheKey, {
          data: proposals,
          timestamp: Date.now(),
        })
        return { id, proposals }
      })
    )

    for (const result of fetchResults) {
      if (result.status === "fulfilled") {
        allProposals.push(...result.value.proposals)
      } else {
        // On failure for a specific realm, merge in simulation data
        logger.warn(
          "[SIP] Partial realm fetch failed, merging simulation fallback",
          "RealmsReader"
        )
      }
    }

    if (allProposals.length === 0) {
      return this.filterProposals(SAMPLE_PROPOSALS, daoId, status)
    }

    return this.filterProposals(allProposals, daoId, status)
  }

  // ─── getProposal ─────────────────────────────────────────────────────

  async getProposal(proposalId: string): Promise<Proposal | undefined> {
    if (this.mode !== "realms") {
      return SAMPLE_PROPOSALS.find((p) => p.id === proposalId)
    }

    // Check single-proposal cache
    const cached = this.singleProposalCache.get(proposalId)
    if (this.isCacheValid(cached)) {
      return cached!.data
    }

    // Search through proposals cache
    for (const entry of this.proposalCache.values()) {
      if (this.isCacheValid(entry)) {
        const found = entry.data.find((p) => p.id === proposalId)
        if (found) {
          this.singleProposalCache.set(proposalId, {
            data: found,
            timestamp: Date.now(),
          })
          return found
        }
      }
    }

    // If it looks like a Solana pubkey, try direct on-chain fetch
    try {
      const pubkey = new PublicKey(proposalId)
      const connection = this.getConnection()
      const { getProposal: getSplProposal } =
        await import("@solana/spl-governance")
      const proposalAccount = await getSplProposal(connection, pubkey)
      const proposal = proposalAccount.account

      // Resolve DAO info: governance -> realm -> known dao
      const daoInfo = await this.resolveDaoFromGovernance(proposal.governance)

      const mapped = this.mapSplProposal(
        proposalId,
        proposal,
        daoInfo.id,
        daoInfo.name,
        daoInfo.icon
      )

      this.singleProposalCache.set(proposalId, {
        data: mapped,
        timestamp: Date.now(),
      })
      return mapped
    } catch {
      // Not a valid pubkey or fetch failed — check simulation data
      return SAMPLE_PROPOSALS.find((p) => p.id === proposalId)
    }
  }

  // ─── getVoterWeight ──────────────────────────────────────────────────

  async getVoterWeight(daoId: string, walletAddress?: string): Promise<string> {
    if (this.mode !== "realms" || !walletAddress) {
      return this.getSimulatedWeight(daoId)
    }

    const realmConfig = KNOWN_REALMS[daoId]
    if (!realmConfig) return "0"

    try {
      const connection = this.getConnection()
      const voterPubkey = new PublicKey(walletAddress)

      const tokenOwnerRecords = await getTokenOwnerRecordsByOwner(
        connection,
        GOVERNANCE_PROGRAM_ID,
        voterPubkey
      )

      // Find records belonging to this realm
      const realmRecords = tokenOwnerRecords.filter((record) =>
        record.account.realm.equals(realmConfig.pubkey)
      )

      if (realmRecords.length === 0) return "0"

      // Sum deposited tokens across community + council
      let totalWeight = BigInt(0)
      for (const record of realmRecords) {
        const amount = record.account.governingTokenDepositAmount
        totalWeight += BigInt(amount.toString())
      }

      return totalWeight.toString()
    } catch (error) {
      logger.warn(
        `[SIP] Failed to fetch voter weight for ${daoId}: ${error instanceof Error ? error.message : error}`,
        "RealmsReader"
      )
      return this.getSimulatedWeight(daoId)
    }
  }

  // ─── getVoterInfo ───────────────────────────────────────────────────

  async getVoterInfo(
    daoId: string,
    walletAddress?: string
  ): Promise<{ weight: string; tokenOwnerRecordPubkey?: string }> {
    if (this.mode !== "realms" || !walletAddress) {
      return { weight: this.getSimulatedWeight(daoId) }
    }

    const realmConfig = KNOWN_REALMS[daoId]
    if (!realmConfig) return { weight: "0" }

    try {
      const connection = this.getConnection()
      const voterPubkey = new PublicKey(walletAddress)

      const tokenOwnerRecords = await getTokenOwnerRecordsByOwner(
        connection,
        GOVERNANCE_PROGRAM_ID,
        voterPubkey
      )

      const realmRecords = tokenOwnerRecords.filter((record) =>
        record.account.realm.equals(realmConfig.pubkey)
      )

      if (realmRecords.length === 0) {
        // No token records — fall back to simulated weight for demo UX
        return { weight: this.getSimulatedWeight(daoId) }
      }

      let totalWeight = BigInt(0)
      for (const record of realmRecords) {
        totalWeight += BigInt(
          record.account.governingTokenDepositAmount.toString()
        )
      }

      const weight = totalWeight.toString()
      return {
        weight: weight === "0" ? this.getSimulatedWeight(daoId) : weight,
        tokenOwnerRecordPubkey: realmRecords[0].pubkey.toBase58(),
      }
    } catch (error) {
      logger.warn(
        `[SIP] Failed to fetch voter info for ${daoId}: ${error instanceof Error ? error.message : error}`,
        "RealmsReader"
      )
      return { weight: this.getSimulatedWeight(daoId) }
    }
  }

  // ─── Internal helpers ────────────────────────────────────────────────

  private getSimulatedWeight(daoId: string): string {
    const weights: Record<string, string> = {
      marinade: "15000",
      jupiter: "8500",
      mango: "42000",
      drift: "3200",
      jito: "1800",
      pyth: "5600",
    }
    return weights[daoId] ?? "1000"
  }

  private async fetchProposalsForRealm(
    daoId: string,
    config: (typeof KNOWN_REALMS)[string]
  ): Promise<Proposal[]> {
    const connection = this.getConnection()

    // Fetch realm name
    const realmAccount = await getRealm(connection, config.pubkey)
    const realmName = realmAccount.account.name

    // getAllProposals returns Proposal[][] (grouped by governance)
    const proposalGroups = await getAllProposals(
      connection,
      GOVERNANCE_PROGRAM_ID,
      config.pubkey
    )

    const proposals: Proposal[] = []

    for (const group of proposalGroups) {
      for (const proposalAccount of group) {
        const proposal = proposalAccount.account
        const proposalAddress = proposalAccount.pubkey.toBase58()

        // Skip drafts and signing-off (not voter-facing)
        if (
          proposal.state === ProposalState.Draft ||
          proposal.state === ProposalState.SigningOff
        ) {
          continue
        }

        const mapped = this.mapSplProposal(
          proposalAddress,
          proposal,
          daoId,
          realmName,
          config.icon
        )
        proposals.push(mapped)
      }
    }

    // Sort by most recent first
    proposals.sort((a, b) => b.startTime - a.startTime)

    // Cap at 20 per DAO to keep payloads manageable
    return proposals.slice(0, 20)
  }

  private mapSplProposal(
    id: string,
    proposal: SplProposal,
    daoId: string,
    daoName: string,
    daoIcon: string
  ): Proposal {
    const status = mapProposalState(proposal.state)

    // Extract vote choices from proposal options
    const choices =
      proposal.options && proposal.options.length > 0
        ? proposal.options.map((opt) => opt.label || "Option")
        : ["For", "Against", "Abstain"]

    // Tally total votes across options + deny weight
    let totalVotes = 0
    if (proposal.options) {
      for (const option of proposal.options) {
        try {
          totalVotes += option.voteWeight.toNumber()
        } catch {
          // BN overflow — safe approximation via string
          totalVotes += Number(option.voteWeight.toString())
        }
      }
    }
    if (proposal.denyVoteWeight) {
      try {
        totalVotes += proposal.denyVoteWeight.toNumber()
      } catch {
        totalVotes += Number(proposal.denyVoteWeight.toString())
      }
    }

    // Timestamps: SPL stores seconds as BN, we need ms
    const startTime = bnToMs(proposal.votingAt ?? proposal.draftAt)
    const votingDuration = (proposal.maxVotingTime ?? 0) * 1000
    const endTime = startTime + votingDuration
    // Reveal buffer: 1 day after voting ends
    const revealTime = endTime + 86_400_000

    // Quorum from vote threshold (percentage value)
    let quorum = 0
    if (proposal.voteThreshold && proposal.voteThreshold.value !== undefined) {
      quorum = proposal.voteThreshold.value
    }

    return {
      id,
      daoId,
      daoName,
      daoIcon,
      title: proposal.name,
      description: proposal.descriptionLink || "",
      choices,
      status,
      startTime,
      endTime,
      revealTime,
      totalVotes,
      quorum,
      encryptionKey: deterministicKey(id),
      realmPubkey: KNOWN_REALMS[daoId]?.pubkey.toBase58(),
      governancePubkey: proposal.governance.toBase58(),
    }
  }

  private async resolveDaoFromGovernance(
    governancePubkey: PublicKey
  ): Promise<{ id: string; name: string; icon: string }> {
    try {
      const connection = this.getConnection()
      const governanceAccount = await getGovernance(
        connection,
        governancePubkey
      )
      const realmPubkey = governanceAccount.account.realm.toBase58()
      const daoId = REALM_PUBKEY_TO_ID.get(realmPubkey)

      if (daoId) {
        const config = KNOWN_REALMS[daoId]
        // Fetch actual realm name
        try {
          const realmAccount = await getRealm(connection, config.pubkey)
          return {
            id: daoId,
            name: realmAccount.account.name,
            icon: config.icon,
          }
        } catch {
          return { id: daoId, name: daoId, icon: config.icon }
        }
      }

      // Unknown realm — return generic info
      return { id: realmPubkey, name: "Unknown DAO", icon: "/tokens/sol.png" }
    } catch {
      return { id: "unknown", name: "Unknown DAO", icon: "/tokens/sol.png" }
    }
  }

  private filterProposals(
    proposals: Proposal[],
    daoId?: string,
    status?: ProposalStatus
  ): Proposal[] {
    let filtered = proposals
    if (daoId) {
      filtered = filtered.filter((p) => p.daoId === daoId)
    }
    if (status) {
      filtered = filtered.filter((p) => p.status === status)
    }
    return filtered
  }
}
