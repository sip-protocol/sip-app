import { describe, it, expect, beforeEach } from "vitest"
import { useTicketingHistoryStore } from "@/stores/ticketing-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { TicketingActionRecord, Ticket } from "@/lib/ticketing/types"

function makeMockAction(
  overrides?: Partial<TicketingActionRecord>
): TicketingActionRecord {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "purchase",
    eventId: "event-test",
    status: "purchased",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

function makeMockTicket(overrides?: Partial<Ticket>): Ticket {
  return {
    eventId: `event_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    tier: "general",
    commitmentHash: "0x1234...5678",
    purchasedAt: Date.now(),
    ...overrides,
  }
}

describe("useTicketingHistoryStore", () => {
  beforeEach(() => {
    useTicketingHistoryStore.setState({ actions: [], tickets: [] })
  })

  it("has empty initial state", () => {
    const state = useTicketingHistoryStore.getState()
    expect(state.actions).toEqual([])
    expect(state.tickets).toEqual([])
  })

  it("adds an action", () => {
    const action = makeMockAction({ id: "test-1" })
    useTicketingHistoryStore.getState().addAction(action)

    const state = useTicketingHistoryStore.getState()
    expect(state.actions).toHaveLength(1)
    expect(state.actions[0].id).toBe("test-1")
  })

  it("caps at MAX_TICKETING_HISTORY (50)", () => {
    const store = useTicketingHistoryStore.getState()

    for (let i = 0; i < 55; i++) {
      store.addAction(makeMockAction({ id: `a-${i}` }))
    }

    expect(useTicketingHistoryStore.getState().actions).toHaveLength(50)
  })

  it("updates an action", () => {
    const action = makeMockAction({
      id: "update-me",
      status: "selecting_event",
    })
    useTicketingHistoryStore.getState().addAction(action)

    useTicketingHistoryStore.getState().updateAction("update-me", {
      status: "purchased",
      completedAt: Date.now(),
    })

    const updated = useTicketingHistoryStore.getState().getAction("update-me")
    expect(updated?.status).toBe("purchased")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getActionsByType filters correctly", () => {
    const store = useTicketingHistoryStore.getState()
    store.addAction(makeMockAction({ id: "a1", type: "purchase" }))
    store.addAction(makeMockAction({ id: "a2", type: "verify" }))
    store.addAction(makeMockAction({ id: "a3", type: "purchase" }))

    const purchases = useTicketingHistoryStore
      .getState()
      .getActionsByType("purchase")
    expect(purchases).toHaveLength(2)
    expect(purchases.every((a) => a.type === "purchase")).toBe(true)
  })

  it("adds a ticket", () => {
    const ticket = makeMockTicket({ eventId: "event-1" })
    useTicketingHistoryStore.getState().addTicket(ticket)

    const found = useTicketingHistoryStore.getState().getTicket("event-1")
    expect(found).toBeDefined()
    expect(found?.eventId).toBe("event-1")
  })

  it("counts attended events correctly", () => {
    const store = useTicketingHistoryStore.getState()
    store.addTicket(makeMockTicket({ eventId: "e1" }))
    store.addTicket(makeMockTicket({ eventId: "e2" }))
    store.addTicket(makeMockTicket({ eventId: "e3" }))

    expect(useTicketingHistoryStore.getState().getAttendedCount()).toBe(3)
  })

  it("clears all history", () => {
    const store = useTicketingHistoryStore.getState()
    store.addAction(makeMockAction())
    store.addTicket(makeMockTicket())

    expect(useTicketingHistoryStore.getState().actions).toHaveLength(1)
    expect(useTicketingHistoryStore.getState().tickets).toHaveLength(1)

    useTicketingHistoryStore.getState().clearHistory()
    expect(useTicketingHistoryStore.getState().actions).toEqual([])
    expect(useTicketingHistoryStore.getState().tickets).toEqual([])
  })
})
