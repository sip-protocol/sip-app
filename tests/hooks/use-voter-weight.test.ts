import { describe, it, expect, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useVoterWeight } from "@/hooks/use-voter-weight"

// Mock RealmsReader
vi.mock("@/lib/governance/realms-reader", () => {
  class MockRealmsReader {
    async getVoterWeight(daoId: string) {
      const weights: Record<string, string> = {
        marinade: "15000",
        jupiter: "8500",
      }
      return weights[daoId] ?? "1000"
    }
  }
  return { RealmsReader: MockRealmsReader }
})

describe("useVoterWeight", () => {
  it("returns null when no daoId provided", () => {
    const { result } = renderHook(() => useVoterWeight(null))
    expect(result.current.weight).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it("loads weight for known DAO", async () => {
    const { result } = renderHook(() => useVoterWeight("marinade"))

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.weight).toBe("15000")
  })

  it("loads default weight for unknown DAO", async () => {
    const { result } = renderHook(() => useVoterWeight("unknown"))

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.weight).toBe("1000")
  })
})
