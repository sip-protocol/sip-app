import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useStealthKeys } from "@/hooks/use-stealth-keys"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    connected: true,
  }),
}))

describe("useStealthKeys", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("initializes with null keys", () => {
    const { result } = renderHook(() => useStealthKeys())
    expect(result.current.keys).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("generates stealth keys", async () => {
    const { result } = renderHook(() => useStealthKeys())

    await act(async () => {
      await result.current.generate()
    })

    expect(result.current.keys).not.toBeNull()
    expect(result.current.keys?.metaAddress).toMatch(/^sip:solana:/)
    expect(result.current.keys?.spendingPublicKey).toBeTruthy()
    expect(result.current.keys?.viewingPublicKey).toBeTruthy()
  })

  it("clears keys when clear is called", async () => {
    const { result } = renderHook(() => useStealthKeys())

    await act(async () => {
      await result.current.generate()
    })

    expect(result.current.keys).not.toBeNull()

    act(() => {
      result.current.clear()
    })

    expect(result.current.keys).toBeNull()
  })

  it("confirms backup status", () => {
    const { result } = renderHook(() => useStealthKeys())

    expect(result.current.hasBackedUp).toBe(false)

    act(() => {
      result.current.confirmBackup()
    })

    expect(result.current.hasBackedUp).toBe(true)
  })

  it("loads existing keys from storage on mount", async () => {
    const existingKeys = {
      metaAddress: "sip:solana:existing:keys",
      spendingPublicKey: "existing-spending",
      viewingPublicKey: "existing-viewing",
      createdAt: Date.now(),
    }

    localStorage.setItem(
      "sip_stealth_keys_MockPublicKey123",
      JSON.stringify(existingKeys)
    )

    const { result } = renderHook(() => useStealthKeys())

    await waitFor(() => {
      expect(result.current.keys).not.toBeNull()
    })

    expect(result.current.keys?.metaAddress).toBe("sip:solana:existing:keys")
  })
})
