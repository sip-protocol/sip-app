import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TicketingActionRecord, Ticket } from "@/lib/ticketing/types"
import { MAX_TICKETING_HISTORY } from "@/lib/ticketing/constants"

interface TicketingHistoryStore {
  actions: TicketingActionRecord[]
  tickets: Ticket[]

  addAction: (record: TicketingActionRecord) => void
  updateAction: (id: string, updates: Partial<TicketingActionRecord>) => void
  getAction: (id: string) => TicketingActionRecord | undefined
  getActionsByType: (type: "purchase" | "verify") => TicketingActionRecord[]

  addTicket: (ticket: Ticket) => void
  getTicket: (eventId: string) => Ticket | undefined
  getAttendedCount: () => number

  clearHistory: () => void
}

export const useTicketingHistoryStore = create<TicketingHistoryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      tickets: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_TICKETING_HISTORY),
        })),

      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      getAction: (id) => get().actions.find((a) => a.id === id),

      getActionsByType: (type) => get().actions.filter((a) => a.type === type),

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [ticket, ...state.tickets].slice(0, MAX_TICKETING_HISTORY),
        })),

      getTicket: (eventId) => get().tickets.find((t) => t.eventId === eventId),

      getAttendedCount: () => get().tickets.length,

      clearHistory: () => set({ actions: [], tickets: [] }),
    }),
    {
      name: "sip-ticketing-history",
    }
  )
)
