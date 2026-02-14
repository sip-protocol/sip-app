import { describe, it, expect, vi, beforeEach } from "vitest"
import { MigrationService } from "@/lib/migrations/migration-service"
import type { MigrationParams, MigrationStep, MigrationSource } from "@/lib/migrations/types"
import { PrivacyLevel } from "@sip-protocol/types"

// Mock stealth generation
vi.mock("@/lib/migrations/stealth-migration", () => ({
  generateMigrationStealthAddress: vi.fn().mockResolvedValue({
    stealthAddress: "sip:solana:mock-stealth-address",
    stealthMetaAddress: "sip:solana:meta:mock-meta-address",
    spendingPrivateKey: "mock-spending-key",
    viewingPrivateKey: "mock-viewing-key",
    sharedSecret: "mock-shared-secret",
  }),
}))

function createManualSource(balance = "10"): MigrationSource {
  return {
    protocol: null,
    type: "manual",
    balance,
    token: "SOL",
  }
}

function createProtocolSource(): MigrationSource {
  return {
    protocol: {
      id: "saber",
      name: "Saber",
      icon: "/protocols/saber.png",
      description: "Stablecoin DEX",
      status: "inactive",
      category: "defi",
    },
    type: "protocol",
    balance: "5",
    token: "SOL",
  }
}

describe("MigrationService", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe("validate", () => {
    it("rejects zero amount", () => {
      const service = new MigrationService()
      const error = service.validate({
        source: createManualSource(),
        amount: "0",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
      expect(error).toBe("Amount must be greater than 0")
    })

    it("rejects negative amount", () => {
      const service = new MigrationService()
      const error = service.validate({
        source: createManualSource(),
        amount: "-1",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
      expect(error).toBe("Amount must be greater than 0")
    })

    it("rejects amount below minimum", () => {
      const service = new MigrationService()
      const error = service.validate({
        source: createManualSource(),
        amount: "0.001",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
      expect(error).toBe("Minimum migration amount is 0.01 SOL")
    })

    it("rejects protocol source without protocol", () => {
      const service = new MigrationService()
      const error = service.validate({
        source: { protocol: null, type: "protocol", balance: "5", token: "SOL" },
        amount: "1",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
      expect(error).toBe("Please select a source protocol")
    })

    it("accepts valid manual source", () => {
      const service = new MigrationService()
      const error = service.validate({
        source: createManualSource(),
        amount: "1",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
      expect(error).toBeNull()
    })

    it("accepts valid protocol source", () => {
      const service = new MigrationService()
      const error = service.validate({
        source: createProtocolSource(),
        amount: "1",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
      expect(error).toBeNull()
    })

    it("rejects non-numeric amount", () => {
      const service = new MigrationService()
      const error = service.validate({
        source: createManualSource(),
        amount: "abc",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
      expect(error).toBe("Amount must be greater than 0")
    })
  })

  describe("executeMigration", () => {
    it("throws on invalid params", async () => {
      const service = new MigrationService()
      await expect(
        service.executeMigration({
          source: createManualSource(),
          amount: "0",
          privacyLevel: PrivacyLevel.SHIELDED,
        })
      ).rejects.toThrow("Amount must be greater than 0")
    })

    it("walks through all steps in simulation mode", async () => {
      const steps: MigrationStep[] = []
      const service = new MigrationService({
        mode: "simulation",
        onStepChange: (step) => {
          steps.push(step)
        },
      })

      const params: MigrationParams = {
        source: createManualSource(),
        amount: "1.5",
        privacyLevel: PrivacyLevel.SHIELDED,
      }

      const promise = service.executeMigration(params)

      // Advance through all simulation delays
      await vi.advanceTimersByTimeAsync(20000)

      const result = await promise

      expect(steps).toEqual([
        "scanning_wallet",
        "generating_stealth",
        "withdrawing_from_source",
        "depositing_to_sunrise",
        "complete",
      ])

      expect(result.status).toBe("complete")
      expect(result.stealthAddress).toBe("sip:solana:mock-stealth-address")
      expect(result.stealthMetaAddress).toBe("sip:solana:meta:mock-meta-address")
      expect(result.withdrawTxHash).toBeTruthy()
      expect(result.depositTxHash).toBeTruthy()
      expect(result.gsolAmount).toBeTruthy()
      expect(result.carbonOffsetKg).toBeGreaterThan(0)
      expect(result.completedAt).toBeTruthy()
      expect(result.id).toMatch(/^migration_/)
    })

    it("generates unique IDs", async () => {
      const service = new MigrationService({ mode: "simulation" })
      const params: MigrationParams = {
        source: createManualSource(),
        amount: "1",
        privacyLevel: PrivacyLevel.SHIELDED,
      }

      const promise1 = service.executeMigration(params)
      await vi.advanceTimersByTimeAsync(20000)
      const result1 = await promise1

      const promise2 = service.executeMigration(params)
      await vi.advanceTimersByTimeAsync(20000)
      const result2 = await promise2

      expect(result1.id).not.toBe(result2.id)
    })

    it("records step timestamps", async () => {
      const service = new MigrationService({ mode: "simulation" })
      const params: MigrationParams = {
        source: createManualSource(),
        amount: "1",
        privacyLevel: PrivacyLevel.SHIELDED,
      }

      const promise = service.executeMigration(params)
      await vi.advanceTimersByTimeAsync(20000)
      const result = await promise

      expect(result.stepTimestamps.scanning_wallet).toBeTruthy()
      expect(result.stepTimestamps.generating_stealth).toBeTruthy()
      expect(result.stepTimestamps.withdrawing_from_source).toBeTruthy()
      expect(result.stepTimestamps.depositing_to_sunrise).toBeTruthy()
      expect(result.stepTimestamps.complete).toBeTruthy()
    })

    it("devnet mode throws not implemented", async () => {
      const service = new MigrationService({ mode: "devnet" })
      const params: MigrationParams = {
        source: createManualSource(),
        amount: "1",
        privacyLevel: PrivacyLevel.SHIELDED,
      }

      await expect(
        service.executeMigration(params)
      ).rejects.toThrow("Devnet mode is not yet implemented")
    })

    it("preserves privacy level from params", async () => {
      const service = new MigrationService({ mode: "simulation" })

      const promise = service.executeMigration({
        source: createManualSource(),
        amount: "1",
        privacyLevel: PrivacyLevel.COMPLIANT,
      })
      await vi.advanceTimersByTimeAsync(20000)
      const result = await promise

      expect(result.privacyLevel).toBe(PrivacyLevel.COMPLIANT)
    })
  })
})
