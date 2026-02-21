import { describe, it, expect, beforeEach } from "vitest"
import { usePaymentHistoryStore } from "@/stores/payment-history"
import type { HistoryEntry } from "@/stores/payment-history"

function makeSentEntry(overrides?: Partial<HistoryEntry>): Parameters<ReturnType<typeof usePaymentHistoryStore.getState>["addSent"]>[0] {
  return {
    walletAddress: "wallet-A",
    recipient: "sip:solana:0xspend:0xview",
    amount: 10,
    token: "SOL",
    txSignature: `tx_${Math.random().toString(36).slice(2, 8)}`,
    stealthAddress: "stealth_addr_1",
    timestamp: Date.now(),
    ...overrides,
  }
}

function makeClaimedEntry(overrides?: Partial<HistoryEntry>): Parameters<ReturnType<typeof usePaymentHistoryStore.getState>["addClaimed"]>[0] {
  return {
    walletAddress: "wallet-A",
    transferRecordPda: "pda_abc123",
    amount: 5,
    token: "USDC",
    txSignature: `tx_${Math.random().toString(36).slice(2, 8)}`,
    stealthAddress: "stealth_addr_2",
    timestamp: Date.now(),
    ...overrides,
  }
}

describe("usePaymentHistoryStore", () => {
  beforeEach(() => {
    usePaymentHistoryStore.setState({ entries: [] })
  })

  it("adds a sent payment and retrieves it", () => {
    const params = makeSentEntry({ walletAddress: "wallet-A", amount: 42 })
    usePaymentHistoryStore.getState().addSent(params)

    const entries = usePaymentHistoryStore.getState().getAll("wallet-A")
    expect(entries).toHaveLength(1)
    expect(entries[0].type).toBe("sent")
    expect(entries[0].amount).toBe(42)
    expect(entries[0].recipient).toBe("sip:solana:0xspend:0xview")
    expect(entries[0].walletAddress).toBe("wallet-A")
  })

  it("adds a claimed payment and retrieves it", () => {
    const params = makeClaimedEntry({ walletAddress: "wallet-B", amount: 100 })
    usePaymentHistoryStore.getState().addClaimed(params)

    const entries = usePaymentHistoryStore.getState().getAll("wallet-B")
    expect(entries).toHaveLength(1)
    expect(entries[0].type).toBe("claimed")
    expect(entries[0].amount).toBe(100)
    expect(entries[0].transferRecordPda).toBe("pda_abc123")
    expect(entries[0].walletAddress).toBe("wallet-B")
  })

  it("returns payments for specific wallet only (multi-wallet isolation)", () => {
    const store = usePaymentHistoryStore.getState()
    store.addSent(makeSentEntry({ walletAddress: "wallet-A", amount: 10 }))
    store.addSent(makeSentEntry({ walletAddress: "wallet-B", amount: 20 }))
    store.addClaimed(makeClaimedEntry({ walletAddress: "wallet-A", amount: 30 }))

    const walletAEntries = usePaymentHistoryStore.getState().getAll("wallet-A")
    const walletBEntries = usePaymentHistoryStore.getState().getAll("wallet-B")

    expect(walletAEntries).toHaveLength(2)
    expect(walletBEntries).toHaveLength(1)
    expect(walletBEntries[0].amount).toBe(20)
  })

  it("limits to 100 entries per wallet (add 110, expect 100)", () => {
    const store = usePaymentHistoryStore.getState()

    for (let i = 0; i < 110; i++) {
      store.addSent(
        makeSentEntry({
          walletAddress: "wallet-A",
          amount: i,
          timestamp: 1000 + i,
        })
      )
    }

    const entries = usePaymentHistoryStore.getState().getAll("wallet-A")
    expect(entries).toHaveLength(100)
  })

  it("100-entry cap is per wallet, not global", () => {
    const store = usePaymentHistoryStore.getState()

    for (let i = 0; i < 110; i++) {
      store.addSent(
        makeSentEntry({
          walletAddress: "wallet-A",
          amount: i,
          timestamp: 1000 + i,
        })
      )
    }

    store.addSent(makeSentEntry({ walletAddress: "wallet-B", amount: 999 }))

    const walletB = usePaymentHistoryStore.getState().getAll("wallet-B")
    expect(walletB).toHaveLength(1)
    expect(walletB[0].amount).toBe(999)
  })

  it("getAll returns sorted by newest first", () => {
    const store = usePaymentHistoryStore.getState()
    store.addSent(makeSentEntry({ walletAddress: "wallet-A", timestamp: 1000, amount: 1 }))
    store.addSent(makeSentEntry({ walletAddress: "wallet-A", timestamp: 3000, amount: 3 }))
    store.addSent(makeSentEntry({ walletAddress: "wallet-A", timestamp: 2000, amount: 2 }))

    const entries = usePaymentHistoryStore.getState().getAll("wallet-A")
    expect(entries[0].timestamp).toBe(3000)
    expect(entries[1].timestamp).toBe(2000)
    expect(entries[2].timestamp).toBe(1000)
  })

  it("getSent returns only sent type", () => {
    const store = usePaymentHistoryStore.getState()
    store.addSent(makeSentEntry({ walletAddress: "wallet-A" }))
    store.addClaimed(makeClaimedEntry({ walletAddress: "wallet-A" }))

    const sent = usePaymentHistoryStore.getState().getSent("wallet-A")
    expect(sent).toHaveLength(1)
    expect(sent[0].type).toBe("sent")
  })

  it("getClaimed returns only claimed type", () => {
    const store = usePaymentHistoryStore.getState()
    store.addSent(makeSentEntry({ walletAddress: "wallet-A" }))
    store.addClaimed(makeClaimedEntry({ walletAddress: "wallet-A" }))

    const claimed = usePaymentHistoryStore.getState().getClaimed("wallet-A")
    expect(claimed).toHaveLength(1)
    expect(claimed[0].type).toBe("claimed")
  })

  it("clear removes all entries", () => {
    const store = usePaymentHistoryStore.getState()
    store.addSent(makeSentEntry({ walletAddress: "wallet-A" }))
    store.addClaimed(makeClaimedEntry({ walletAddress: "wallet-B" }))

    expect(usePaymentHistoryStore.getState().entries.length).toBeGreaterThan(0)

    usePaymentHistoryStore.getState().clear()
    expect(usePaymentHistoryStore.getState().entries).toEqual([])
    expect(usePaymentHistoryStore.getState().getAll("wallet-A")).toEqual([])
    expect(usePaymentHistoryStore.getState().getAll("wallet-B")).toEqual([])
  })

  it("generates unique IDs for each entry", () => {
    const store = usePaymentHistoryStore.getState()
    store.addSent(makeSentEntry({ walletAddress: "wallet-A" }))
    store.addSent(makeSentEntry({ walletAddress: "wallet-A" }))

    const entries = usePaymentHistoryStore.getState().getAll("wallet-A")
    expect(entries[0].id).not.toBe(entries[1].id)
  })
})
