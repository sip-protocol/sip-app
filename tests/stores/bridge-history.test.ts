import { describe, it, expect, beforeEach } from "vitest"
import { useBridgeHistoryStore } from "@/stores/bridge-history"
import type { BridgeTransfer } from "@/lib/bridge/types"

function makeMockTransfer(overrides?: Partial<BridgeTransfer>): BridgeTransfer {
  return {
    id: `bridge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sourceChain: "solana",
    destChain: "ethereum",
    token: "USDC",
    amount: "100",
    stealthAddress: "sip:ethereum:0xstealth",
    stealthMetaAddress: "sip:ethereum:0xspend:0xview",
    privacyLevel: "shielded",
    status: "complete",
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

describe("useBridgeHistoryStore", () => {
  beforeEach(() => {
    useBridgeHistoryStore.setState({ transfers: [] })
  })

  it("has empty initial state", () => {
    const state = useBridgeHistoryStore.getState()
    expect(state.transfers).toEqual([])
  })

  it("adds a transfer", () => {
    const transfer = makeMockTransfer({ id: "test-1" })
    useBridgeHistoryStore.getState().addTransfer(transfer)

    const state = useBridgeHistoryStore.getState()
    expect(state.transfers).toHaveLength(1)
    expect(state.transfers[0].id).toBe("test-1")
  })

  it("prepends new transfers (newest first)", () => {
    const t1 = makeMockTransfer({ id: "first" })
    const t2 = makeMockTransfer({ id: "second" })

    const store = useBridgeHistoryStore.getState()
    store.addTransfer(t1)
    store.addTransfer(t2)

    const state = useBridgeHistoryStore.getState()
    expect(state.transfers[0].id).toBe("second")
    expect(state.transfers[1].id).toBe("first")
  })

  it("caps at MAX_BRIDGE_HISTORY (50)", () => {
    const store = useBridgeHistoryStore.getState()

    for (let i = 0; i < 55; i++) {
      store.addTransfer(makeMockTransfer({ id: `t-${i}` }))
    }

    expect(useBridgeHistoryStore.getState().transfers).toHaveLength(50)
  })

  it("updates a transfer", () => {
    const transfer = makeMockTransfer({ id: "update-me", status: "generating_stealth" })
    useBridgeHistoryStore.getState().addTransfer(transfer)

    useBridgeHistoryStore.getState().updateTransfer("update-me", {
      status: "complete",
      completedAt: Date.now(),
    })

    const updated = useBridgeHistoryStore.getState().getTransfer("update-me")
    expect(updated?.status).toBe("complete")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getTransfer returns undefined for missing id", () => {
    const result = useBridgeHistoryStore.getState().getTransfer("nonexistent")
    expect(result).toBeUndefined()
  })

  it("getTransfer returns correct transfer", () => {
    const t1 = makeMockTransfer({ id: "find-me", amount: "42" })
    const t2 = makeMockTransfer({ id: "not-me", amount: "99" })
    const store = useBridgeHistoryStore.getState()
    store.addTransfer(t1)
    store.addTransfer(t2)

    const found = useBridgeHistoryStore.getState().getTransfer("find-me")
    expect(found?.amount).toBe("42")
  })

  it("clears all history", () => {
    const store = useBridgeHistoryStore.getState()
    store.addTransfer(makeMockTransfer())
    store.addTransfer(makeMockTransfer())

    expect(useBridgeHistoryStore.getState().transfers).toHaveLength(2)

    useBridgeHistoryStore.getState().clearHistory()
    expect(useBridgeHistoryStore.getState().transfers).toEqual([])
  })
})
