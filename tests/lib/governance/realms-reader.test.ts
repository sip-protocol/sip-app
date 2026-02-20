import { describe, it, expect, vi } from "vitest"
import { RealmsReader } from "@/lib/governance/realms-reader"

// Mock spl-governance to prevent real RPC calls in tests
vi.mock("@solana/spl-governance", async () => {
  const actual = await vi.importActual("@solana/spl-governance")
  return {
    ...actual,
    getRealm: vi.fn().mockRejectedValue(new Error("Mock: no RPC in tests")),
    getAllProposals: vi
      .fn()
      .mockRejectedValue(new Error("Mock: no RPC in tests")),
    getAllGovernances: vi
      .fn()
      .mockRejectedValue(new Error("Mock: no RPC in tests")),
    getTokenOwnerRecordsByOwner: vi
      .fn()
      .mockRejectedValue(new Error("Mock: no RPC in tests")),
    getGovernance: vi
      .fn()
      .mockRejectedValue(new Error("Mock: no RPC in tests")),
    getProposal: vi.fn().mockRejectedValue(new Error("Mock: no RPC in tests")),
  }
})

describe("RealmsReader", () => {
  describe("simulation mode", () => {
    const reader = new RealmsReader("simulation")

    it("returns sample DAOs", async () => {
      const daos = await reader.getDAOs()
      expect(daos.length).toBeGreaterThanOrEqual(5)
      expect(daos[0]).toHaveProperty("id")
      expect(daos[0]).toHaveProperty("name")
      expect(daos[0]).toHaveProperty("token")
    })

    it("returns all proposals", async () => {
      const proposals = await reader.getProposals()
      expect(proposals.length).toBeGreaterThanOrEqual(8)
    })

    it("filters proposals by DAO", async () => {
      const proposals = await reader.getProposals("marinade")
      expect(proposals.length).toBeGreaterThanOrEqual(2)
      expect(proposals.every((p) => p.daoId === "marinade")).toBe(true)
    })

    it("filters proposals by status", async () => {
      const proposals = await reader.getProposals(undefined, "voting")
      expect(proposals.length).toBeGreaterThanOrEqual(3)
      expect(proposals.every((p) => p.status === "voting")).toBe(true)
    })

    it("filters proposals by DAO and status", async () => {
      const proposals = await reader.getProposals("marinade", "voting")
      expect(
        proposals.every((p) => p.daoId === "marinade" && p.status === "voting")
      ).toBe(true)
    })

    it("returns a specific proposal", async () => {
      const proposal = await reader.getProposal("prop-mnde-01")
      expect(proposal).toBeDefined()
      expect(proposal?.title).toContain("validator")
    })

    it("returns undefined for missing proposal", async () => {
      const proposal = await reader.getProposal("nonexistent")
      expect(proposal).toBeUndefined()
    })

    it("returns voter weight for known DAO", async () => {
      const weight = await reader.getVoterWeight("marinade")
      expect(weight).toBe("15000")
    })

    it("returns default weight for unknown DAO", async () => {
      const weight = await reader.getVoterWeight("unknown-dao")
      expect(weight).toBe("1000")
    })
  })

  describe("realms mode (falls back when RPC unavailable)", () => {
    const reader = new RealmsReader("realms")

    it("falls back to simulation data for getDAOs", async () => {
      const daos = await reader.getDAOs()
      expect(daos.length).toBeGreaterThanOrEqual(5)
      expect(daos[0]).toHaveProperty("id")
      expect(daos[0]).toHaveProperty("name")
    })

    it("falls back to simulation data for getProposals", async () => {
      const proposals = await reader.getProposals()
      expect(proposals.length).toBeGreaterThanOrEqual(8)
    })

    it("falls back to simulation data for getProposal", async () => {
      const proposal = await reader.getProposal("prop-mnde-01")
      expect(proposal).toBeDefined()
    })

    it("falls back to simulation data for getVoterWeight without wallet", async () => {
      const weight = await reader.getVoterWeight("marinade")
      expect(weight).toBe("15000")
    })

    it("falls back to simulation data for getVoterWeight with wallet", async () => {
      // Provide a dummy wallet address — RPC mock will reject, triggering fallback
      const weight = await reader.getVoterWeight(
        "marinade",
        "7YttLkHDoN83knioufDQNW8p2sNmZ9Y2grpQ6dGHLj8S"
      )
      expect(weight).toBe("15000")
    })

    it("filters proposals by status in fallback mode", async () => {
      const proposals = await reader.getProposals(undefined, "voting")
      expect(proposals.length).toBeGreaterThanOrEqual(3)
      expect(proposals.every((p) => p.status === "voting")).toBe(true)
    })

    it("filters proposals by DAO in fallback mode", async () => {
      const proposals = await reader.getProposals("marinade")
      expect(proposals.length).toBeGreaterThanOrEqual(1)
    })
  })
})
