import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import {
  RiskHeatmap,
  transformBreakdownToHeatmap,
} from "@/components/privacy-dashboard/RiskHeatmap"

// Mock data for testing
const mockData = [
  {
    category: "addressReuse",
    label: "Address Reuse",
    score: 20,
    maxScore: 25,
    description: "How often addresses are reused",
  },
  {
    category: "clusterExposure",
    label: "Cluster Exposure",
    score: 15,
    maxScore: 25,
    description: "Linked addresses detected",
  },
  {
    category: "exchangeExposure",
    label: "Exchange Exposure",
    score: 10,
    maxScore: 20,
    description: "CEX/DEX interactions",
  },
  {
    category: "temporalPatterns",
    label: "Temporal Patterns",
    score: 12,
    maxScore: 15,
    description: "Transaction timing patterns",
  },
  {
    category: "socialLinks",
    label: "Social Links",
    score: 8,
    maxScore: 15,
    description: "Identity connections",
  },
]

describe("RiskHeatmap", () => {
  describe("Component rendering", () => {
    it("renders SVG element with correct dimensions", () => {
      const { container } = render(
        <RiskHeatmap data={mockData} width={600} height={300} />
      )

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute("width", "600")
      expect(svg).toHaveAttribute("height", "300")
    })

    it("renders with default dimensions when not specified", () => {
      const { container } = render(<RiskHeatmap data={mockData} />)

      const svg = container.querySelector("svg")
      expect(svg).toHaveAttribute("width", "500")
      expect(svg).toHaveAttribute("height", "250")
    })

    it("renders category labels", async () => {
      const { container } = render(<RiskHeatmap data={mockData} />)

      await waitFor(() => {
        const labels = container.querySelectorAll(".category-label")
        expect(labels.length).toBe(mockData.length)
      })
    })

    it("renders score bars for each category", async () => {
      const { container } = render(<RiskHeatmap data={mockData} />)

      await waitFor(() => {
        const bars = container.querySelectorAll(".score-bar")
        expect(bars.length).toBe(mockData.length)
      })
    })

    it("does not crash with empty data", () => {
      const { container } = render(<RiskHeatmap data={[]} />)

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })

    it("renders score text for each category", async () => {
      const { container } = render(<RiskHeatmap data={mockData} />)

      // Wait for animation to complete
      await waitFor(
        () => {
          const scoreTexts = container.querySelectorAll(".score-text")
          expect(scoreTexts.length).toBe(mockData.length)
        },
        { timeout: 2000 }
      )
    })
  })

  describe("Interaction callbacks", () => {
    it("calls onCategoryClick when a bar is clicked", async () => {
      const onCategoryClick = vi.fn()

      const { container } = render(
        <RiskHeatmap data={mockData} onCategoryClick={onCategoryClick} />
      )

      await waitFor(() => {
        const bars = container.querySelectorAll(".score-bar")
        expect(bars.length).toBeGreaterThan(0)
      })

      const bars = container.querySelectorAll(".score-bar")
      if (bars.length > 0) {
        fireEvent.click(bars[0])
        expect(onCategoryClick).toHaveBeenCalledWith("addressReuse")
      }
    })
  })
})

describe("transformBreakdownToHeatmap", () => {
  const breakdown = {
    addressReuse: 20,
    clusterExposure: 15,
    exchangeExposure: 10,
    temporalPatterns: 12,
    socialLinks: 8,
  }

  it("transforms breakdown to correct number of categories", () => {
    const result = transformBreakdownToHeatmap(breakdown)

    expect(result).toHaveLength(5)
  })

  it("includes correct category structure", () => {
    const result = transformBreakdownToHeatmap(breakdown)

    result.forEach((item) => {
      expect(item).toHaveProperty("category")
      expect(item).toHaveProperty("label")
      expect(item).toHaveProperty("score")
      expect(item).toHaveProperty("maxScore")
      expect(item).toHaveProperty("description")
    })
  })

  it("maps addressReuse correctly", () => {
    const result = transformBreakdownToHeatmap(breakdown)
    const addressReuse = result.find((r) => r.category === "addressReuse")

    expect(addressReuse).toBeDefined()
    expect(addressReuse?.label).toBe("Address Reuse")
    expect(addressReuse?.score).toBe(20)
    expect(addressReuse?.maxScore).toBe(25)
    expect(addressReuse?.description).toBe("How often addresses are reused")
  })

  it("maps clusterExposure correctly", () => {
    const result = transformBreakdownToHeatmap(breakdown)
    const cluster = result.find((r) => r.category === "clusterExposure")

    expect(cluster?.label).toBe("Cluster Exposure")
    expect(cluster?.score).toBe(15)
    expect(cluster?.maxScore).toBe(25)
  })

  it("maps exchangeExposure correctly", () => {
    const result = transformBreakdownToHeatmap(breakdown)
    const exchange = result.find((r) => r.category === "exchangeExposure")

    expect(exchange?.label).toBe("Exchange Exposure")
    expect(exchange?.score).toBe(10)
    expect(exchange?.maxScore).toBe(20)
  })

  it("maps temporalPatterns correctly", () => {
    const result = transformBreakdownToHeatmap(breakdown)
    const temporal = result.find((r) => r.category === "temporalPatterns")

    expect(temporal?.label).toBe("Temporal Patterns")
    expect(temporal?.score).toBe(12)
    expect(temporal?.maxScore).toBe(15)
  })

  it("maps socialLinks correctly", () => {
    const result = transformBreakdownToHeatmap(breakdown)
    const social = result.find((r) => r.category === "socialLinks")

    expect(social?.label).toBe("Social Links")
    expect(social?.score).toBe(8)
    expect(social?.maxScore).toBe(15)
  })

  it("preserves exact scores from breakdown", () => {
    const customBreakdown = {
      addressReuse: 5,
      clusterExposure: 10,
      exchangeExposure: 15,
      temporalPatterns: 3,
      socialLinks: 7,
    }

    const result = transformBreakdownToHeatmap(customBreakdown)

    expect(result.find((r) => r.category === "addressReuse")?.score).toBe(5)
    expect(result.find((r) => r.category === "clusterExposure")?.score).toBe(10)
    expect(result.find((r) => r.category === "exchangeExposure")?.score).toBe(15)
    expect(result.find((r) => r.category === "temporalPatterns")?.score).toBe(3)
    expect(result.find((r) => r.category === "socialLinks")?.score).toBe(7)
  })

  it("handles zero scores", () => {
    const zeroBreakdown = {
      addressReuse: 0,
      clusterExposure: 0,
      exchangeExposure: 0,
      temporalPatterns: 0,
      socialLinks: 0,
    }

    const result = transformBreakdownToHeatmap(zeroBreakdown)

    result.forEach((item) => {
      expect(item.score).toBe(0)
    })
  })

  it("handles max scores", () => {
    const maxBreakdown = {
      addressReuse: 25,
      clusterExposure: 25,
      exchangeExposure: 20,
      temporalPatterns: 15,
      socialLinks: 15,
    }

    const result = transformBreakdownToHeatmap(maxBreakdown)

    result.forEach((item) => {
      expect(item.score).toBe(item.maxScore)
    })
  })
})
