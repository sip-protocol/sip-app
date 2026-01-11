import { describe, it, expect } from "vitest"
import { cn, formatCurrency, truncate } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes", () => {
    expect(cn("base", true && "active", false && "inactive")).toBe("base active")
  })

  it("deduplicates Tailwind classes", () => {
    expect(cn("px-4", "px-2")).toBe("px-2")
  })
})

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56")
  })

  it("formats other currencies", () => {
    expect(formatCurrency(1234.56, "EUR", "de-DE")).toContain("1.234,56")
  })
})

describe("truncate", () => {
  it("truncates long strings", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678"
    expect(truncate(address)).toBe("0x1234...5678")
  })

  it("preserves short strings", () => {
    expect(truncate("short")).toBe("short")
  })

  it("respects custom lengths", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678"
    expect(truncate(address, 10, 8)).toBe("0x12345678...12345678")
  })
})
