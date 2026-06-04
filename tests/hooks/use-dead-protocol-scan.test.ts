import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

const walletState = {
  publicKey: { toBase58: () => "Addr123" } as { toBase58: () => string } | null,
}
const demoState = { isDemoMode: false }
const { scanWallet } = vi.hoisted(() => ({ scanWallet: vi.fn() }))

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({ publicKey: walletState.publicKey }),
}))
vi.mock("@/stores/demo-mode", () => ({
  useDemoModeStore: (selector: (s: typeof demoState) => unknown) =>
    selector(demoState),
}))
vi.mock("@/lib/migrations/dead-protocol-scanner", () => ({ scanWallet }))

import { useDeadProtocolScan } from "@/hooks/use-dead-protocol-scan"

const SCAN = { deadProtocols: [], totalValue: 0 }

describe("useDeadProtocolScan", () => {
  beforeEach(() => {
    walletState.publicKey = { toBase58: () => "Addr123" }
    demoState.isDemoMode = false
    scanWallet.mockReset()
    scanWallet.mockResolvedValue(SCAN)
  })

  it("auto-scans the connected wallet address", async () => {
    const { result } = renderHook(() => useDeadProtocolScan())

    await waitFor(() => expect(result.current.scanResult).toBe(SCAN))
    expect(scanWallet).toHaveBeenCalledWith("Addr123")
  })

  it("clears the scan result and does not scan when no wallet is connected", async () => {
    walletState.publicKey = null

    const { result } = renderHook(() => useDeadProtocolScan())

    await waitFor(() => expect(result.current.isScanning).toBe(false))
    expect(result.current.scanResult).toBeNull()
    expect(scanWallet).not.toHaveBeenCalled()
  })

  it("re-scans when rescan() is called for a connected wallet", async () => {
    const { result } = renderHook(() => useDeadProtocolScan())
    await waitFor(() => expect(result.current.scanResult).toBe(SCAN))

    const before = scanWallet.mock.calls.length
    await act(async () => {
      result.current.rescan()
    })

    await waitFor(() =>
      expect(scanWallet.mock.calls.length).toBeGreaterThan(before)
    )
  })
})
