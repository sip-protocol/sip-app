import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DeSciActionRecord, Contribution } from "@/lib/desci/types"
import { MAX_DESCI_HISTORY } from "@/lib/desci/constants"

interface DeSciHistoryStore {
  actions: DeSciActionRecord[]
  contributions: Contribution[]

  addAction: (record: DeSciActionRecord) => void
  updateAction: (id: string, updates: Partial<DeSciActionRecord>) => void
  getAction: (id: string) => DeSciActionRecord | undefined
  getActionsByType: (type: "fund" | "review") => DeSciActionRecord[]

  addContribution: (contribution: Contribution) => void
  getContribution: (projectId: string) => Contribution | undefined
  getProjectCount: () => number

  clearHistory: () => void
}

export const useDeSciHistoryStore = create<DeSciHistoryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      contributions: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_DESCI_HISTORY),
        })),

      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      getAction: (id) => get().actions.find((a) => a.id === id),

      getActionsByType: (type) => get().actions.filter((a) => a.type === type),

      addContribution: (contribution) =>
        set((state) => ({
          contributions: [contribution, ...state.contributions].slice(
            0,
            MAX_DESCI_HISTORY
          ),
        })),

      getContribution: (projectId) =>
        get().contributions.find((c) => c.projectId === projectId),

      getProjectCount: () => get().contributions.length,

      clearHistory: () => set({ actions: [], contributions: [] }),
    }),
    {
      name: "sip-desci-history",
    }
  )
)
