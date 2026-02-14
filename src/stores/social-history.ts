import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SocialActionRecord, StealthProfile } from "@/lib/social/types"
import { MAX_SOCIAL_HISTORY } from "@/lib/social/constants"

interface SocialHistoryStore {
  actions: SocialActionRecord[]
  profiles: StealthProfile[]

  addAction: (record: SocialActionRecord) => void
  updateAction: (id: string, updates: Partial<SocialActionRecord>) => void
  getAction: (id: string) => SocialActionRecord | undefined
  getActionsByType: (type: "profile" | "post" | "follow") => SocialActionRecord[]

  addProfile: (profile: StealthProfile) => void
  getActiveProfile: () => StealthProfile | undefined
  getProfiles: () => StealthProfile[]

  clearHistory: () => void
}

export const useSocialHistoryStore = create<SocialHistoryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      profiles: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_SOCIAL_HISTORY),
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

      addProfile: (profile) =>
        set((state) => ({
          profiles: [profile, ...state.profiles],
        })),

      getActiveProfile: () => get().profiles[0],

      getProfiles: () => get().profiles,

      clearHistory: () => set({ actions: [], profiles: [] }),
    }),
    {
      name: "sip-social-history",
    },
  ),
)
