import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSendPayment } from "@/hooks/use-send-payment"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    signTransaction: vi.fn(),
  }),
}))

describe("useSendPayment", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useSendPayment())
    expect(result.current.status).toBe("idle")
    expect(result.current.txHash).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("sets pending status when sending", async () => {
    const { result } = renderHook(() => useSendPayment())

    act(() => {
      result.current.send({
        recipient: "sip:solana:abc:def",
        amount: "1.0",
        token: "SOL",
        privacyLevel: "shielded",
      })
    })

    expect(result.current.status).toBe("pending")
  })

  it("sets confirmed status after transaction", async () => {
    const { result } = renderHook(() => useSendPayment())

    await act(async () => {
      const promise = result.current.send({
        recipient: "sip:solana:abc:def",
        amount: "1.0",
        token: "SOL",
        privacyLevel: "shielded",
      })
      vi.advanceTimersByTime(2500)
      await promise
    })

    expect(result.current.status).toBe("confirmed")
    expect(result.current.txHash).toBeTruthy()
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useSendPayment())

    await act(async () => {
      const promise = result.current.send({
        recipient: "sip:solana:abc:def",
        amount: "1.0",
        token: "SOL",
        privacyLevel: "shielded",
      })
      vi.advanceTimersByTime(2500)
      await promise
    })

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.txHash).toBeNull()
  })
})
