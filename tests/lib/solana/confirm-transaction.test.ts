import { describe, it, expect, vi } from "vitest"
import { confirmTransactionWithRetry } from "@/lib/solana/confirm-transaction"

describe("confirmTransactionWithRetry", () => {
  it("resolves when transaction is confirmed", async () => {
    const mockConnection = {
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "abc123",
        lastValidBlockHeight: 100,
      }),
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
    }
    const result = await confirmTransactionWithRetry(
      mockConnection as never,
      "txSig123",
      { timeoutMs: 5000 }
    )
    expect(result.confirmed).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it("returns error when transaction fails on-chain", async () => {
    const mockConnection = {
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "abc123",
        lastValidBlockHeight: 100,
      }),
      confirmTransaction: vi.fn().mockResolvedValue({
        value: { err: { InstructionError: [0, "Custom(1)"] } },
      }),
    }
    const result = await confirmTransactionWithRetry(
      mockConnection as never,
      "txSig123",
      { timeoutMs: 5000 }
    )
    expect(result.confirmed).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("times out gracefully", async () => {
    const mockConnection = {
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "abc123",
        lastValidBlockHeight: 100,
      }),
      confirmTransaction: vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      ),
    }
    const result = await confirmTransactionWithRetry(
      mockConnection as never,
      "txSig123",
      { timeoutMs: 100 }
    )
    expect(result.confirmed).toBe(false)
    expect(result.error).toContain("timeout")
  })

  it("handles RPC error gracefully", async () => {
    const mockConnection = {
      getLatestBlockhash: vi.fn().mockRejectedValue(new Error("RPC unavailable")),
      confirmTransaction: vi.fn(),
    }
    const result = await confirmTransactionWithRetry(
      mockConnection as never,
      "txSig123"
    )
    expect(result.confirmed).toBe(false)
    expect(result.error).toBe("RPC unavailable")
  })
})
