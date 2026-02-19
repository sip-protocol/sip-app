import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useTicketCommitment } from "@/hooks/use-ticket-commitment"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    signTransaction: null,
    sendTransaction: null,
  }),
  useConnection: () => ({
    connection: {
      rpcEndpoint: "https://api.devnet.solana.com",
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "mock-blockhash",
        lastValidBlockHeight: 12345,
      }),
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
    },
  }),
}))

// Mock commitment store
vi.mock("@/lib/solana/commitment-store", () => ({
  createCommitmentStore: vi.fn().mockResolvedValue({
    commitmentHash: "0xmock_hash",
    salt: "mock_salt",
    buildTransaction: vi.fn().mockResolvedValue({}),
    getExplorerUrl: vi.fn().mockReturnValue("https://solscan.io/tx/mock"),
  }),
}))

// Mock Solana transaction hook
vi.mock("@/hooks/use-solana-transaction", () => ({
  useSolanaTransaction: () => ({
    status: "idle" as const,
    txSignature: null,
    error: null,
    sendTransaction: vi.fn().mockResolvedValue(null),
    reset: vi.fn(),
  }),
}))

describe("useTicketCommitment", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes with null lastCommitment", () => {
    const { result } = renderHook(() => useTicketCommitment())

    expect(result.current.lastCommitment).toBeNull()
    expect(result.current.tx).toBeDefined()
    expect(result.current.commitPurchase).toBeInstanceOf(Function)
  })

  it("returns null when wallet not connected", async () => {
    const { result } = renderHook(() => useTicketCommitment())

    let signature: string | null = null
    await act(async () => {
      signature = await result.current.commitPurchase("event-1", "vip")
    })

    expect(signature).toBeNull()
  })

  it("exposes tx state from useSolanaTransaction", () => {
    const { result } = renderHook(() => useTicketCommitment())

    expect(result.current.tx.status).toBe("idle")
    expect(result.current.tx.txSignature).toBeNull()
    expect(result.current.tx.error).toBeNull()
  })
})
