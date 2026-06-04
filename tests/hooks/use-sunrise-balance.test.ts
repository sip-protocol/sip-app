import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

const walletState = { publicKey: { toBase58: () => "OwnerMock1111" } as unknown }
const demoState = { isDemoMode: false }
const { getParsedTokenAccountsByOwner } = vi.hoisted(() => ({
  getParsedTokenAccountsByOwner: vi.fn(),
}))

vi.mock("@solana/wallet-adapter-react", () => {
  // Stable connection reference across renders (matches real provider behavior)
  const connection = { getParsedTokenAccountsByOwner }
  return {
    useWallet: () => ({ publicKey: walletState.publicKey }),
    useConnection: () => ({ connection }),
  }
})

vi.mock("@/stores/demo-mode", () => ({
  useDemoModeStore: (selector: (s: typeof demoState) => unknown) =>
    selector(demoState),
}))

import { useSunriseBalance } from "@/hooks/use-sunrise-balance"

function tokenAccounts(uiAmount: number) {
  return {
    value: [
      { account: { data: { parsed: { info: { tokenAmount: { uiAmount } } } } } },
    ],
  }
}

describe("useSunriseBalance", () => {
  beforeEach(() => {
    walletState.publicKey = { toBase58: () => "OwnerMock1111" }
    demoState.isDemoMode = false
    getParsedTokenAccountsByOwner.mockReset()
  })

  it("fetches the on-chain gSOL balance for a connected wallet", async () => {
    getParsedTokenAccountsByOwner.mockResolvedValue(tokenAccounts(7.25))

    const { result } = renderHook(() => useSunriseBalance())

    await waitFor(() => expect(result.current.gsolBalance).toBe(7.25))
    expect(getParsedTokenAccountsByOwner).toHaveBeenCalled()
  })

  it("returns a mock balance in demo mode without querying the chain", async () => {
    demoState.isDemoMode = true
    walletState.publicKey = null

    const { result } = renderHook(() => useSunriseBalance())

    await waitFor(() => expect(result.current.gsolBalance).toBe(12.5))
    expect(getParsedTokenAccountsByOwner).not.toHaveBeenCalled()
  })

  it("returns null when no wallet is connected and not in demo mode", async () => {
    walletState.publicKey = null

    const { result } = renderHook(() => useSunriseBalance())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.gsolBalance).toBeNull()
    expect(getParsedTokenAccountsByOwner).not.toHaveBeenCalled()
  })

  it("re-queries the chain when refresh() is called", async () => {
    getParsedTokenAccountsByOwner.mockResolvedValue(tokenAccounts(1))

    const { result } = renderHook(() => useSunriseBalance())
    await waitFor(() => expect(result.current.gsolBalance).toBe(1))

    const before = getParsedTokenAccountsByOwner.mock.calls.length
    await act(async () => {
      result.current.refresh()
    })

    await waitFor(() =>
      expect(getParsedTokenAccountsByOwner.mock.calls.length).toBeGreaterThan(
        before
      )
    )
  })
})
