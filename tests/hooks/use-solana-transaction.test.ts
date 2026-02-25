import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import { Transaction } from "@solana/web3.js"

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
    },
  }),
}))

const mockUseWallet = vi.mocked(useWallet)
const mockUseConnection = vi.mocked(useConnection)

describe("useSolanaTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset to disconnected state by default
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      sendTransaction: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)

    mockUseConnection.mockReturnValue({
      connection: {
        rpcEndpoint: "https://api.devnet.solana.com",
        confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
        getLatestBlockhash: vi.fn().mockResolvedValue({
          blockhash: "mock-blockhash",
          lastValidBlockHeight: 100,
        }),
      },
    } as unknown as ReturnType<typeof useConnection>)
  })

  it("returns idle status initially", () => {
    const { result } = renderHook(() => useSolanaTransaction())

    expect(result.current.status).toBe("idle")
    expect(result.current.txSignature).toBeNull()
    expect(result.current.explorerUrl).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("isWalletConnected is false when no wallet", () => {
    const { result } = renderHook(() => useSolanaTransaction())

    expect(result.current.isWalletConnected).toBe(false)
  })

  it("isWalletConnected is true when wallet connected", () => {
    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey123" },
      connected: true,
      sendTransaction: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)

    const { result } = renderHook(() => useSolanaTransaction())

    expect(result.current.isWalletConnected).toBe(true)
  })

  it("sendTransaction returns null and sets error when wallet not connected", async () => {
    const { result } = renderHook(() => useSolanaTransaction())
    const tx = new Transaction()

    let returnValue: string | null = null

    await act(async () => {
      returnValue = await result.current.sendTransaction(tx)
    })

    expect(returnValue).toBeNull()
    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("Wallet not connected")
  })

  it("explorerUrl is null when no signature", () => {
    const { result } = renderHook(() => useSolanaTransaction())

    expect(result.current.explorerUrl).toBeNull()
  })

  it("reset clears state back to idle", async () => {
    const { result } = renderHook(() => useSolanaTransaction())
    const tx = new Transaction()

    // Trigger an error state first
    await act(async () => {
      await result.current.sendTransaction(tx)
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).not.toBeNull()

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe("idle")
    expect(result.current.txSignature).toBeNull()
    expect(result.current.explorerUrl).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("sends transaction through full lifecycle on success", async () => {
    const mockSignature = "5xMockSignature123abc456def789ghi"
    const mockSendTx = vi.fn().mockResolvedValue(mockSignature)
    const mockConfirmTx = vi.fn().mockResolvedValue({ value: { err: null } })

    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey123" },
      connected: true,
      sendTransaction: mockSendTx,
    } as unknown as ReturnType<typeof useWallet>)

    mockUseConnection.mockReturnValue({
      connection: {
        rpcEndpoint: "https://api.devnet.solana.com",
        confirmTransaction: mockConfirmTx,
        getLatestBlockhash: vi.fn().mockResolvedValue({
          blockhash: "mock-blockhash",
          lastValidBlockHeight: 100,
        }),
      },
    } as unknown as ReturnType<typeof useConnection>)

    const { result } = renderHook(() => useSolanaTransaction())
    const tx = new Transaction()

    let returnValue: string | null = null

    await act(async () => {
      returnValue = await result.current.sendTransaction(tx)
    })

    expect(returnValue).toBe(mockSignature)
    expect(result.current.status).toBe("confirmed")
    expect(result.current.txSignature).toBe(mockSignature)
    expect(result.current.error).toBeNull()
    expect(mockSendTx).toHaveBeenCalledOnce()
    expect(mockConfirmTx).toHaveBeenCalledWith(
      {
        signature: mockSignature,
        blockhash: "mock-blockhash",
        lastValidBlockHeight: 100,
      },
      "confirmed"
    )
  })

  it("builds devnet explorer URL from signature", async () => {
    const mockSignature = "5xMockSignature123"
    const mockSendTx = vi.fn().mockResolvedValue(mockSignature)
    const mockConfirmTx = vi.fn().mockResolvedValue({ value: { err: null } })

    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey123" },
      connected: true,
      sendTransaction: mockSendTx,
    } as unknown as ReturnType<typeof useWallet>)

    mockUseConnection.mockReturnValue({
      connection: {
        rpcEndpoint: "https://api.devnet.solana.com",
        confirmTransaction: mockConfirmTx,
        getLatestBlockhash: vi.fn().mockResolvedValue({
          blockhash: "mock-blockhash",
          lastValidBlockHeight: 100,
        }),
      },
    } as unknown as ReturnType<typeof useConnection>)

    const { result } = renderHook(() => useSolanaTransaction())

    await act(async () => {
      await result.current.sendTransaction(new Transaction())
    })

    expect(result.current.explorerUrl).toBe(
      `https://solscan.io/tx/${mockSignature}?cluster=devnet`
    )
  })

  it("builds mainnet explorer URL without cluster param", async () => {
    const mockSignature = "5xMainnetSig"
    const mockSendTx = vi.fn().mockResolvedValue(mockSignature)
    const mockConfirmTx = vi.fn().mockResolvedValue({ value: { err: null } })

    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey123" },
      connected: true,
      sendTransaction: mockSendTx,
    } as unknown as ReturnType<typeof useWallet>)

    mockUseConnection.mockReturnValue({
      connection: {
        rpcEndpoint: "https://api.mainnet-beta.solana.com",
        confirmTransaction: mockConfirmTx,
        getLatestBlockhash: vi.fn().mockResolvedValue({
          blockhash: "mock-blockhash",
          lastValidBlockHeight: 100,
        }),
      },
    } as unknown as ReturnType<typeof useConnection>)

    const { result } = renderHook(() => useSolanaTransaction())

    await act(async () => {
      await result.current.sendTransaction(new Transaction())
    })

    expect(result.current.explorerUrl).toBe(
      `https://solscan.io/tx/${mockSignature}`
    )
  })

  it("handles wallet rejection error", async () => {
    const mockSendTx = vi
      .fn()
      .mockRejectedValue(new Error("User rejected the request"))

    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey123" },
      connected: true,
      sendTransaction: mockSendTx,
    } as unknown as ReturnType<typeof useWallet>)

    const { result } = renderHook(() => useSolanaTransaction())

    let returnValue: string | null = null

    await act(async () => {
      returnValue = await result.current.sendTransaction(new Transaction())
    })

    expect(returnValue).toBeNull()
    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("User rejected the request")
  })

  it("handles confirmation failure", async () => {
    const mockSignature = "5xFailedConfirmSig"
    const mockSendTx = vi.fn().mockResolvedValue(mockSignature)
    const mockConfirmTx = vi.fn().mockResolvedValue({
      value: { err: "TransactionError" },
    })

    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => "MockPubkey123" },
      connected: true,
      sendTransaction: mockSendTx,
    } as unknown as ReturnType<typeof useWallet>)

    mockUseConnection.mockReturnValue({
      connection: {
        rpcEndpoint: "https://api.devnet.solana.com",
        confirmTransaction: mockConfirmTx,
        getLatestBlockhash: vi.fn().mockResolvedValue({
          blockhash: "mock-blockhash",
          lastValidBlockHeight: 100,
        }),
      },
    } as unknown as ReturnType<typeof useConnection>)

    const { result } = renderHook(() => useSolanaTransaction())

    let returnValue: string | null = null

    await act(async () => {
      returnValue = await result.current.sendTransaction(new Transaction())
    })

    expect(returnValue).toBeNull()
    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("Transaction failed on-chain")
  })
})
