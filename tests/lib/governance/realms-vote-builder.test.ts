import { describe, it, expect, vi, beforeEach } from "vitest"
import { PublicKey, ComputeBudgetProgram } from "@solana/web3.js"
import {
  buildCastVoteTransaction,
  type CastVoteParams,
} from "@/lib/governance/realms-vote-builder"

// Valid Solana public keys for test fixtures
const ADDR = {
  realm: "8aRvmF4xo7RUe3rNz3EnojraiVevDUfvnsWpcvaHJKwh",
  governance: "FeCoCpmrjWpf4BaykaX365YYpbvpu3fPYBv3o5EDzvKQ",
  proposal: "7gNjpaDHFP3CELivipGEmDkNxgfea62zYzycTWEEQV63",
  proposerTor: "EHxuZRgfCyn2HESXYKUn3HDmCraPzPg2xLNahUraDcpj",
  voterTor: "HmcTmdDM441uPzgTq8hqjEaGKgsQyP5x1UsG8be6iGEz",
  voter: "Az83i5PFDjaYQz7CBG94ouKNCWryhRsHzmDfKzzWsHot",
  mint: "5GuvZYGDmDvzU9ueYj7LRZCp17PbsycFgxg4Hhh7q7LJ",
  voteRecord: "DXcJAQ9PRggB412LGJQPF8jphjrg7YX3YbojEujyAufr",
  voterWeight: "GovER5Lthms3bLBqWub97yVRs6buSgstyZvo8jaxYMB6",
}

// Mock spl-governance
const mockGetGovernanceProgramVersion = vi.fn().mockResolvedValue(3)
const mockWithCastVote = vi
  .fn()
  .mockImplementation(async (instructions: unknown[]) => {
    instructions.push({
      keys: [],
      programId: new PublicKey("GovER5Lthms3bLBqWub97yVRs6buSgstyZvo8jaxYMB6"),
      data: Buffer.from([0]),
    })
    return new PublicKey(ADDR.voteRecord)
  })
const mockGetProposal = vi.fn().mockResolvedValue({
  pubkey: new PublicKey(ADDR.proposal),
  account: {
    governance: new PublicKey(ADDR.governance),
    governingTokenMint: new PublicKey(ADDR.mint),
    tokenOwnerRecord: new PublicKey(ADDR.proposerTor),
    state: 2,
    name: "Test Proposal",
    options: [{ label: "For", voteWeight: { toNumber: () => 100 } }],
  },
})

vi.mock("@solana/spl-governance", () => ({
  getGovernanceProgramVersion: (...args: unknown[]) =>
    mockGetGovernanceProgramVersion(...args),
  withCastVote: (...args: unknown[]) => mockWithCastVote(...args),
  getProposal: (...args: unknown[]) => mockGetProposal(...args),
  Vote: class Vote {
    voteType: number
    approveChoices: unknown[] | undefined
    deny: boolean | undefined
    veto: boolean | undefined
    constructor(args: {
      voteType: number
      approveChoices: unknown[] | undefined
      deny: boolean | undefined
      veto: boolean | undefined
    }) {
      this.voteType = args.voteType
      this.approveChoices = args.approveChoices
      this.deny = args.deny
      this.veto = args.veto
    }
  },
  VoteKind: { Approve: 0, Deny: 1, Abstain: 2, Veto: 3 },
  VoteChoice: class VoteChoice {
    rank: number
    weightPercentage: number
    constructor(args: { rank: number; weightPercentage: number }) {
      this.rank = args.rank
      this.weightPercentage = args.weightPercentage
    }
  },
}))

// Mock connection
const mockConnection = {
  rpcEndpoint: "https://api.devnet.solana.com",
  getLatestBlockhash: vi.fn().mockResolvedValue({
    blockhash: "mock-blockhash",
    lastValidBlockHeight: 100,
  }),
} as unknown as ConstructorParameters<
  typeof import("@solana/web3.js").Connection
>[0]

const realmPubkey = new PublicKey(ADDR.realm)
const governancePubkey = new PublicKey(ADDR.governance)
const proposalPubkey = new PublicKey(ADDR.proposal)
const tokenOwnerRecordPubkey = new PublicKey(ADDR.voterTor)
const voterPubkey = new PublicKey(ADDR.voter)
const voterWeightRecordPubkey = new PublicKey(ADDR.voterWeight)

const baseParams: CastVoteParams = {
  realmPubkey,
  governancePubkey,
  proposalPubkey,
  tokenOwnerRecordPubkey,
  voterPubkey,
  choice: 0,
}

describe("buildCastVoteTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetGovernanceProgramVersion.mockResolvedValue(3)
    mockWithCastVote.mockImplementation(async (instructions: unknown[]) => {
      instructions.push({
        keys: [],
        programId: new PublicKey(
          "GovER5Lthms3bLBqWub97yVRs6buSgstyZvo8jaxYMB6"
        ),
        data: Buffer.from([0]),
      })
      return new PublicKey(ADDR.voteRecord)
    })
    mockGetProposal.mockResolvedValue({
      pubkey: proposalPubkey,
      account: {
        governance: governancePubkey,
        governingTokenMint: new PublicKey(ADDR.mint),
        tokenOwnerRecord: new PublicKey(ADDR.proposerTor),
        state: 2,
        name: "Test Proposal",
        options: [{ label: "For", voteWeight: { toNumber: () => 100 } }],
      },
    })
  })

  it("builds a transaction with the correct fee payer", async () => {
    const tx = await buildCastVoteTransaction(
      mockConnection as never,
      baseParams
    )

    expect(tx.feePayer).toEqual(voterPubkey)
  })

  it("includes ComputeBudget instructions", async () => {
    const tx = await buildCastVoteTransaction(
      mockConnection as never,
      baseParams
    )

    // Transaction should have 3 instructions: CU limit, CU price, castVote
    expect(tx.instructions.length).toBe(3)

    // First two instructions are ComputeBudget
    const cuLimitProgramId = ComputeBudgetProgram.programId
    expect(tx.instructions[0].programId.equals(cuLimitProgramId)).toBe(true)
    expect(tx.instructions[1].programId.equals(cuLimitProgramId)).toBe(true)
  })

  it("calls withCastVote with correct parameters", async () => {
    await buildCastVoteTransaction(mockConnection as never, baseParams)

    expect(mockWithCastVote).toHaveBeenCalledOnce()
    const args = mockWithCastVote.mock.calls[0]

    // args[0] = instructions array
    expect(Array.isArray(args[0])).toBe(true)
    // args[1] = governance program ID
    expect(args[1].toBase58()).toBe(
      "GovER5Lthms3bLBqWub97yVRs6buSgstyZvo8jaxYMB6"
    )
    // args[2] = program version
    expect(args[2]).toBe(3)
    // args[3] = realm
    expect(args[3].equals(realmPubkey)).toBe(true)
    // args[4] = governance
    expect(args[4].equals(governancePubkey)).toBe(true)
    // args[5] = proposal
    expect(args[5].equals(proposalPubkey)).toBe(true)
    // args[6] = proposalOwnerRecord (from on-chain proposal data)
    expect(args[6].toBase58()).toBe(ADDR.proposerTor)
    // args[7] = voter's tokenOwnerRecord
    expect(args[7].equals(tokenOwnerRecordPubkey)).toBe(true)
    // args[8] = governanceAuthority (voter)
    expect(args[8].equals(voterPubkey)).toBe(true)
    // args[9] = governingTokenMint (from on-chain proposal)
    expect(args[9].toBase58()).toBe(ADDR.mint)
    // args[10] = Vote object
    expect(args[10].voteType).toBe(0) // VoteKind.Approve
    // args[11] = payer (voter)
    expect(args[11].equals(voterPubkey)).toBe(true)
    // args[12] = voterWeightRecord (undefined when not provided)
    expect(args[12]).toBeUndefined()
  })

  it("passes voterWeightRecord when provided", async () => {
    await buildCastVoteTransaction(mockConnection as never, {
      ...baseParams,
      voterWeightRecordPubkey,
    })

    expect(mockWithCastVote).toHaveBeenCalledOnce()
    const args = mockWithCastVote.mock.calls[0]

    // args[12] = voterWeightRecord
    expect(args[12].equals(voterWeightRecordPubkey)).toBe(true)
  })

  it("fetches program version from connection", async () => {
    await buildCastVoteTransaction(mockConnection as never, baseParams)

    expect(mockGetGovernanceProgramVersion).toHaveBeenCalledWith(
      mockConnection,
      expect.any(PublicKey)
    )
  })

  it("fetches proposal data from chain", async () => {
    await buildCastVoteTransaction(mockConnection as never, baseParams)

    expect(mockGetProposal).toHaveBeenCalledWith(mockConnection, proposalPubkey)
  })

  it("constructs Vote object with correct choice rank", async () => {
    await buildCastVoteTransaction(mockConnection as never, {
      ...baseParams,
      choice: 2,
    })

    const vote = mockWithCastVote.mock.calls[0][10]
    expect(vote.approveChoices[0].rank).toBe(2)
    expect(vote.approveChoices[0].weightPercentage).toBe(100)
  })

  it("throws when program version fetch fails", async () => {
    mockGetGovernanceProgramVersion.mockRejectedValueOnce(
      new Error("RPC unavailable")
    )

    await expect(
      buildCastVoteTransaction(mockConnection as never, baseParams)
    ).rejects.toThrow("RPC unavailable")
  })

  it("throws when proposal fetch fails", async () => {
    mockGetProposal.mockRejectedValueOnce(
      new Error("Proposal not found on-chain")
    )

    await expect(
      buildCastVoteTransaction(mockConnection as never, baseParams)
    ).rejects.toThrow("Proposal not found on-chain")
  })
})
