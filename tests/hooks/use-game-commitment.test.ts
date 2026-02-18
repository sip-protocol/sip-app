import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useGameCommitment } from "@/hooks/use-game-commitment"
import { createCommitmentStore, createRevealTransaction } from "@/lib/solana/commitment-store"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"

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
    getExplorerUrl: vi.fn().mockReturnValue("https://solscan.io/tx/mock?cluster=devnet"),
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
    sendTransaction: vi.fn().mockResolvedValue("mock-signature-abc"),
    reset: vi.fn(),
  }),
}))

const mockUseWallet = vi.mocked(useWallet)
const mockUseSolanaTransaction = vi.mocked(useSolanaTransaction)

describe("useGameCommitment", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      sendTransaction: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)

    mockUseSolanaTransaction.mockReturnValue({
      status: "idle",
      txSignature: null,
      explorerUrl: null,
      error: null,
      isWalletConnected: false,
      sendTransaction: vi.fn().mockResolvedValue("mock-signature-abc"),
      reset: vi.fn(),
    })
  })

  it("returns null lastCommitment initially", () => {
    const { result } = renderHook(() => useGameCommitment())
    expect(result.current.lastCommitment).toBeNull()
    expect(result.current.tx.status).toBe("idle")
  })

  it("commitMove returns null when wallet not connected", async () => {
    const { result } = renderHook(() => useGameCommitment())

    let signature: string | null = null
    await act(async () => {
      signature = await result.current.commitMove("game-1", "rock")
    })

    expect(signature).toBeNull()
    expect(createCommitmentStore).not.toHaveBeenCalled()
  })

  it("commitMove calls createCommitmentStore with correct data format", async () => {
    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey" },
      connected: true,
      sendTransaction: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)

    const { result } = renderHook(() => useGameCommitment())

    await act(async () => {
      await result.current.commitMove("game-stealth-showdown", "rock")
    })

    expect(createCommitmentStore).toHaveBeenCalledWith({
      data: "game-stealth-showdown:rock",
      commitmentType: "move",
    })
  })

  it("lastCommitment is set after successful commit", async () => {
    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey" },
      connected: true,
      sendTransaction: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)

    const { result } = renderHook(() => useGameCommitment())

    await act(async () => {
      await result.current.commitMove("game-1", "scissors")
    })

    expect(result.current.lastCommitment).toEqual({
      commitmentHash: "0xmockhash123",
      salt: "mocksalt456",
      explorerUrl: "https://solscan.io/tx/mock?cluster=devnet",
    })
  })

  it("revealMove returns null when no previous commitment", async () => {
    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey" },
      connected: true,
      sendTransaction: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)

    const { result } = renderHook(() => useGameCommitment())

    let signature: string | null = null
    await act(async () => {
      signature = await result.current.revealMove("game-1", "rock")
    })

    expect(signature).toBeNull()
    expect(createRevealTransaction).not.toHaveBeenCalled()
  })

  it("revealMove calls createRevealTransaction after successful commit", async () => {
    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey" },
      connected: true,
      sendTransaction: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)

    const { result } = renderHook(() => useGameCommitment())

    // First commit
    await act(async () => {
      await result.current.commitMove("game-1", "paper")
    })

    // Then reveal
    await act(async () => {
      await result.current.revealMove("game-1", "paper")
    })

    expect(createRevealTransaction).toHaveBeenCalledWith(
      "game-1:paper",
      "mocksalt456",
      "move",
      expect.anything(),
      "https://api.devnet.solana.com"
    )
  })
})
