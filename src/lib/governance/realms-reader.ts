import type { DAO, Proposal, GovernanceMode, ProposalStatus } from "./types"
import { SAMPLE_DAOS, SAMPLE_PROPOSALS } from "./constants"

export class RealmsReader {
  private mode: GovernanceMode

  constructor(mode: GovernanceMode = "simulation") {
    this.mode = mode
  }

  async getDAOs(): Promise<DAO[]> {
    if (this.mode === "simulation") {
      return SAMPLE_DAOS
    }
    // Future: SPL Governance on-chain query
    throw new Error("Realms mode is not yet implemented. Use simulation mode.")
  }

  async getProposals(
    daoId?: string,
    status?: ProposalStatus
  ): Promise<Proposal[]> {
    if (this.mode === "simulation") {
      let proposals = SAMPLE_PROPOSALS
      if (daoId) {
        proposals = proposals.filter((p) => p.daoId === daoId)
      }
      if (status) {
        proposals = proposals.filter((p) => p.status === status)
      }
      return proposals
    }
    throw new Error("Realms mode is not yet implemented. Use simulation mode.")
  }

  async getProposal(proposalId: string): Promise<Proposal | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_PROPOSALS.find((p) => p.id === proposalId)
    }
    throw new Error("Realms mode is not yet implemented. Use simulation mode.")
  }

  async getVoterWeight(daoId: string): Promise<string> {
    if (this.mode === "simulation") {
      // Deterministic simulated weights per DAO
      const weights: Record<string, string> = {
        marinade: "15000",
        jupiter: "8500",
        mango: "42000",
        drift: "3200",
        jito: "1800",
      }
      return weights[daoId] ?? "1000"
    }
    throw new Error("Realms mode is not yet implemented. Use simulation mode.")
  }
}
