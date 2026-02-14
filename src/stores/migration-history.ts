import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Migration } from "@/lib/migrations/types"
import { MAX_MIGRATION_HISTORY } from "@/lib/migrations/constants"

interface MigrationHistoryStore {
  migrations: Migration[]
  addMigration: (migration: Migration) => void
  updateMigration: (id: string, updates: Partial<Migration>) => void
  getMigration: (id: string) => Migration | undefined
  clearHistory: () => void
}

export const useMigrationHistoryStore = create<MigrationHistoryStore>()(
  persist(
    (set, get) => ({
      migrations: [],

      addMigration: (migration) =>
        set((state) => ({
          migrations: [migration, ...state.migrations].slice(
            0,
            MAX_MIGRATION_HISTORY
          ),
        })),

      updateMigration: (id, updates) =>
        set((state) => ({
          migrations: state.migrations.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      getMigration: (id) => get().migrations.find((m) => m.id === id),

      clearHistory: () => set({ migrations: [] }),
    }),
    {
      name: "sip-migration-history",
    }
  )
)
