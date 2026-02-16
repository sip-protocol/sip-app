import { describe, it, expect, beforeEach } from "vitest"
import { useMusicHistoryStore } from "@/stores/music-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { MusicActionRecord, Stream } from "@/lib/music/types"

function makeMockAction(
  overrides?: Partial<MusicActionRecord>
): MusicActionRecord {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "stream",
    trackId: "track-test",
    status: "streamed",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

function makeMockStream(overrides?: Partial<Stream>): Stream {
  return {
    trackId: `track_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    tier: "free",
    commitmentHash: "0x1234...5678",
    streamedAt: Date.now(),
    ...overrides,
  }
}

describe("useMusicHistoryStore", () => {
  beforeEach(() => {
    useMusicHistoryStore.setState({ actions: [], streams: [] })
  })

  it("has empty initial state", () => {
    const state = useMusicHistoryStore.getState()
    expect(state.actions).toEqual([])
    expect(state.streams).toEqual([])
  })

  it("adds an action", () => {
    const action = makeMockAction({ id: "test-1" })
    useMusicHistoryStore.getState().addAction(action)

    const state = useMusicHistoryStore.getState()
    expect(state.actions).toHaveLength(1)
    expect(state.actions[0].id).toBe("test-1")
  })

  it("caps at MAX_MUSIC_HISTORY (50)", () => {
    const store = useMusicHistoryStore.getState()

    for (let i = 0; i < 55; i++) {
      store.addAction(makeMockAction({ id: `a-${i}` }))
    }

    expect(useMusicHistoryStore.getState().actions).toHaveLength(50)
  })

  it("updates an action", () => {
    const action = makeMockAction({
      id: "update-me",
      status: "selecting_track",
    })
    useMusicHistoryStore.getState().addAction(action)

    useMusicHistoryStore.getState().updateAction("update-me", {
      status: "streamed",
      completedAt: Date.now(),
    })

    const updated = useMusicHistoryStore.getState().getAction("update-me")
    expect(updated?.status).toBe("streamed")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getActionsByType filters correctly", () => {
    const store = useMusicHistoryStore.getState()
    store.addAction(makeMockAction({ id: "a1", type: "stream" }))
    store.addAction(makeMockAction({ id: "a2", type: "playlist" }))
    store.addAction(makeMockAction({ id: "a3", type: "stream" }))

    const streams = useMusicHistoryStore.getState().getActionsByType("stream")
    expect(streams).toHaveLength(2)
    expect(streams.every((a) => a.type === "stream")).toBe(true)
  })

  it("adds a stream", () => {
    const stream = makeMockStream({ trackId: "track-1" })
    useMusicHistoryStore.getState().addStream(stream)

    const found = useMusicHistoryStore.getState().getStream("track-1")
    expect(found).toBeDefined()
    expect(found?.trackId).toBe("track-1")
  })

  it("counts tracks correctly", () => {
    const store = useMusicHistoryStore.getState()
    store.addStream(makeMockStream({ trackId: "t1" }))
    store.addStream(makeMockStream({ trackId: "t2" }))
    store.addStream(makeMockStream({ trackId: "t3" }))

    expect(useMusicHistoryStore.getState().getTrackCount()).toBe(3)
  })

  it("clears all history", () => {
    const store = useMusicHistoryStore.getState()
    store.addAction(makeMockAction())
    store.addStream(makeMockStream())

    expect(useMusicHistoryStore.getState().actions).toHaveLength(1)
    expect(useMusicHistoryStore.getState().streams).toHaveLength(1)

    useMusicHistoryStore.getState().clearHistory()
    expect(useMusicHistoryStore.getState().actions).toEqual([])
    expect(useMusicHistoryStore.getState().streams).toEqual([])
  })
})
