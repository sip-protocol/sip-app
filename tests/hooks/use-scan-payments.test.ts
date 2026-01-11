import { describe, it, expect, vi } from "vitest"
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
  it("initializes with empty state", () => {
    const { result } = renderHook(() => useScanPayments())
    expect(result.current.payments).toEqual([])
    expect(result.current.isScanning).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.progress).toBe(0)
  })

  it("sets isScanning to true when scan is called", async () => {
    const { result } = renderHook(() => useScanPayments())

    // Start scan but don't wait for it
    act(() => {
      result.current.scan()
    })

    // Should be scanning immediately after call
    expect(result.current.isScanning).toBe(true)
  })

  it("provides scan and claim functions", () => {
    const { result } = renderHook(() => useScanPayments())
    expect(typeof result.current.scan).toBe("function")
    expect(typeof result.current.claim).toBe("function")
  })

  it("has progress property", () => {
    const { result } = renderHook(() => useScanPayments())
    expect(typeof result.current.progress).toBe("number")
    expect(result.current.progress).toBe(0)
  })
})
