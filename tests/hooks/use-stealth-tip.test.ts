import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useStealthTip } from "@/hooks/use-stealth-tip"

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

// Mock stealth transfer
vi.mock("@/lib/solana/stealth-transfer", () => ({
  createStealthTransfer: vi.fn().mockResolvedValue({
    stealthAddress: "StealthAddr123",
    ephemeralPublicKey: "EphemeralPub456",
    commitment: { commitmentHash: "0xcommit789" },
    metaAddress: "sip:solana:meta:addr",
    buildTransaction: vi.fn().mockResolvedValue({ mock: "transaction" }),
    getExplorerUrl: vi.fn().mockReturnValue("https://solscan.io/tx/mock?cluster=devnet"),
  }),
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

describe("useStealthTip", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      sendTransaction: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)
  })

  it("returns null tip initially", () => {
    const { result } = renderHook(() => useStealthTip())
    expect(result.current.lastTip).toBeNull()
    expect(result.current.tx.status).toBe("idle")
  })

  it("sendTip returns null when wallet not connected", async () => {
    const { result } = renderHook(() => useStealthTip())

    let tip: unknown = "not-null"
    await act(async () => {
      tip = await result.current.sendTip(0.01, "Test Artist")
    })

    expect(tip).toBeNull()
  })

  it("exposes sendTip and tx properties", () => {
    const { result } = renderHook(() => useStealthTip())
    expect(typeof result.current.sendTip).toBe("function")
    expect(result.current.tx).toBeDefined()
    expect(result.current.tx.status).toBe("idle")
  })
})
