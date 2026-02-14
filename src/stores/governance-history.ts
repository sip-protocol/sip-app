import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PrivateVoteRecord } from "@/lib/governance/types"
import { MAX_GOVERNANCE_HISTORY } from "@/lib/governance/constants"

interface GovernanceHistoryStore {
  votes: PrivateVoteRecord[]
  addVote: (vote: PrivateVoteRecord) => void
  updateVote: (id: string, updates: Partial<PrivateVoteRecord>) => void
  getVote: (id: string) => PrivateVoteRecord | undefined
  getVotesForProposal: (proposalId: string) => PrivateVoteRecord[]
  getUnrevealedVotes: () => PrivateVoteRecord[]
  clearHistory: () => void
}

export const useGovernanceHistoryStore = create<GovernanceHistoryStore>()(
  persist(
    (set, get) => ({
      votes: [],

      addVote: (vote) =>
        set((state) => ({
          votes: [vote, ...state.votes].slice(0, MAX_GOVERNANCE_HISTORY),
        })),

      updateVote: (id, updates) =>
        set((state) => ({
          votes: state.votes.map((v) =>
            v.id === id ? { ...v, ...updates } : v,
          ),
        })),

      getVote: (id) => get().votes.find((v) => v.id === id),

      getVotesForProposal: (proposalId) =>
        get().votes.filter((v) => v.proposalId === proposalId),

      getUnrevealedVotes: () =>
        get().votes.filter((v) => v.status === "committed"),

      clearHistory: () => set({ votes: [] }),
    }),
    {
      name: "sip-governance-history",
    },
  ),
)
