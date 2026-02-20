import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useScanPayments } from "@/hooks/use-scan-payments"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    connected: true,
  }),
  useConnection: () => ({
    connection: {
      rpcEndpoint: "https://api.devnet.solana.com",
      getProgramAccounts: vi.fn().mockResolvedValue([]),
      getBalance: vi.fn().mockResolvedValue(100_000_000),
    },
  }),
}))

// Mock stealth keys hook
vi.mock("@/hooks/use-stealth-keys", () => ({
  useStealthKeys: () => ({
    keys: {
      metaAddress: "sip:solana:mock:keys",
      spendingPublicKey: "0x" + "aa".repeat(32),
      viewingPublicKey: "0x" + "bb".repeat(32),
      spendingPrivateKey: "0x" + "cc".repeat(32),
      viewingPrivateKey: "0x" + "dd".repeat(32),
      createdAt: Date.now(),
    },
  }),
}))

// Mock noble hashes
vi.mock("@noble/hashes/sha2.js", () => ({
  sha256: vi.fn().mockReturnValue(new Uint8Array(32).fill(0x42)),
}))

// Mock program client
vi.mock("@/lib/solana/program-client", () => ({
  SIP_PROGRAM_ID: {
    toBase58: () => "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at",
  },
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

    act(() => {
      result.current.scan()
    })

    expect(result.current.isScanning).toBe(true)
  })

  it("provides scan function", () => {
    const { result } = renderHook(() => useScanPayments())
    expect(typeof result.current.scan).toBe("function")
  })

  it("has progress property", () => {
    const { result } = renderHook(() => useScanPayments())
    expect(typeof result.current.progress).toBe("number")
    expect(result.current.progress).toBe(0)
  })
})
