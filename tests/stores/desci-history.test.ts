import { describe, it, expect, beforeEach } from "vitest"
import { useDeSciHistoryStore } from "@/stores/desci-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { DeSciActionRecord, Contribution } from "@/lib/desci/types"

function makeMockAction(
  overrides?: Partial<DeSciActionRecord>
): DeSciActionRecord {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "fund",
    projectId: "project-test",
    status: "funded",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

function makeMockContribution(overrides?: Partial<Contribution>): Contribution {
  return {
    projectId: `project_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    tier: "grant",
    commitmentHash: "0x1234...5678",
    contributedAt: Date.now(),
    ...overrides,
  }
}

describe("useDeSciHistoryStore", () => {
  beforeEach(() => {
    useDeSciHistoryStore.setState({ actions: [], contributions: [] })
  })

  it("has empty initial state", () => {
    const state = useDeSciHistoryStore.getState()
    expect(state.actions).toEqual([])
    expect(state.contributions).toEqual([])
  })

  it("adds an action", () => {
    const action = makeMockAction({ id: "test-1" })
    useDeSciHistoryStore.getState().addAction(action)

    const state = useDeSciHistoryStore.getState()
    expect(state.actions).toHaveLength(1)
    expect(state.actions[0].id).toBe("test-1")
  })

  it("caps at MAX_DESCI_HISTORY (50)", () => {
    const store = useDeSciHistoryStore.getState()

    for (let i = 0; i < 55; i++) {
      store.addAction(makeMockAction({ id: `a-${i}` }))
    }

    expect(useDeSciHistoryStore.getState().actions).toHaveLength(50)
  })

  it("updates an action", () => {
    const action = makeMockAction({
      id: "update-me",
      status: "selecting_project",
    })
    useDeSciHistoryStore.getState().addAction(action)

    useDeSciHistoryStore.getState().updateAction("update-me", {
      status: "funded",
      completedAt: Date.now(),
    })

    const updated = useDeSciHistoryStore.getState().getAction("update-me")
    expect(updated?.status).toBe("funded")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getActionsByType filters correctly", () => {
    const store = useDeSciHistoryStore.getState()
    store.addAction(makeMockAction({ id: "a1", type: "fund" }))
    store.addAction(makeMockAction({ id: "a2", type: "review" }))
    store.addAction(makeMockAction({ id: "a3", type: "fund" }))

    const funds = useDeSciHistoryStore.getState().getActionsByType("fund")
    expect(funds).toHaveLength(2)
    expect(funds.every((a) => a.type === "fund")).toBe(true)
  })

  it("adds a contribution", () => {
    const contribution = makeMockContribution({ projectId: "project-1" })
    useDeSciHistoryStore.getState().addContribution(contribution)

    const found = useDeSciHistoryStore.getState().getContribution("project-1")
    expect(found).toBeDefined()
    expect(found?.projectId).toBe("project-1")
  })

  it("counts projects correctly", () => {
    const store = useDeSciHistoryStore.getState()
    store.addContribution(makeMockContribution({ projectId: "p1" }))
    store.addContribution(makeMockContribution({ projectId: "p2" }))
    store.addContribution(makeMockContribution({ projectId: "p3" }))

    expect(useDeSciHistoryStore.getState().getProjectCount()).toBe(3)
  })

  it("clears all history", () => {
    const store = useDeSciHistoryStore.getState()
    store.addAction(makeMockAction())
    store.addContribution(makeMockContribution())

    expect(useDeSciHistoryStore.getState().actions).toHaveLength(1)
    expect(useDeSciHistoryStore.getState().contributions).toHaveLength(1)

    useDeSciHistoryStore.getState().clearHistory()
    expect(useDeSciHistoryStore.getState().actions).toEqual([])
    expect(useDeSciHistoryStore.getState().contributions).toEqual([])
  })
})
