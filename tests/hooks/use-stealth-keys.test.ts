import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useStealthKeys } from "@/hooks/use-stealth-keys"

// Stable publicKey reference to prevent infinite re-render in useEffect
const mockPublicKey = { toBase58: () => "MockPublicKey123" }

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: mockPublicKey,
    connected: true,
  }),
}))

// Mock SIP client — returns inline mock SDK to avoid loading real @sip-protocol/sdk
vi.mock("@/lib/sip-client", () => ({
  getSDK: async () => ({
    generateStealthMetaAddress: () => ({
      metaAddress: {
        spendingKey: "0x" + "aa".repeat(32),
        viewingKey: "0x" + "bb".repeat(32),
        chain: "solana",
      },
      spendingPrivateKey: "0x" + "cc".repeat(32),
      viewingPrivateKey: "0x" + "dd".repeat(32),
    }),
    encodeStealthMetaAddress: () => "sip:solana:" + "ab".repeat(32),
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

  it("generates stealth keys via SDK", async () => {
    const { result } = renderHook(() => useStealthKeys())

    await act(async () => {
      await result.current.generate()
    })

    expect(result.current.keys).not.toBeNull()
    expect(result.current.keys?.metaAddress).toMatch(/^sip:solana:/)
    expect(result.current.keys?.spendingPublicKey).toBeTruthy()
    expect(result.current.keys?.viewingPublicKey).toBeTruthy()
    expect(result.current.keys?.spendingPrivateKey).toBeTruthy()
    expect(result.current.keys?.viewingPrivateKey).toBeTruthy()
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
      spendingPrivateKey: "existing-spending-priv",
      viewingPrivateKey: "existing-viewing-priv",
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
