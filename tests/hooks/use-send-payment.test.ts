import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSendPayment } from "@/hooks/use-send-payment"

const mockSendTransaction = vi.fn()
const mockTxReset = vi.fn()

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    signTransaction: vi.fn(),
  }),
  useConnection: () => ({
    connection: {
      rpcEndpoint: "https://api.devnet.solana.com",
    },
  }),
}))

// Mock useSolanaTransaction
vi.mock("@/hooks/use-solana-transaction", () => ({
  useSolanaTransaction: () => ({
    sendTransaction: mockSendTransaction,
    reset: mockTxReset,
    status: "idle",
    txSignature: null,
    error: null,
  }),
}))

// Mock createStealthTransfer
vi.mock("@/lib/solana/stealth-transfer", () => ({
  createStealthTransfer: vi.fn().mockResolvedValue({
    stealthAddress: "StealthAddr123",
    ephemeralPublicKey: "0xephem",
    commitment: { commitmentHash: "0xcommit" },
    viewingKeyHash: "0xviewhash",
    buildTransaction: vi.fn().mockResolvedValue({
      /* mock Transaction */
    }),
    getExplorerUrl: (sig: string) => `https://solscan.io/tx/${sig}`,
  }),
}))

describe("useSendPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendTransaction.mockResolvedValue("5xRealSig123abc")
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useSendPayment())
    expect(result.current.status).toBe("idle")
    expect(result.current.txHash).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("sends a real stealth transfer and returns tx signature", async () => {
    const { result } = renderHook(() => useSendPayment())

    await act(async () => {
      await result.current.send({
        recipient:
          "sip:solana:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E",
        amount: "0.01",
        token: "SOL",
        privacyLevel: "shielded",
      })
    })

    expect(result.current.status).toBe("confirmed")
    expect(result.current.txHash).toBe("5xRealSig123abc")
  })

  it("calls createStealthTransfer with parsed meta-address keys", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")
    const { result } = renderHook(() => useSendPayment())

    await act(async () => {
      await result.current.send({
        recipient:
          "sip:solana:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E",
        amount: "0.5",
        token: "SOL",
        privacyLevel: "shielded",
      })
    })

    expect(createStealthTransfer).toHaveBeenCalledWith({
      amountLamports: 500_000_000,
      recipientViewingPublicKey: "7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E",
      recipientSpendingPublicKey:
        "CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB",
    })
  })

  it("sets error on invalid meta-address", async () => {
    const { result } = renderHook(() => useSendPayment())

    await act(async () => {
      await result.current.send({
        recipient: "invalid-address",
        amount: "1.0",
        token: "SOL",
        privacyLevel: "shielded",
      })
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toContain("Invalid SIP meta-address")
  })

  it("sets error on invalid amount", async () => {
    const { result } = renderHook(() => useSendPayment())

    await act(async () => {
      await result.current.send({
        recipient:
          "sip:solana:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E",
        amount: "0",
        token: "SOL",
        privacyLevel: "shielded",
      })
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toContain("Invalid amount")
  })

  it("sets error when transaction is rejected", async () => {
    mockSendTransaction.mockResolvedValue(null)
    const { result } = renderHook(() => useSendPayment())

    await act(async () => {
      await result.current.send({
        recipient:
          "sip:solana:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E",
        amount: "1.0",
        token: "SOL",
        privacyLevel: "shielded",
      })
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toContain("rejected or failed")
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useSendPayment())

    await act(async () => {
      await result.current.send({
        recipient:
          "sip:solana:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E",
        amount: "1.0",
        token: "SOL",
        privacyLevel: "shielded",
      })
    })

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.txHash).toBeNull()
    expect(result.current.error).toBeNull()
    expect(mockTxReset).toHaveBeenCalled()
  })
})
