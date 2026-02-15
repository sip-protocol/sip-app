import { describe, it, expect, beforeEach } from "vitest"
import { useGamingHistoryStore } from "@/stores/gaming-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { GamingActionRecord, GameResult } from "@/lib/gaming/types"

function makeMockAction(overrides?: Partial<GamingActionRecord>): GamingActionRecord {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "play",
    gameId: "game-test",
    status: "resolved",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

function makeMockResult(overrides?: Partial<GameResult>): GameResult {
  return {
    gameId: `game_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    won: true,
    rewardTier: "bronze",
    commitmentHash: "0x1234...5678",
    revealedAt: Date.now(),
    ...overrides,
  }
}

describe("useGamingHistoryStore", () => {
  beforeEach(() => {
    useGamingHistoryStore.setState({ actions: [], results: [] })
  })

  it("has empty initial state", () => {
    const state = useGamingHistoryStore.getState()
    expect(state.actions).toEqual([])
    expect(state.results).toEqual([])
  })

  it("adds an action", () => {
    const action = makeMockAction({ id: "test-1" })
    useGamingHistoryStore.getState().addAction(action)

    const state = useGamingHistoryStore.getState()
    expect(state.actions).toHaveLength(1)
    expect(state.actions[0].id).toBe("test-1")
  })

  it("caps at MAX_GAMING_HISTORY (50)", () => {
    const store = useGamingHistoryStore.getState()

    for (let i = 0; i < 55; i++) {
      store.addAction(makeMockAction({ id: `a-${i}` }))
    }

    expect(useGamingHistoryStore.getState().actions).toHaveLength(50)
  })

  it("updates an action", () => {
    const action = makeMockAction({ id: "update-me", status: "committing_move" })
    useGamingHistoryStore.getState().addAction(action)

    useGamingHistoryStore.getState().updateAction("update-me", {
      status: "resolved",
      completedAt: Date.now(),
    })

    const updated = useGamingHistoryStore.getState().getAction("update-me")
    expect(updated?.status).toBe("resolved")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getActionsByType filters correctly", () => {
    const store = useGamingHistoryStore.getState()
    store.addAction(makeMockAction({ id: "a1", type: "play" }))
    store.addAction(makeMockAction({ id: "a2", type: "claim" }))
    store.addAction(makeMockAction({ id: "a3", type: "play" }))

    const plays = useGamingHistoryStore.getState().getActionsByType("play")
    expect(plays).toHaveLength(2)
    expect(plays.every((a) => a.type === "play")).toBe(true)
  })

  it("adds a result", () => {
    const result = makeMockResult({ gameId: "game-1" })
    useGamingHistoryStore.getState().addResult(result)

    const found = useGamingHistoryStore.getState().getResult("game-1")
    expect(found).toBeDefined()
    expect(found?.gameId).toBe("game-1")
  })

  it("counts wins correctly", () => {
    const store = useGamingHistoryStore.getState()
    store.addResult(makeMockResult({ gameId: "g1", won: true }))
    store.addResult(makeMockResult({ gameId: "g2", won: false }))
    store.addResult(makeMockResult({ gameId: "g3", won: true }))

    expect(useGamingHistoryStore.getState().getWinsCount()).toBe(2)
  })

  it("clears all history", () => {
    const store = useGamingHistoryStore.getState()
    store.addAction(makeMockAction())
    store.addResult(makeMockResult())

    expect(useGamingHistoryStore.getState().actions).toHaveLength(1)
    expect(useGamingHistoryStore.getState().results).toHaveLength(1)

    useGamingHistoryStore.getState().clearHistory()
    expect(useGamingHistoryStore.getState().actions).toEqual([])
    expect(useGamingHistoryStore.getState().results).toEqual([])
  })
})
