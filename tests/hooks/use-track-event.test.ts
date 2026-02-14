import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useTrackEvent } from "@/hooks/useTrackEvent"

describe("useTrackEvent", () => {
  const storageKey = "sip:privacy-events"

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("returns all track methods", () => {
    const { result } = renderHook(() => useTrackEvent())
    expect(result.current.track).toBeDefined()
    expect(result.current.trackBridge).toBeDefined()
    expect(result.current.trackVote).toBeDefined()
    expect(result.current.trackSocial).toBeDefined()
    expect(result.current.trackLoyalty).toBeDefined()
    expect(result.current.trackArt).toBeDefined()
    expect(result.current.trackChannel).toBeDefined()
  })

  it("stores events in localStorage", () => {
    const { result } = renderHook(() => useTrackEvent())

    act(() => {
      result.current.track({ action: "bridge", label: "Test bridge" })
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events).toHaveLength(1)
    expect(events[0].action).toBe("bridge")
    expect(events[0].label).toBe("Test bridge")
    expect(events[0].timestamp).toBeTypeOf("number")
  })

  it("trackBridge stores bridge event", () => {
    const { result } = renderHook(() => useTrackEvent())

    act(() => {
      result.current.trackBridge({ chain: "solana" })
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events[0].action).toBe("bridge")
    expect(events[0].label).toBe("Cross-chain bridge")
    expect(events[0].metadata).toEqual({ chain: "solana" })
  })

  it("trackVote stores vote event", () => {
    const { result } = renderHook(() => useTrackEvent())

    act(() => {
      result.current.trackVote({ dao: "sip-dao" })
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events[0].action).toBe("vote")
    expect(events[0].label).toBe("Private vote")
  })

  it("trackSocial stores social event", () => {
    const { result } = renderHook(() => useTrackEvent())

    act(() => {
      result.current.trackSocial()
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events[0].action).toBe("social_post")
    expect(events[0].label).toBe("Social action")
  })

  it("trackLoyalty stores loyalty event", () => {
    const { result } = renderHook(() => useTrackEvent())

    act(() => {
      result.current.trackLoyalty({ campaign: "privacy-pioneers" })
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events[0].action).toBe("loyalty_claim")
  })

  it("trackArt stores art event", () => {
    const { result } = renderHook(() => useTrackEvent())

    act(() => {
      result.current.trackArt({ style: "stealth-bloom" })
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events[0].action).toBe("art_mint")
  })

  it("trackChannel stores channel event", () => {
    const { result } = renderHook(() => useTrackEvent())

    act(() => {
      result.current.trackChannel()
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events[0].action).toBe("channel_subscribe")
  })

  it("accumulates multiple events", () => {
    const { result } = renderHook(() => useTrackEvent())

    act(() => {
      result.current.trackBridge()
      result.current.trackVote()
      result.current.trackSocial()
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events).toHaveLength(3)
    expect(events.map((e: { action: string }) => e.action)).toEqual([
      "bridge",
      "vote",
      "social_post",
    ])
  })

  it("caps events at 1000", () => {
    // Pre-fill with 999 events
    const existing = Array.from({ length: 999 }, (_, i) => ({
      action: "bridge",
      label: `Event ${i}`,
      timestamp: Date.now() - i,
    }))
    localStorage.setItem(storageKey, JSON.stringify(existing))

    const { result } = renderHook(() => useTrackEvent())

    act(() => {
      result.current.trackBridge()
      result.current.trackVote()
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events.length).toBeLessThanOrEqual(1000)
  })

  it("uses provided timestamp when given", () => {
    const { result } = renderHook(() => useTrackEvent())
    const fixedTime = 1700000000000

    act(() => {
      result.current.track({
        action: "bridge",
        timestamp: fixedTime,
      })
    })

    const events = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    expect(events[0].timestamp).toBe(fixedTime)
  })

  it("handles localStorage failure gracefully", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError")
    })

    const { result } = renderHook(() => useTrackEvent())

    // Should not throw
    expect(() => {
      act(() => {
        result.current.trackBridge()
      })
    }).not.toThrow()
  })
})
