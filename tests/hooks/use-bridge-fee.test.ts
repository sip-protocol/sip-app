import { describe, it, expect } from "vitest"
import { renderHook } from "@testing-library/react"
import { useBridgeFee } from "@/hooks/use-bridge-fee"

describe("useBridgeFee", () => {
  it("returns null for empty amount", () => {
    const { result } = renderHook(() => useBridgeFee("", "USDC"))
    expect(result.current.fee).toBeNull()
  })

  it("returns null for null token", () => {
    const { result } = renderHook(() => useBridgeFee("100", null))
    expect(result.current.fee).toBeNull()
  })

  it("returns fee estimate for valid inputs", () => {
    const { result } = renderHook(() => useBridgeFee("1000", "USDC"))

    expect(result.current.fee).toBeTruthy()
    expect(result.current.fee?.token).toBe("USDC")
    expect(parseFloat(result.current.fee!.bridgeFee)).toBeCloseTo(3, 1)
    expect(parseFloat(result.current.fee!.totalFee)).toBeGreaterThan(0)
  })

  it("returns zero for zero amount", () => {
    const { result } = renderHook(() => useBridgeFee("0", "USDC"))
    expect(result.current.fee).toBeNull()
  })
})
