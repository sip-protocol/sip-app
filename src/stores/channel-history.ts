import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  ChannelActionRecord,
  ChannelSubscription,
} from "@/lib/channel/types"
import { MAX_CHANNEL_HISTORY } from "@/lib/channel/constants"

interface ChannelHistoryStore {
  actions: ChannelActionRecord[]
  subscriptions: ChannelSubscription[]

  addAction: (record: ChannelActionRecord) => void
  updateAction: (id: string, updates: Partial<ChannelActionRecord>) => void
  getAction: (id: string) => ChannelActionRecord | undefined
  getActionsByType: (type: "subscribe" | "publish") => ChannelActionRecord[]

  addSubscription: (subscription: ChannelSubscription) => void
  getSubscription: (dropId: string) => ChannelSubscription | undefined
  getActiveSubscriptionCount: () => number

  clearHistory: () => void
}

export const useChannelHistoryStore = create<ChannelHistoryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      subscriptions: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_CHANNEL_HISTORY),
        })),

      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      getAction: (id) => get().actions.find((a) => a.id === id),

      getActionsByType: (type) => get().actions.filter((a) => a.type === type),

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [subscription, ...state.subscriptions],
        })),

      getSubscription: (dropId) =>
        get().subscriptions.find((s) => s.dropId === dropId),

      getActiveSubscriptionCount: () =>
        get().subscriptions.filter((s) => s.isActive).length,

      clearHistory: () => set({ actions: [], subscriptions: [] }),
    }),
    {
      name: "sip-channel-history",
    }
  )
)
