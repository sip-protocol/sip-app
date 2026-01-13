import { describe, it, expect } from "vitest"
import {
  riskColors,
  nodeColors,
  categoryColors,
  createScoreColorScale,
  createHeatmapColorScale,
  getRiskColor,
  getScoreColor,
} from "@/components/privacy-dashboard/utils/colorScales"

describe("Color Scale Constants", () => {
  describe("riskColors", () => {
    it("has all risk levels defined", () => {
      expect(riskColors.critical).toBeDefined()
      expect(riskColors.high).toBeDefined()
      expect(riskColors.medium).toBeDefined()
      expect(riskColors.low).toBeDefined()
    })

    it("has valid hex color values", () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/
      expect(riskColors.critical).toMatch(hexRegex)
      expect(riskColors.high).toMatch(hexRegex)
      expect(riskColors.medium).toMatch(hexRegex)
      expect(riskColors.low).toMatch(hexRegex)
    })

    it("has correct color assignments", () => {
      expect(riskColors.critical).toBe("#ef4444") // red-500
      expect(riskColors.high).toBe("#f97316") // orange-500
      expect(riskColors.medium).toBe("#eab308") // yellow-500
      expect(riskColors.low).toBe("#22c55e") // green-500
    })
  })

  describe("nodeColors", () => {
    it("has all node types defined", () => {
      expect(nodeColors.self).toBeDefined()
      expect(nodeColors.exchange).toBeDefined()
      expect(nodeColors.known).toBeDefined()
      expect(nodeColors.unknown).toBeDefined()
    })

    it("has valid hex color values", () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/
      expect(nodeColors.self).toMatch(hexRegex)
      expect(nodeColors.exchange).toMatch(hexRegex)
      expect(nodeColors.known).toMatch(hexRegex)
      expect(nodeColors.unknown).toMatch(hexRegex)
    })

    it("has correct color assignments", () => {
      expect(nodeColors.self).toBe("#a855f7") // purple-500 (SIP brand)
      expect(nodeColors.exchange).toBe("#ef4444") // red-500
      expect(nodeColors.known).toBe("#3b82f6") // blue-500
      expect(nodeColors.unknown).toBe("#6b7280") // gray-500
    })
  })

  describe("categoryColors", () => {
    it("has all categories defined", () => {
      expect(categoryColors.addressReuse).toBeDefined()
      expect(categoryColors.clusterExposure).toBeDefined()
      expect(categoryColors.exchangeExposure).toBeDefined()
      expect(categoryColors.temporalPatterns).toBeDefined()
      expect(categoryColors.socialLinks).toBeDefined()
    })

    it("has valid hex color values", () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/
      Object.values(categoryColors).forEach((color) => {
        expect(color).toMatch(hexRegex)
      })
    })
  })
})

describe("Color Scale Functions", () => {
  describe("createScoreColorScale", () => {
    it("returns a function", () => {
      const scale = createScoreColorScale()
      expect(typeof scale).toBe("function")
    })

    it("returns red-ish color for low scores", () => {
      const scale = createScoreColorScale()
      const color = scale(0)
      // Should be close to red (D3 returns RGB format)
      expect(color).toBe("rgb(239, 68, 68)")
    })

    it("returns green-ish color for high scores", () => {
      const scale = createScoreColorScale()
      const color = scale(100)
      // Should be close to green (D3 returns RGB format)
      expect(color).toBe("rgb(34, 197, 94)")
    })

    it("clamps values outside 0-100 range", () => {
      const scale = createScoreColorScale()
      const negativeColor = scale(-10)
      const overColor = scale(150)

      // Should clamp to extremes (D3 returns RGB format)
      expect(negativeColor).toBe("rgb(239, 68, 68)")
      expect(overColor).toBe("rgb(34, 197, 94)")
    })

    it("returns intermediate colors for mid-range scores", () => {
      const scale = createScoreColorScale()
      const color50 = scale(50)

      // Should be somewhere in between (yellow-ish, D3 returns RGB format)
      expect(color50).not.toBe("rgb(239, 68, 68)")
      expect(color50).not.toBe("rgb(34, 197, 94)")
    })
  })

  describe("createHeatmapColorScale", () => {
    it("returns a function", () => {
      const scale = createHeatmapColorScale(100)
      expect(typeof scale).toBe("function")
    })

    it("works with different max values", () => {
      const scale25 = createHeatmapColorScale(25)
      const scale100 = createHeatmapColorScale(100)

      // Both should return colors
      expect(scale25(12)).toBeDefined()
      expect(scale100(50)).toBeDefined()
    })

    it("returns different colors for different values", () => {
      const scale = createHeatmapColorScale(100)
      const low = scale(10)
      const high = scale(90)

      expect(low).not.toBe(high)
    })
  })

  describe("getRiskColor", () => {
    it("returns correct color for critical", () => {
      expect(getRiskColor("critical")).toBe("#ef4444")
    })

    it("returns correct color for high", () => {
      expect(getRiskColor("high")).toBe("#f97316")
    })

    it("returns correct color for medium", () => {
      expect(getRiskColor("medium")).toBe("#eab308")
    })

    it("returns correct color for low", () => {
      expect(getRiskColor("low")).toBe("#22c55e")
    })
  })

  describe("getScoreColor", () => {
    it("returns red for score 0", () => {
      const color = getScoreColor(0)
      // D3 returns RGB format
      expect(color).toBe("rgb(239, 68, 68)")
    })

    it("returns green for score 100", () => {
      const color = getScoreColor(100)
      // D3 returns RGB format
      expect(color).toBe("rgb(34, 197, 94)")
    })

    it("returns consistent colors for same score", () => {
      const color1 = getScoreColor(50)
      const color2 = getScoreColor(50)
      expect(color1).toBe(color2)
    })

    it("returns different colors for different scores", () => {
      const color30 = getScoreColor(30)
      const color70 = getScoreColor(70)
      expect(color30).not.toBe(color70)
    })

    it("handles edge cases", () => {
      // Should not throw
      expect(() => getScoreColor(-10)).not.toThrow()
      expect(() => getScoreColor(150)).not.toThrow()
    })
  })
})
