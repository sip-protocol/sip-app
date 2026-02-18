import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useGovernanceCommit } from "@/hooks/use-governance-commit"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: vi.fn().mockReturnValue({
    publicKey: null,
    connected: false,
    sendTransaction: vi.fn(),
  }),
  useConnection: vi.fn().mockReturnValue({
    connection: {
      rpcEndpoint: "https://api.devnet.solana.com",
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "mock-blockhash",
        lastValidBlockHeight: 100,
      }),
    },
  }),
}))

// Mock commitment store
vi.mock("@/lib/solana/commitment-store", () => ({
  createCommitmentStore: vi.fn().mockResolvedValue({
    commitmentHash: "0xmockhash123",
    salt: "mocksalt456",
    buildTransaction: vi.fn().mockResolvedValue({ mock: "transaction" }),
    getExplorerUrl: vi.fn().mockReturnValue("https://solscan.io/tx/mock"),
  }),
  createRevealTransaction: vi.fn().mockResolvedValue({ mock: "reveal-tx" }),
}))

// Mock useSolanaTransaction
vi.mock("@/hooks/use-solana-transaction", () => ({
  useSolanaTransaction: vi.fn().mockReturnValue({
    status: "idle",
    txSignature: null,
    explorerUrl: null,
    error: null,
    isWalletConnected: false,
    sendTransaction: vi.fn().mockResolvedValue(null),
    reset: vi.fn(),
  }),
}))

const mockUseWallet = vi.mocked(useWallet)

describe("useGovernanceCommit", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      sendTransaction: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)
  })

  it("returns null commitment initially", () => {
    const { result } = renderHook(() => useGovernanceCommit())
    expect(result.current.commitmentHash).toBeNull()
    expect(result.current.salt).toBeNull()
    expect(result.current.tx.status).toBe("idle")
  })

  it("commitVote returns null when wallet not connected", async () => {
    const { result } = renderHook(() => useGovernanceCommit())

    let signature: string | null = null
    await act(async () => {
      signature = await result.current.commitVote("prop-1", 0, "1000")
    })

    expect(signature).toBeNull()
  })

  it("revealVote returns null when wallet not connected", async () => {
    const { result } = renderHook(() => useGovernanceCommit())

    let signature: string | null = null
    await act(async () => {
      signature = await result.current.revealVote("prop-1", 0, "1000")
    })

    expect(signature).toBeNull()
  })
})
