import { describe, it, expect, beforeEach } from "vitest"
import { useMetaverseHistoryStore } from "@/stores/metaverse-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { MetaverseActionRecord, Visit } from "@/lib/metaverse/types"

function makeMockAction(
  overrides?: Partial<MetaverseActionRecord>
): MetaverseActionRecord {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "explore",
    worldId: "world-test",
    status: "entered",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

function makeMockVisit(overrides?: Partial<Visit>): Visit {
  return {
    worldId: `world_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    tier: "explorer",
    commitmentHash: "0x1234...5678",
    visitedAt: Date.now(),
    ...overrides,
  }
}

describe("useMetaverseHistoryStore", () => {
  beforeEach(() => {
    useMetaverseHistoryStore.setState({ actions: [], visits: [] })
  })

  it("has empty initial state", () => {
    const state = useMetaverseHistoryStore.getState()
    expect(state.actions).toEqual([])
    expect(state.visits).toEqual([])
  })

  it("adds an action", () => {
    const action = makeMockAction({ id: "test-1" })
    useMetaverseHistoryStore.getState().addAction(action)

    const state = useMetaverseHistoryStore.getState()
    expect(state.actions).toHaveLength(1)
    expect(state.actions[0].id).toBe("test-1")
  })

  it("caps at MAX_METAVERSE_HISTORY (50)", () => {
    const store = useMetaverseHistoryStore.getState()

    for (let i = 0; i < 55; i++) {
      store.addAction(makeMockAction({ id: `a-${i}` }))
    }

    expect(useMetaverseHistoryStore.getState().actions).toHaveLength(50)
  })

  it("updates an action", () => {
    const action = makeMockAction({
      id: "update-me",
      status: "selecting_world",
    })
    useMetaverseHistoryStore.getState().addAction(action)

    useMetaverseHistoryStore.getState().updateAction("update-me", {
      status: "entered",
      completedAt: Date.now(),
    })

    const updated = useMetaverseHistoryStore.getState().getAction("update-me")
    expect(updated?.status).toBe("entered")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getActionsByType filters correctly", () => {
    const store = useMetaverseHistoryStore.getState()
    store.addAction(makeMockAction({ id: "a1", type: "explore" }))
    store.addAction(makeMockAction({ id: "a2", type: "teleport" }))
    store.addAction(makeMockAction({ id: "a3", type: "explore" }))

    const explorations = useMetaverseHistoryStore
      .getState()
      .getActionsByType("explore")
    expect(explorations).toHaveLength(2)
    expect(explorations.every((a) => a.type === "explore")).toBe(true)
  })

  it("adds a visit", () => {
    const visit = makeMockVisit({ worldId: "world-1" })
    useMetaverseHistoryStore.getState().addVisit(visit)

    const found = useMetaverseHistoryStore.getState().getVisit("world-1")
    expect(found).toBeDefined()
    expect(found?.worldId).toBe("world-1")
  })

  it("counts worlds correctly", () => {
    const store = useMetaverseHistoryStore.getState()
    store.addVisit(makeMockVisit({ worldId: "w1" }))
    store.addVisit(makeMockVisit({ worldId: "w2" }))
    store.addVisit(makeMockVisit({ worldId: "w3" }))

    expect(useMetaverseHistoryStore.getState().getWorldCount()).toBe(3)
  })

  it("clears all history", () => {
    const store = useMetaverseHistoryStore.getState()
    store.addAction(makeMockAction())
    store.addVisit(makeMockVisit())

    expect(useMetaverseHistoryStore.getState().actions).toHaveLength(1)
    expect(useMetaverseHistoryStore.getState().visits).toHaveLength(1)

    useMetaverseHistoryStore.getState().clearHistory()
    expect(useMetaverseHistoryStore.getState().actions).toEqual([])
    expect(useMetaverseHistoryStore.getState().visits).toEqual([])
  })
})
