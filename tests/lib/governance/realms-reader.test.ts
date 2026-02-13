import { describe, it, expect } from "vitest"
import { RealmsReader } from "@/lib/governance/realms-reader"

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
      expect(proposals.every((p) => p.daoId === "marinade" && p.status === "voting")).toBe(true)
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

  describe("realms mode", () => {
    const reader = new RealmsReader("realms")

    it("throws not implemented for getDAOs", async () => {
      await expect(reader.getDAOs()).rejects.toThrow("Realms mode is not yet implemented")
    })

    it("throws not implemented for getProposals", async () => {
      await expect(reader.getProposals()).rejects.toThrow("Realms mode is not yet implemented")
    })

    it("throws not implemented for getProposal", async () => {
      await expect(reader.getProposal("any")).rejects.toThrow("Realms mode is not yet implemented")
    })

    it("throws not implemented for getVoterWeight", async () => {
      await expect(reader.getVoterWeight("any")).rejects.toThrow("Realms mode is not yet implemented")
    })
  })
})
