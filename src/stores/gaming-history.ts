import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { GamingActionRecord, GameResult } from "@/lib/gaming/types"
import { MAX_GAMING_HISTORY } from "@/lib/gaming/constants"

interface GamingHistoryStore {
  actions: GamingActionRecord[]
  results: GameResult[]

  addAction: (record: GamingActionRecord) => void
  updateAction: (id: string, updates: Partial<GamingActionRecord>) => void
  getAction: (id: string) => GamingActionRecord | undefined
  getActionsByType: (type: "play" | "claim") => GamingActionRecord[]

  addResult: (result: GameResult) => void
  getResult: (gameId: string) => GameResult | undefined
  getWinsCount: () => number

  clearHistory: () => void
}

export const useGamingHistoryStore = create<GamingHistoryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      results: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_GAMING_HISTORY),
        })),

      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      getAction: (id) => get().actions.find((a) => a.id === id),

      getActionsByType: (type) => get().actions.filter((a) => a.type === type),

      addResult: (result) =>
        set((state) => ({
          results: [result, ...state.results].slice(0, MAX_GAMING_HISTORY),
        })),

      getResult: (gameId) =>
        get().results.find((r) => r.gameId === gameId),

      getWinsCount: () =>
        get().results.filter((r) => r.won).length,

      clearHistory: () => set({ actions: [], results: [] }),
    }),
    {
      name: "sip-gaming-history",
    }
  )
)
