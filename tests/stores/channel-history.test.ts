import { describe, it, expect, beforeEach } from "vitest"
import { useChannelHistoryStore } from "@/stores/channel-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { ChannelActionRecord, ChannelSubscription } from "@/lib/channel/types"

function makeMockAction(overrides?: Partial<ChannelActionRecord>): ChannelActionRecord {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "subscribe",
    dropId: "drop-test",
    status: "subscribed",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

function makeMockSubscription(overrides?: Partial<ChannelSubscription>): ChannelSubscription {
  return {
    dropId: `drop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    subscribedAt: Date.now(),
    accessTier: "free",
    isActive: true,
    ...overrides,
  }
}

describe("useChannelHistoryStore", () => {
  beforeEach(() => {
    useChannelHistoryStore.setState({ actions: [], subscriptions: [] })
  })

  it("has empty initial state", () => {
    const state = useChannelHistoryStore.getState()
    expect(state.actions).toEqual([])
    expect(state.subscriptions).toEqual([])
  })

  it("adds an action", () => {
    const action = makeMockAction({ id: "test-1" })
    useChannelHistoryStore.getState().addAction(action)

    const state = useChannelHistoryStore.getState()
    expect(state.actions).toHaveLength(1)
    expect(state.actions[0].id).toBe("test-1")
  })

  it("caps at MAX_CHANNEL_HISTORY (50)", () => {
    const store = useChannelHistoryStore.getState()

    for (let i = 0; i < 55; i++) {
      store.addAction(makeMockAction({ id: `a-${i}` }))
    }

    expect(useChannelHistoryStore.getState().actions).toHaveLength(50)
  })

  it("updates an action", () => {
    const action = makeMockAction({ id: "update-me", status: "selecting_channel" })
    useChannelHistoryStore.getState().addAction(action)

    useChannelHistoryStore.getState().updateAction("update-me", {
      status: "subscribed",
      completedAt: Date.now(),
    })

    const updated = useChannelHistoryStore.getState().getAction("update-me")
    expect(updated?.status).toBe("subscribed")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getActionsByType filters correctly", () => {
    const store = useChannelHistoryStore.getState()
    store.addAction(makeMockAction({ id: "a1", type: "subscribe" }))
    store.addAction(makeMockAction({ id: "a2", type: "publish" }))
    store.addAction(makeMockAction({ id: "a3", type: "subscribe" }))

    const subs = useChannelHistoryStore.getState().getActionsByType("subscribe")
    expect(subs).toHaveLength(2)
    expect(subs.every((a) => a.type === "subscribe")).toBe(true)
  })

  it("adds a subscription", () => {
    const sub = makeMockSubscription({ dropId: "drop-1" })
    useChannelHistoryStore.getState().addSubscription(sub)

    const result = useChannelHistoryStore.getState().getSubscription("drop-1")
    expect(result).toBeDefined()
    expect(result?.dropId).toBe("drop-1")
  })

  it("counts active subscriptions", () => {
    const store = useChannelHistoryStore.getState()
    store.addSubscription(makeMockSubscription({ dropId: "d1", isActive: true }))
    store.addSubscription(makeMockSubscription({ dropId: "d2", isActive: false }))
    store.addSubscription(makeMockSubscription({ dropId: "d3", isActive: true }))

    expect(useChannelHistoryStore.getState().getActiveSubscriptionCount()).toBe(2)
  })

  it("clears all history", () => {
    const store = useChannelHistoryStore.getState()
    store.addAction(makeMockAction())
    store.addSubscription(makeMockSubscription())

    expect(useChannelHistoryStore.getState().actions).toHaveLength(1)
    expect(useChannelHistoryStore.getState().subscriptions).toHaveLength(1)

    useChannelHistoryStore.getState().clearHistory()
    expect(useChannelHistoryStore.getState().actions).toEqual([])
    expect(useChannelHistoryStore.getState().subscriptions).toEqual([])
  })
})
