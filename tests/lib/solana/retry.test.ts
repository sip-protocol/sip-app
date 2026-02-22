import { describe, it, expect, vi } from "vitest"
import { withRetry } from "@/lib/solana/retry"

describe("withRetry", () => {
  it("returns on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok")
    const result = await withRetry(fn)
    expect(result).toBe("ok")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("retries on failure then succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("RPC timeout"))
      .mockResolvedValue("ok")
    const result = await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 })
    expect(result).toBe("ok")
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it("throws after max retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"))
    await expect(
      withRetry(fn, { maxRetries: 2, baseDelayMs: 10 })
    ).rejects.toThrow("always fails")
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it("does not retry non-retryable errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("User rejected"))
    await expect(
      withRetry(fn, { maxRetries: 3, baseDelayMs: 10 })
    ).rejects.toThrow("User rejected")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("applies exponential backoff", async () => {
    const delays: number[] = []
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValue("ok")

    await withRetry(fn, {
      maxRetries: 3,
      baseDelayMs: 100,
      onRetry: (_attempt, delay) => delays.push(delay),
    })

    expect(delays.length).toBe(2)
    expect(delays[1]).toBeGreaterThan(delays[0])
  })
})
