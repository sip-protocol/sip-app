import { describe, it, expect } from "vitest"
import { renderHook } from "@testing-library/react"
import { useBridgeRoutes } from "@/hooks/use-bridge-routes"

describe("useBridgeRoutes", () => {
  it("returns empty state for null source", () => {
    const { result } = renderHook(() => useBridgeRoutes(null, null))

    expect(result.current.availableDestChains).toEqual([])
    expect(result.current.availableTokens).toEqual([])
    expect(result.current.route).toBeUndefined()
    expect(result.current.estimatedTime).toBeNull()
  })

  it("returns available destinations for solana", () => {
    const { result } = renderHook(() => useBridgeRoutes("solana", null))

    expect(result.current.availableDestChains).toContain("ethereum")
    expect(result.current.availableDestChains).toContain("base")
    expect(result.current.availableDestChains).not.toContain("solana")
  })

  it("returns route info for valid pair", () => {
    const { result } = renderHook(() => useBridgeRoutes("solana", "ethereum"))

    expect(result.current.route).toBeDefined()
    expect(result.current.availableTokens).toContain("USDC")
    expect(result.current.estimatedTime).toBe(15)
  })

  it("returns chain info", () => {
    const { result } = renderHook(() => useBridgeRoutes("solana", "ethereum"))

    expect(result.current.sourceChainInfo?.name).toBe("Solana")
    expect(result.current.destChainInfo?.name).toBe("Ethereum")
  })

  it("returns ETH token for EVM-to-EVM routes", () => {
    const { result } = renderHook(() =>
      useBridgeRoutes("ethereum", "base"),
    )

    expect(result.current.availableTokens).toContain("ETH")
    expect(result.current.availableTokens).toContain("USDC")
  })
})
