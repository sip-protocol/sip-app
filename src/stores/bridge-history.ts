import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BridgeTransfer } from "@/lib/bridge/types"
import { MAX_BRIDGE_HISTORY } from "@/lib/bridge/constants"

interface BridgeHistoryStore {
  transfers: BridgeTransfer[]
  addTransfer: (transfer: BridgeTransfer) => void
  updateTransfer: (id: string, updates: Partial<BridgeTransfer>) => void
  getTransfer: (id: string) => BridgeTransfer | undefined
  clearHistory: () => void
}

export const useBridgeHistoryStore = create<BridgeHistoryStore>()(
  persist(
    (set, get) => ({
      transfers: [],

      addTransfer: (transfer) =>
        set((state) => ({
          transfers: [transfer, ...state.transfers].slice(
            0,
            MAX_BRIDGE_HISTORY
          ),
        })),

      updateTransfer: (id, updates) =>
        set((state) => ({
          transfers: state.transfers.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      getTransfer: (id) => get().transfers.find((t) => t.id === id),

      clearHistory: () => set({ transfers: [] }),
    }),
    {
      name: "sip-bridge-history",
    }
  )
)
