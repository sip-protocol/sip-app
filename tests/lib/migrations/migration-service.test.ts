import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { MigrationService } from "@/lib/migrations/migration-service"
import type {
  MigrationParams,
  MigrationStep,
  MigrationSource,
} from "@/lib/migrations/types"
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

// Mock crypto helpers (dynamic SDK import doesn't resolve under fake timers)
vi.mock("@/lib/crypto-helpers", () => ({
  encryptForViewingKey: vi.fn().mockResolvedValue({
    ciphertext: "mock-ciphertext",
    nonce: "mock-nonce",
    viewingKeyHash: "mock-viewing-key-hash",
  }),
}))

// Mock @solana/web3.js to prevent real RPC calls under fake timers
vi.mock("@solana/web3.js", () => {
  class MockPublicKey {
    private _key: string
    constructor(key: string) {
      this._key = key
    }
    toBase58() {
      return this._key
    }
    toString() {
      return this._key
    }
  }

  class MockConnection {
    getTokenSupply = vi.fn().mockResolvedValue({
      value: {
        amount: "85432000000000",
        decimals: 9,
        uiAmount: 85432.0,
        uiAmountString: "85432",
      },
    })
    getBalance = vi.fn().mockResolvedValue(2_500_000_000)
  }

  return {
    Connection: MockConnection,
    PublicKey: MockPublicKey,
    LAMPORTS_PER_SOL: 1_000_000_000,
  }
})

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

  afterEach(() => {
    vi.useRealTimers()
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
        source: {
          protocol: null,
          type: "protocol",
          balance: "5",
          token: "SOL",
        },
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
      expect(result.stealthMetaAddress).toBe(
        "sip:solana:meta:mock-meta-address"
      )
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

    it("devnet mode falls back to simulation behavior", async () => {
      const steps: MigrationStep[] = []
      const service = new MigrationService({
        mode: "devnet",
        onStepChange: (step) => {
          steps.push(step)
        },
      })
      const params: MigrationParams = {
        source: createManualSource(),
        amount: "1",
        privacyLevel: PrivacyLevel.SHIELDED,
      }

      const promise = service.executeMigration(params)
      await vi.advanceTimersByTimeAsync(20000)
      const result = await promise

      expect(result.status).toBe("complete")
      expect(result.stealthAddress).toBeTruthy()
      expect(steps).toContain("complete")
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
