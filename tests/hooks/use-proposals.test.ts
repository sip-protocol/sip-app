import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useProposals } from "@/hooks/use-proposals"

// Mock RealmsReader
vi.mock("@/lib/governance/realms-reader", () => {
  class MockRealmsReader {
    async getProposals() {
      return [
        { id: "prop-1", daoId: "marinade", status: "voting", title: "Proposal 1" },
        { id: "prop-2", daoId: "jupiter", status: "reveal", title: "Proposal 2" },
        { id: "prop-3", daoId: "marinade", status: "completed", title: "Proposal 3" },
      ]
    }
    async getDAOs() {
      return [
        { id: "marinade", name: "Marinade Finance", token: "MNDE" },
        { id: "jupiter", name: "Jupiter", token: "JUP" },
      ]
    }
  }
  return { RealmsReader: MockRealmsReader }
})

describe("useProposals", () => {
  it("loads proposals on mount", async () => {
    const { result } = renderHook(() => useProposals())

    // Wait for async load
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.proposals).toHaveLength(3)
    expect(result.current.daos).toHaveLength(2)
  })

  it("filters by status", async () => {
    const { result } = renderHook(() => useProposals())

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => result.current.setFilter("voting"))
    expect(result.current.proposals).toHaveLength(1)
    expect(result.current.proposals[0].id).toBe("prop-1")
  })

  it("filters by DAO", async () => {
    const { result } = renderHook(() => useProposals())

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => result.current.setSelectedDao("marinade"))
    expect(result.current.proposals).toHaveLength(2)
  })

  it("filters by both status and DAO", async () => {
    const { result } = renderHook(() => useProposals())

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.setFilter("voting")
      result.current.setSelectedDao("marinade")
    })
    expect(result.current.proposals).toHaveLength(1)
    expect(result.current.proposals[0].id).toBe("prop-1")
  })

  it("shows all when filter is 'all'", async () => {
    const { result } = renderHook(() => useProposals())

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => result.current.setFilter("voting"))
    expect(result.current.proposals).toHaveLength(1)

    act(() => result.current.setFilter("all"))
    expect(result.current.proposals).toHaveLength(3)
  })
})
