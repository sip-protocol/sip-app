import { describe, it, expect, vi, beforeEach } from "vitest"
import { GovernanceService } from "@/lib/governance/governance-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type { VoteStep, VoteParams } from "@/lib/governance/types"

// Mock the SDK to avoid WASM/crypto deps in tests
vi.mock("@sip-protocol/sdk", () => {
  let callCount = 0
  class MockPrivateVoting {
    castVote(params: { proposalId: string; choice: number; weight: bigint; encryptionKey: string }) {
      callCount++
      return {
        ciphertext: `0x${"ab".repeat(32)}`,
        nonce: `0x${"cd".repeat(12)}`,
        encryptionKeyHash: `0x${"ef".repeat(16)}`,
        proposalId: params.proposalId,
        voter: "anonymous",
        timestamp: Date.now(),
      }
    }

    revealVote(_vote: unknown, _key: string) {
      return {
        proposalId: "prop-mnde-01",
        choice: 1,
        weight: BigInt(15000),
        voter: "anonymous",
        timestamp: Date.now(),
        encryptedVote: _vote,
      }
    }
  }

  return {
    createPrivateVoting: () => new MockPrivateVoting(),
    PrivateVoting: MockPrivateVoting,
  }
})

const validParams: VoteParams = {
  proposalId: "prop-mnde-01",
  choice: 0,
  weight: "15000",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("GovernanceService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects empty proposal ID", () => {
      const service = new GovernanceService()
      const error = service.validate({ ...validParams, proposalId: "" })
      expect(error).toBe("Proposal ID is required")
    })

    it("rejects unknown proposal ID", () => {
      const service = new GovernanceService()
      const error = service.validate({ ...validParams, proposalId: "nonexistent" })
      expect(error).toBe("Proposal not found")
    })

    it("rejects proposal not in voting phase", () => {
      const service = new GovernanceService()
      // prop-mnde-02 is in reveal phase
      const error = service.validate({ ...validParams, proposalId: "prop-mnde-02" })
      expect(error).toBe("Proposal is not in voting phase")
    })

    it("rejects invalid choice (negative)", () => {
      const service = new GovernanceService()
      const error = service.validate({ ...validParams, choice: -1 })
      expect(error).toBe("Invalid choice. Must be 0-2")
    })

    it("rejects invalid choice (out of range)", () => {
      const service = new GovernanceService()
      const error = service.validate({ ...validParams, choice: 5 })
      expect(error).toBe("Invalid choice. Must be 0-2")
    })

    it("rejects zero weight", () => {
      const service = new GovernanceService()
      const error = service.validate({ ...validParams, weight: "0" })
      expect(error).toBe("Voting weight must be greater than 0")
    })

    it("accepts valid params", () => {
      const service = new GovernanceService()
      const error = service.validate(validParams)
      expect(error).toBeNull()
    })
  })

  describe("commitVote (simulation)", () => {
    it("progresses through commit steps in order", async () => {
      const steps: VoteStep[] = []
      const service = new GovernanceService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.commitVote(validParams)

      expect(steps).toEqual(["encrypting", "committing", "committed"])
      expect(result.status).toBe("committed")
    })

    it("populates encrypted vote data", async () => {
      const service = new GovernanceService({ mode: "simulation" })
      const result = await service.commitVote(validParams)

      expect(result.encryptedVote.ciphertext).toBeTruthy()
      expect(result.encryptedVote.nonce).toBeTruthy()
      expect(result.encryptedVote.encryptionKeyHash).toBeTruthy()
      expect(result.encryptedVote.proposalId).toBe("prop-mnde-01")
    })

    it("records step timestamps", async () => {
      const service = new GovernanceService({ mode: "simulation" })
      const result = await service.commitVote(validParams)

      expect(result.stepTimestamps.encrypting).toBeDefined()
      expect(result.stepTimestamps.committing).toBeDefined()
      expect(result.stepTimestamps.committed).toBeDefined()
    })

    it("sets committedAt on success", async () => {
      const service = new GovernanceService({ mode: "simulation" })
      const result = await service.commitVote(validParams)

      expect(result.committedAt).toBeDefined()
      expect(result.committedAt).toBeGreaterThanOrEqual(result.startedAt)
    })

    it("sets vote metadata correctly", async () => {
      const service = new GovernanceService({ mode: "simulation" })
      const result = await service.commitVote(validParams)

      expect(result.proposalId).toBe("prop-mnde-01")
      expect(result.daoName).toBe("Marinade Finance")
      expect(result.choice).toBe(0)
      expect(result.choiceLabel).toBe("For")
      expect(result.weight).toBe("15000")
      expect(result.privacyLevel).toBe(PrivacyLevel.SHIELDED)
      expect(result.id).toMatch(/^vote_/)
    })

    it("throws on invalid params", async () => {
      const service = new GovernanceService({ mode: "simulation" })

      await expect(
        service.commitVote({ ...validParams, weight: "0" }),
      ).rejects.toThrow("Voting weight must be greater than 0")
    })
  })

  describe("revealVote (simulation)", () => {
    it("progresses through reveal steps", async () => {
      const commitService = new GovernanceService({ mode: "simulation" })
      const committed = await commitService.commitVote(validParams)

      const steps: VoteStep[] = []
      const revealService = new GovernanceService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await revealService.revealVote(
        committed.id,
        committed.encryptionKey,
        committed.encryptedVote,
      )

      expect(steps).toEqual(["revealing", "revealed"])
      expect(result.status).toBe("revealed")
    })

    it("sets revealedAt on success", async () => {
      const commitService = new GovernanceService({ mode: "simulation" })
      const committed = await commitService.commitVote(validParams)

      const revealService = new GovernanceService({ mode: "simulation" })
      const result = await revealService.revealVote(
        committed.id,
        committed.encryptionKey,
        committed.encryptedVote,
      )

      expect(result.revealedAt).toBeDefined()
      expect(result.revealedChoice).toBeDefined()
      expect(result.revealedWeight).toBeDefined()
    })

    it("throws for unknown proposal", async () => {
      const service = new GovernanceService({ mode: "simulation" })

      await expect(
        service.revealVote("vote-1", "0xkey", {
          ciphertext: "0xabc",
          nonce: "0xdef",
          encryptionKeyHash: "0x123",
          proposalId: "nonexistent",
          voter: "anon",
          timestamp: Date.now(),
        }),
      ).rejects.toThrow("Proposal not found")
    })
  })
})
