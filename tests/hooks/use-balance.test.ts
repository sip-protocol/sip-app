import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

// Control the wallet store per-test while preserving the rest of @/stores
const walletState = {
  isConnected: true,
  address: "5xytStealthAddrMock1111111111111111111111111",
  chain: "solana" as const,
}
vi.mock("@/stores", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/stores")>()
  return { ...actual, useWalletStore: () => walletState }
})

import { useBalance } from "@/hooks/use-balance"

function mockRpc(value: number) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ result: { value } }),
  } as unknown as Response)
}

describe("useBalance", () => {
  beforeEach(() => {
    walletState.isConnected = true
    walletState.address = "5xytStealthAddrMock1111111111111111111111111"
    walletState.chain = "solana"
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("fetches the native balance when the wallet is connected", async () => {
    vi.stubGlobal("fetch", mockRpc(1_000_000_000))

    const { result } = renderHook(() => useBalance())

    await waitFor(() => {
      expect(result.current.balance).toBe(BigInt(1_000_000_000))
    })
    expect(result.current.isLoading).toBe(false)
    expect(global.fetch).toHaveBeenCalled()
  })

  it("returns a null balance and does not fetch when disconnected", async () => {
    walletState.isConnected = false
    const fetchSpy = mockRpc(1_000_000_000)
    vi.stubGlobal("fetch", fetchSpy)

    const { result } = renderHook(() => useBalance())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.balance).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("re-fetches the balance when refresh() is called", async () => {
    const fetchSpy = mockRpc(2_000_000_000)
    vi.stubGlobal("fetch", fetchSpy)

    const { result } = renderHook(() => useBalance())
    await waitFor(() => expect(result.current.balance).toBe(BigInt(2_000_000_000)))

    const callsAfterMount = fetchSpy.mock.calls.length
    await act(async () => {
      await result.current.refresh()
    })

    await waitFor(() => {
      expect(fetchSpy.mock.calls.length).toBeGreaterThan(callsAfterMount)
    })
  })
})
