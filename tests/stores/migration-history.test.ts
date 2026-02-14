import { describe, it, expect, beforeEach } from "vitest"
import { useMigrationHistoryStore } from "@/stores/migration-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { Migration } from "@/lib/migrations/types"

function createMockMigration(overrides: Partial<Migration> = {}): Migration {
  return {
    id: `migration_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    source: { protocol: null, type: "manual", balance: "10", token: "SOL" },
    amount: "1.5",
    stealthAddress: "sip:solana:mock-stealth",
    stealthMetaAddress: "sip:solana:meta:mock-meta",
    privacyLevel: PrivacyLevel.SHIELDED,
    status: "complete",
    startedAt: Date.now(),
    completedAt: Date.now() + 5000,
    stepTimestamps: {},
    ...overrides,
  }
}

describe("useMigrationHistoryStore", () => {
  beforeEach(() => {
    useMigrationHistoryStore.setState({ migrations: [] })
  })

  describe("initial state", () => {
    it("starts with empty migrations", () => {
      const state = useMigrationHistoryStore.getState()
      expect(state.migrations).toEqual([])
    })
  })

  describe("addMigration", () => {
    it("adds a migration to the front", () => {
      const migration = createMockMigration({ id: "m1" })
      useMigrationHistoryStore.getState().addMigration(migration)

      const state = useMigrationHistoryStore.getState()
      expect(state.migrations).toHaveLength(1)
      expect(state.migrations[0].id).toBe("m1")
    })

    it("prepends new migrations", () => {
      const m1 = createMockMigration({ id: "m1" })
      const m2 = createMockMigration({ id: "m2" })

      useMigrationHistoryStore.getState().addMigration(m1)
      useMigrationHistoryStore.getState().addMigration(m2)

      const state = useMigrationHistoryStore.getState()
      expect(state.migrations[0].id).toBe("m2")
      expect(state.migrations[1].id).toBe("m1")
    })

    it("caps at MAX_MIGRATION_HISTORY", () => {
      for (let i = 0; i < 55; i++) {
        useMigrationHistoryStore
          .getState()
          .addMigration(createMockMigration({ id: `m${i}` }))
      }

      const state = useMigrationHistoryStore.getState()
      expect(state.migrations.length).toBeLessThanOrEqual(50)
    })
  })

  describe("updateMigration", () => {
    it("updates an existing migration", () => {
      const migration = createMockMigration({ id: "m1", status: "scanning_wallet" })
      useMigrationHistoryStore.getState().addMigration(migration)

      useMigrationHistoryStore.getState().updateMigration("m1", {
        status: "complete",
        gsolAmount: "1.5",
      })

      const updated = useMigrationHistoryStore.getState().getMigration("m1")
      expect(updated?.status).toBe("complete")
      expect(updated?.gsolAmount).toBe("1.5")
    })

    it("does not modify other migrations", () => {
      useMigrationHistoryStore
        .getState()
        .addMigration(createMockMigration({ id: "m1" }))
      useMigrationHistoryStore
        .getState()
        .addMigration(createMockMigration({ id: "m2" }))

      useMigrationHistoryStore.getState().updateMigration("m1", {
        error: "test error",
      })

      const m2 = useMigrationHistoryStore.getState().getMigration("m2")
      expect(m2?.error).toBeUndefined()
    })
  })

  describe("getMigration", () => {
    it("finds migration by id", () => {
      const migration = createMockMigration({ id: "m1" })
      useMigrationHistoryStore.getState().addMigration(migration)

      const found = useMigrationHistoryStore.getState().getMigration("m1")
      expect(found).toBeTruthy()
      expect(found?.id).toBe("m1")
    })

    it("returns undefined for unknown id", () => {
      const found = useMigrationHistoryStore
        .getState()
        .getMigration("nonexistent")
      expect(found).toBeUndefined()
    })
  })

  describe("clearHistory", () => {
    it("removes all migrations", () => {
      useMigrationHistoryStore
        .getState()
        .addMigration(createMockMigration({ id: "m1" }))
      useMigrationHistoryStore
        .getState()
        .addMigration(createMockMigration({ id: "m2" }))

      useMigrationHistoryStore.getState().clearHistory()

      const state = useMigrationHistoryStore.getState()
      expect(state.migrations).toEqual([])
    })
  })
})
