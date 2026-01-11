import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useScanPayments } from "@/hooks/use-scan-payments"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    connected: true,
  }),
}))

// Mock stealth keys hook
vi.mock("@/hooks/use-stealth-keys", () => ({
  useStealthKeys: () => ({
    keys: {
      metaAddress: "sip:solana:mock:keys",
      spendingPublicKey: "mock-spending",
      viewingPublicKey: "mock-viewing",
      createdAt: Date.now(),
    },
  }),
}))

describe("useScanPayments", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useScanPayments())
    expect(result.current.payments).toEqual([])
    expect(result.current.isScanning).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.progress).toBe(0)
  })

  it("sets isScanning to true during scan", async () => {
    const { result } = renderHook(() => useScanPayments())

    act(() => {
      result.current.scan()
    })

    expect(result.current.isScanning).toBe(true)
  })

  it("updates progress during scan", async () => {
    const { result } = renderHook(() => useScanPayments())

    await act(async () => {
      const scanPromise = result.current.scan()
      vi.advanceTimersByTime(200)
      await Promise.resolve()
      expect(result.current.progress).toBeGreaterThan(0)
      vi.advanceTimersByTime(2000)
      await scanPromise
    })

    expect(result.current.progress).toBe(100)
  })

  it("detects mock payments after scan", async () => {
    const { result } = renderHook(() => useScanPayments())

    await act(async () => {
      const scanPromise = result.current.scan()
      vi.advanceTimersByTime(3000)
      await scanPromise
    })

    expect(result.current.payments.length).toBeGreaterThan(0)
    expect(result.current.payments[0]).toHaveProperty("id")
    expect(result.current.payments[0]).toHaveProperty("amount")
    expect(result.current.payments[0]).toHaveProperty("token")
  })

  it("claims payment successfully", async () => {
    const { result } = renderHook(() => useScanPayments())

    // First scan
    await act(async () => {
      const scanPromise = result.current.scan()
      vi.advanceTimersByTime(3000)
      await scanPromise
    })

    const paymentId = result.current.payments[0].id

    // Then claim
    await act(async () => {
      const claimPromise = result.current.claim(paymentId)
      vi.advanceTimersByTime(2000)
      await claimPromise
    })

    expect(result.current.payments[0].claimed).toBe(true)
  })
})
