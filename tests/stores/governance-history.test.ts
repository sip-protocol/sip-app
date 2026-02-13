import { describe, it, expect, beforeEach } from "vitest"
import { useGovernanceHistoryStore } from "@/stores/governance-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { PrivateVoteRecord } from "@/lib/governance/types"

function makeMockVote(overrides?: Partial<PrivateVoteRecord>): PrivateVoteRecord {
  return {
    id: `vote_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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
    status: "committed",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    committedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

describe("useGovernanceHistoryStore", () => {
  beforeEach(() => {
    useGovernanceHistoryStore.setState({ votes: [] })
  })

  it("has empty initial state", () => {
    const state = useGovernanceHistoryStore.getState()
    expect(state.votes).toEqual([])
  })

  it("adds a vote", () => {
    const vote = makeMockVote({ id: "test-1" })
    useGovernanceHistoryStore.getState().addVote(vote)

    const state = useGovernanceHistoryStore.getState()
    expect(state.votes).toHaveLength(1)
    expect(state.votes[0].id).toBe("test-1")
  })

  it("prepends new votes (newest first)", () => {
    const v1 = makeMockVote({ id: "first" })
    const v2 = makeMockVote({ id: "second" })

    const store = useGovernanceHistoryStore.getState()
    store.addVote(v1)
    store.addVote(v2)

    const state = useGovernanceHistoryStore.getState()
    expect(state.votes[0].id).toBe("second")
    expect(state.votes[1].id).toBe("first")
  })

  it("caps at MAX_GOVERNANCE_HISTORY (100)", () => {
    const store = useGovernanceHistoryStore.getState()

    for (let i = 0; i < 105; i++) {
      store.addVote(makeMockVote({ id: `v-${i}` }))
    }

    expect(useGovernanceHistoryStore.getState().votes).toHaveLength(100)
  })

  it("updates a vote", () => {
    const vote = makeMockVote({ id: "update-me", status: "committed" })
    useGovernanceHistoryStore.getState().addVote(vote)

    useGovernanceHistoryStore.getState().updateVote("update-me", {
      status: "revealed",
      revealedAt: Date.now(),
      revealedChoice: 0,
      revealedWeight: "15000",
    })

    const updated = useGovernanceHistoryStore.getState().getVote("update-me")
    expect(updated?.status).toBe("revealed")
    expect(updated?.revealedAt).toBeDefined()
    expect(updated?.revealedChoice).toBe(0)
  })

  it("getVote returns undefined for missing id", () => {
    const result = useGovernanceHistoryStore.getState().getVote("nonexistent")
    expect(result).toBeUndefined()
  })

  it("getVotesForProposal filters correctly", () => {
    const store = useGovernanceHistoryStore.getState()
    store.addVote(makeMockVote({ id: "v1", proposalId: "prop-a" }))
    store.addVote(makeMockVote({ id: "v2", proposalId: "prop-b" }))
    store.addVote(makeMockVote({ id: "v3", proposalId: "prop-a" }))

    const filtered = useGovernanceHistoryStore.getState().getVotesForProposal("prop-a")
    expect(filtered).toHaveLength(2)
    expect(filtered.every((v) => v.proposalId === "prop-a")).toBe(true)
  })

  it("getUnrevealedVotes returns only committed votes", () => {
    const store = useGovernanceHistoryStore.getState()
    store.addVote(makeMockVote({ id: "v1", status: "committed" }))
    store.addVote(makeMockVote({ id: "v2", status: "revealed" }))
    store.addVote(makeMockVote({ id: "v3", status: "committed" }))

    const unrevealed = useGovernanceHistoryStore.getState().getUnrevealedVotes()
    expect(unrevealed).toHaveLength(2)
    expect(unrevealed.every((v) => v.status === "committed")).toBe(true)
  })

  it("clears all history", () => {
    const store = useGovernanceHistoryStore.getState()
    store.addVote(makeMockVote())
    store.addVote(makeMockVote())

    expect(useGovernanceHistoryStore.getState().votes).toHaveLength(2)

    useGovernanceHistoryStore.getState().clearHistory()
    expect(useGovernanceHistoryStore.getState().votes).toEqual([])
  })
})
