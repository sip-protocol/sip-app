import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useCampaigns } from "@/hooks/use-campaigns"

vi.mock("@/lib/loyalty/torque-reader", () => {
  class MockTorqueReader {
    async getCampaigns() {
      return [
        { id: "c1", name: "Campaign 1", status: "active", rewardAmount: 0.5, rewardToken: "SOL" },
        { id: "c2", name: "Campaign 2", status: "active", rewardAmount: 0.3, rewardToken: "SOL" },
        { id: "c3", name: "Campaign 3", status: "completed", rewardAmount: 0.4, rewardToken: "SOL" },
      ]
    }
    async getTier() {
      return "bronze"
    }
  }
  return { TorqueReader: MockTorqueReader }
})

describe("useCampaigns", () => {
  it("loads campaigns on mount", async () => {
    const { result } = renderHook(() => useCampaigns())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.campaigns).toHaveLength(3)
  })

  it("returns tier from reader", async () => {
    const { result } = renderHook(() => useCampaigns())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tier).toBe("bronze")
  })

  it("starts with all filter", () => {
    const { result } = renderHook(() => useCampaigns())
    expect(result.current.filter).toBe("all")
  })

  it("filters active campaigns", async () => {
    const { result } = renderHook(() => useCampaigns())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    result.current.setFilter("active")

    await waitFor(() => {
      expect(result.current.campaigns).toHaveLength(2)
      expect(result.current.campaigns.every((c) => c.status === "active")).toBe(true)
    })
  })

  it("filters completed campaigns", async () => {
    const { result } = renderHook(() => useCampaigns())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    result.current.setFilter("completed")

    await waitFor(() => {
      expect(result.current.campaigns).toHaveLength(1)
    })
  })
})
