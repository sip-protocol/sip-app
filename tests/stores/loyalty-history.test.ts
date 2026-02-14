import { describe, it, expect, beforeEach } from "vitest"
import { useLoyaltyHistoryStore } from "@/stores/loyalty-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { LoyaltyActionRecord, CampaignProgress } from "@/lib/loyalty/types"

function makeMockAction(overrides?: Partial<LoyaltyActionRecord>): LoyaltyActionRecord {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "join",
    campaignId: "camp-test",
    status: "joined",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

function makeMockProgress(overrides?: Partial<CampaignProgress>): CampaignProgress {
  return {
    campaignId: `camp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    completedActions: 0,
    requiredActions: 5,
    isComplete: false,
    joinedAt: Date.now(),
    ...overrides,
  }
}

describe("useLoyaltyHistoryStore", () => {
  beforeEach(() => {
    useLoyaltyHistoryStore.setState({ actions: [], joinedCampaigns: [] })
  })

  it("has empty initial state", () => {
    const state = useLoyaltyHistoryStore.getState()
    expect(state.actions).toEqual([])
    expect(state.joinedCampaigns).toEqual([])
  })

  it("adds an action", () => {
    const action = makeMockAction({ id: "test-1" })
    useLoyaltyHistoryStore.getState().addAction(action)

    const state = useLoyaltyHistoryStore.getState()
    expect(state.actions).toHaveLength(1)
    expect(state.actions[0].id).toBe("test-1")
  })

  it("prepends new actions (newest first)", () => {
    const a1 = makeMockAction({ id: "first" })
    const a2 = makeMockAction({ id: "second" })

    const store = useLoyaltyHistoryStore.getState()
    store.addAction(a1)
    store.addAction(a2)

    const state = useLoyaltyHistoryStore.getState()
    expect(state.actions[0].id).toBe("second")
    expect(state.actions[1].id).toBe("first")
  })

  it("caps at MAX_LOYALTY_HISTORY (100)", () => {
    const store = useLoyaltyHistoryStore.getState()

    for (let i = 0; i < 105; i++) {
      store.addAction(makeMockAction({ id: `a-${i}` }))
    }

    expect(useLoyaltyHistoryStore.getState().actions).toHaveLength(100)
  })

  it("updates an action", () => {
    const action = makeMockAction({ id: "update-me", status: "selecting_campaign" })
    useLoyaltyHistoryStore.getState().addAction(action)

    useLoyaltyHistoryStore.getState().updateAction("update-me", {
      status: "joined",
      completedAt: Date.now(),
    })

    const updated = useLoyaltyHistoryStore.getState().getAction("update-me")
    expect(updated?.status).toBe("joined")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getAction returns undefined for missing id", () => {
    const result = useLoyaltyHistoryStore.getState().getAction("nonexistent")
    expect(result).toBeUndefined()
  })

  it("getActionsByType filters correctly", () => {
    const store = useLoyaltyHistoryStore.getState()
    store.addAction(makeMockAction({ id: "a1", type: "join" }))
    store.addAction(makeMockAction({ id: "a2", type: "action" }))
    store.addAction(makeMockAction({ id: "a3", type: "join" }))
    store.addAction(makeMockAction({ id: "a4", type: "claim" }))

    const joins = useLoyaltyHistoryStore.getState().getActionsByType("join")
    expect(joins).toHaveLength(2)
    expect(joins.every((a) => a.type === "join")).toBe(true)
  })

  it("adds a campaign progress", () => {
    const progress = makeMockProgress({ campaignId: "camp-1" })
    useLoyaltyHistoryStore.getState().addCampaign(progress)

    const result = useLoyaltyHistoryStore.getState().getCampaignProgress("camp-1")
    expect(result).toBeDefined()
    expect(result?.campaignId).toBe("camp-1")
  })

  it("updates campaign progress", () => {
    const store = useLoyaltyHistoryStore.getState()
    store.addCampaign(makeMockProgress({ campaignId: "camp-update", completedActions: 1 }))

    store.updateCampaignProgress("camp-update", { completedActions: 3, isComplete: true })

    const updated = useLoyaltyHistoryStore.getState().getCampaignProgress("camp-update")
    expect(updated?.completedActions).toBe(3)
    expect(updated?.isComplete).toBe(true)
  })

  it("counts completed campaigns", () => {
    const store = useLoyaltyHistoryStore.getState()
    store.addCampaign(makeMockProgress({ campaignId: "c1", isComplete: true }))
    store.addCampaign(makeMockProgress({ campaignId: "c2", isComplete: false }))
    store.addCampaign(makeMockProgress({ campaignId: "c3", isComplete: true }))

    expect(useLoyaltyHistoryStore.getState().getCompletedCampaignCount()).toBe(2)
  })

  it("clears all history", () => {
    const store = useLoyaltyHistoryStore.getState()
    store.addAction(makeMockAction())
    store.addCampaign(makeMockProgress())

    expect(useLoyaltyHistoryStore.getState().actions).toHaveLength(1)
    expect(useLoyaltyHistoryStore.getState().joinedCampaigns).toHaveLength(1)

    useLoyaltyHistoryStore.getState().clearHistory()
    expect(useLoyaltyHistoryStore.getState().actions).toEqual([])
    expect(useLoyaltyHistoryStore.getState().joinedCampaigns).toEqual([])
  })
})
