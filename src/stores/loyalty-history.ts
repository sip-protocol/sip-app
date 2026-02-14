import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { LoyaltyActionRecord, CampaignProgress } from "@/lib/loyalty/types"
import { MAX_LOYALTY_HISTORY } from "@/lib/loyalty/constants"

interface LoyaltyHistoryStore {
  actions: LoyaltyActionRecord[]
  joinedCampaigns: CampaignProgress[]

  addAction: (record: LoyaltyActionRecord) => void
  updateAction: (id: string, updates: Partial<LoyaltyActionRecord>) => void
  getAction: (id: string) => LoyaltyActionRecord | undefined
  getActionsByType: (type: "join" | "action" | "claim") => LoyaltyActionRecord[]

  addCampaign: (progress: CampaignProgress) => void
  getCampaignProgress: (campaignId: string) => CampaignProgress | undefined
  updateCampaignProgress: (campaignId: string, updates: Partial<CampaignProgress>) => void
  getCompletedCampaignCount: () => number

  clearHistory: () => void
}

export const useLoyaltyHistoryStore = create<LoyaltyHistoryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      joinedCampaigns: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_LOYALTY_HISTORY),
        })),

      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        })),

      getAction: (id) => get().actions.find((a) => a.id === id),

      getActionsByType: (type) =>
        get().actions.filter((a) => a.type === type),

      addCampaign: (progress) =>
        set((state) => ({
          joinedCampaigns: [progress, ...state.joinedCampaigns],
        })),

      getCampaignProgress: (campaignId) =>
        get().joinedCampaigns.find((c) => c.campaignId === campaignId),

      updateCampaignProgress: (campaignId, updates) =>
        set((state) => ({
          joinedCampaigns: state.joinedCampaigns.map((c) =>
            c.campaignId === campaignId ? { ...c, ...updates } : c,
          ),
        })),

      getCompletedCampaignCount: () =>
        get().joinedCampaigns.filter((c) => c.isComplete).length,

      clearHistory: () => set({ actions: [], joinedCampaigns: [] }),
    }),
    {
      name: "sip-loyalty-history",
    },
  ),
)
