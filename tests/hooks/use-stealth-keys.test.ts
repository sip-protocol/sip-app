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

// Mock bs58 — the hook converts hex keys to base58 via hexToBase58()
vi.mock("bs58", () => ({
  default: {
    encode: (bytes: Uint8Array) => "MockBase58Key" + bytes[0].toString(16),
    decode: (str: string) => new Uint8Array(32).fill(0xaa),
  },
}))

// Mock SIP client — returns inline mock SDK with hex keys (hook converts to base58)
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

    // Meta-address uses base58-encoded keys: sip:solana:<spending>:<viewing>
    expect(result.current.keys?.metaAddress).toBe(
      "sip:solana:MockBase58Keyaa:MockBase58Keybb"
    )
    expect(result.current.keys?.metaAddress).toMatch(/^sip:solana:/)

    // All key fields should be base58 strings, not hex
    expect(result.current.keys?.spendingPublicKey).toBe("MockBase58Keyaa")
    expect(result.current.keys?.viewingPublicKey).toBe("MockBase58Keybb")
    expect(result.current.keys?.spendingPrivateKey).toBe("MockBase58Keycc")
    expect(result.current.keys?.viewingPrivateKey).toBe("MockBase58Keydd")

    // Keys must NOT be hex-encoded
    expect(result.current.keys?.spendingPublicKey).not.toMatch(/^0x/)
    expect(result.current.keys?.viewingPublicKey).not.toMatch(/^0x/)
    expect(result.current.keys?.spendingPrivateKey).not.toMatch(/^0x/)
    expect(result.current.keys?.viewingPrivateKey).not.toMatch(/^0x/)
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
