import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MusicActionRecord, Stream } from "@/lib/music/types"
import { MAX_MUSIC_HISTORY } from "@/lib/music/constants"

interface MusicHistoryStore {
  actions: MusicActionRecord[]
  streams: Stream[]

  addAction: (record: MusicActionRecord) => void
  updateAction: (id: string, updates: Partial<MusicActionRecord>) => void
  getAction: (id: string) => MusicActionRecord | undefined
  getActionsByType: (type: "stream" | "playlist") => MusicActionRecord[]

  addStream: (stream: Stream) => void
  getStream: (trackId: string) => Stream | undefined
  getTrackCount: () => number

  clearHistory: () => void
}

export const useMusicHistoryStore = create<MusicHistoryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      streams: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_MUSIC_HISTORY),
        })),

      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      getAction: (id) => get().actions.find((a) => a.id === id),

      getActionsByType: (type) => get().actions.filter((a) => a.type === type),

      addStream: (stream) =>
        set((state) => ({
          streams: [stream, ...state.streams].slice(0, MAX_MUSIC_HISTORY),
        })),

      getStream: (trackId) => get().streams.find((s) => s.trackId === trackId),

      getTrackCount: () => get().streams.length,

      clearHistory: () => set({ actions: [], streams: [] }),
    }),
    {
      name: "sip-music-history",
    }
  )
)
