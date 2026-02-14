import { describe, it, expect, vi } from "vitest"
import { estimateBridgeFee } from "@/lib/bridge/stealth-bridge"

// Test the fee estimation (stealth generation requires real SDK, tested via integration)
describe("estimateBridgeFee", () => {
  it("calculates fee from amount and bps", () => {
    const result = estimateBridgeFee("1000", 30)

    expect(parseFloat(result.bridgeFee)).toBeCloseTo(3, 4)
    expect(parseFloat(result.gasFee)).toBeCloseTo(0.001, 4)
    expect(parseFloat(result.totalFee)).toBeCloseTo(3.001, 4)
  })

  it("returns zero for zero amount", () => {
    const result = estimateBridgeFee("0", 30)

    expect(result.bridgeFee).toBe("0")
    expect(result.gasFee).toBe("0")
    expect(result.totalFee).toBe("0")
  })

  it("returns zero for invalid amount", () => {
    const result = estimateBridgeFee("abc", 30)

    expect(result.bridgeFee).toBe("0")
    expect(result.gasFee).toBe("0")
    expect(result.totalFee).toBe("0")
  })

  it("returns zero for negative amount", () => {
    const result = estimateBridgeFee("-100", 30)

    expect(result.bridgeFee).toBe("0")
    expect(result.gasFee).toBe("0")
    expect(result.totalFee).toBe("0")
  })

  it("handles small amounts", () => {
    const result = estimateBridgeFee("0.01", 30)

    expect(parseFloat(result.bridgeFee)).toBeCloseTo(0.00003, 6)
    expect(parseFloat(result.totalFee)).toBeGreaterThan(0)
  })
})

describe("constants helpers", () => {
  it("getRoute returns route for valid pair", async () => {
    const { getRoute } = await import("@/lib/bridge/constants")
    const route = getRoute("solana", "ethereum")

    expect(route).toBeDefined()
    expect(route?.tokens).toContain("USDC")
  })

  it("getRoute returns undefined for invalid pair", async () => {
    const { getRoute } = await import("@/lib/bridge/constants")
    const route = getRoute("solana", "solana")

    expect(route).toBeUndefined()
  })

  it("getAvailableDestChains returns valid destinations", async () => {
    const { getAvailableDestChains } = await import("@/lib/bridge/constants")
    const dests = getAvailableDestChains("solana")

    expect(dests).toContain("ethereum")
    expect(dests).toContain("base")
    expect(dests).not.toContain("solana")
  })

  it("getTokensForRoute returns tokens for valid route", async () => {
    const { getTokensForRoute } = await import("@/lib/bridge/constants")
    const tokens = getTokensForRoute("ethereum", "base")

    expect(tokens).toContain("USDC")
    expect(tokens).toContain("ETH")
  })

  it("getTokensForRoute returns empty for invalid route", async () => {
    const { getTokensForRoute } = await import("@/lib/bridge/constants")
    const tokens = getTokensForRoute("solana", "solana")

    expect(tokens).toEqual([])
  })
})
