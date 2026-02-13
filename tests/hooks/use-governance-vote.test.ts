import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { PrivacyLevel } from "@sip-protocol/types"
import { useGovernanceVote } from "@/hooks/use-governance-vote"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    signTransaction: vi.fn(),
  }),
}))

// Mock GovernanceService as a class
vi.mock("@/lib/governance/governance-service", () => {
  class MockGovernanceService {
    private onStepChange?: (step: string, vote: Record<string, unknown>) => void
    constructor(options: { onStepChange?: (step: string, vote: Record<string, unknown>) => void } = {}) {
      this.onStepChange = options.onStepChange
    }
    validate() {
      return null
    }
    async commitVote(params: { proposalId: string; choice: number; weight: string; privacyLevel: string }) {
      const vote = {
        id: "vote_mock_123",
        proposalId: params.proposalId,
        daoName: "Marinade Finance",
        proposalTitle: "Increase validator set",
        choice: params.choice,
        choiceLabel: "For",
        weight: params.weight,
        encryptedVote: {
          ciphertext: "0xabc",
          nonce: "0xdef",
          encryptionKeyHash: "0x123",
          proposalId: params.proposalId,
          voter: "anonymous",
          timestamp: Date.now(),
        },
        encryptionKey: "0xkey",
        status: "committed" as const,
        privacyLevel: params.privacyLevel,
        startedAt: Date.now(),
        committedAt: Date.now(),
        stepTimestamps: {},
      }
      this.onStepChange?.("encrypting", vote)
      this.onStepChange?.("committing", vote)
      this.onStepChange?.("committed", vote)
      return vote
    }
    async revealVote(voteId: string) {
      const vote = {
        id: voteId,
        proposalId: "prop-mnde-01",
        daoName: "Marinade Finance",
        proposalTitle: "Increase validator set",
        choice: 0,
        choiceLabel: "For",
        weight: "15000",
        encryptedVote: {
          ciphertext: "0xabc",
          nonce: "0xdef",
          encryptionKeyHash: "0x123",
          proposalId: "prop-mnde-01",
          voter: "anonymous",
          timestamp: Date.now(),
        },
        encryptionKey: "0xkey",
        status: "revealed" as const,
        privacyLevel: "shielded",
        startedAt: Date.now(),
        revealedAt: Date.now(),
        revealedChoice: 0,
        revealedWeight: "15000",
        stepTimestamps: {},
      }
      this.onStepChange?.("revealing", vote)
      this.onStepChange?.("revealed", vote)
      return vote
    }
  }
  return { GovernanceService: MockGovernanceService }
})

// Mock tracking
vi.mock("@/hooks/useTrackEvent", () => ({
  useTrackEvent: () => ({
    track: vi.fn(),
    trackBridge: vi.fn(),
    trackVote: vi.fn(),
    trackSocial: vi.fn(),
    trackLoyalty: vi.fn(),
    trackArt: vi.fn(),
    trackChannel: vi.fn(),
  }),
}))

const validParams = {
  proposalId: "prop-mnde-01",
  choice: 0,
  weight: "15000",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("useGovernanceVote", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useGovernanceVote())
    expect(result.current.status).toBe("idle")
    expect(result.current.activeVote).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("completes commit vote flow", async () => {
    const { result } = renderHook(() => useGovernanceVote())

    await act(async () => {
      await result.current.commitVote(validParams)
    })

    expect(result.current.status).toBe("committed")
    expect(result.current.activeVote).toBeTruthy()
    expect(result.current.activeVote?.id).toBe("vote_mock_123")
  })

  it("returns vote result on success", async () => {
    const { result } = renderHook(() => useGovernanceVote())

    let voteResult: unknown
    await act(async () => {
      voteResult = await result.current.commitVote(validParams)
    })

    expect(voteResult).toBeTruthy()
    expect((voteResult as { id: string }).id).toBe("vote_mock_123")
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useGovernanceVote())

    await act(async () => {
      await result.current.commitVote(validParams)
    })

    expect(result.current.status).toBe("committed")

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.activeVote).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
