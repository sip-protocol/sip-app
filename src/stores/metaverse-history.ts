import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MetaverseActionRecord, Visit } from "@/lib/metaverse/types"
import { MAX_METAVERSE_HISTORY } from "@/lib/metaverse/constants"

interface MetaverseHistoryStore {
  actions: MetaverseActionRecord[]
  visits: Visit[]

  addAction: (record: MetaverseActionRecord) => void
  updateAction: (id: string, updates: Partial<MetaverseActionRecord>) => void
  getAction: (id: string) => MetaverseActionRecord | undefined
  getActionsByType: (type: "explore" | "teleport") => MetaverseActionRecord[]

  addVisit: (visit: Visit) => void
  getVisit: (worldId: string) => Visit | undefined
  getWorldCount: () => number

  clearHistory: () => void
}

export const useMetaverseHistoryStore = create<MetaverseHistoryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      visits: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_METAVERSE_HISTORY),
        })),

      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      getAction: (id) => get().actions.find((a) => a.id === id),

      getActionsByType: (type) => get().actions.filter((a) => a.type === type),

      addVisit: (visit) =>
        set((state) => ({
          visits: [visit, ...state.visits].slice(0, MAX_METAVERSE_HISTORY),
        })),

      getVisit: (worldId) => get().visits.find((v) => v.worldId === worldId),

      getWorldCount: () => get().visits.length,

      clearHistory: () => set({ actions: [], visits: [] }),
    }),
    {
      name: "sip-metaverse-history",
    }
  )
)
