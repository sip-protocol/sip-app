import { describe, it, expect, vi } from "vitest"
import { estimatePriorityFee } from "@/lib/solana/priority-fees"

const mockConnection = {
  getRecentPrioritizationFees: vi.fn(),
}

describe("estimatePriorityFee", () => {
  it("returns p75 fee from recent samples", async () => {
    mockConnection.getRecentPrioritizationFees.mockResolvedValue([
      { prioritizationFee: 1000 },
      { prioritizationFee: 5000 },
      { prioritizationFee: 3000 },
      { prioritizationFee: 2000 },
      { prioritizationFee: 4000 },
    ])

    const fee = await estimatePriorityFee(mockConnection as never)
    expect(fee).toBe(50_000) // p75 of [1k,2k,3k,4k,5k]=4k, but min floor is 50k
  })

  it("returns minimum floor when no recent fees", async () => {
    mockConnection.getRecentPrioritizationFees.mockResolvedValue([])
    const fee = await estimatePriorityFee(mockConnection as never)
    expect(fee).toBe(50_000)
  })

  it("caps at maximum", async () => {
    mockConnection.getRecentPrioritizationFees.mockResolvedValue([
      { prioritizationFee: 10_000_000 },
    ])
    const fee = await estimatePriorityFee(mockConnection as never)
    expect(fee).toBeLessThanOrEqual(500_000)
  })

  it("falls back to default on RPC error", async () => {
    mockConnection.getRecentPrioritizationFees.mockRejectedValue(
      new Error("RPC error")
    )
    const fee = await estimatePriorityFee(mockConnection as never)
    expect(fee).toBe(50_000)
  })
})
