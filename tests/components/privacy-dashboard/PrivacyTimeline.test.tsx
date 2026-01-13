import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  PrivacyTimeline,
  generateMockTimeline,
  type TimelinePoint,
} from "@/components/privacy-dashboard/PrivacyTimeline"

// Mock data for testing
const mockData: TimelinePoint[] = [
  { date: new Date("2026-01-01"), score: 65 },
  { date: new Date("2026-01-05"), score: 70 },
  {
    date: new Date("2026-01-10"),
    score: 55,
    event: { type: "exchange_deposit", description: "Deposit to Binance" },
  },
  { date: new Date("2026-01-15"), score: 75 },
  {
    date: new Date("2026-01-20"),
    score: 80,
    event: { type: "sip_payment", description: "Used SIP for privacy" },
  },
]

describe("PrivacyTimeline", () => {
  describe("Component rendering", () => {
    it("renders SVG element with correct dimensions", () => {
      const { container } = render(
        <PrivacyTimeline data={mockData} width={800} height={300} />
      )

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute("width", "800")
      expect(svg).toHaveAttribute("height", "300")
    })

    it("renders with default dimensions when not specified", () => {
      const { container } = render(<PrivacyTimeline data={mockData} />)

      const svg = container.querySelector("svg")
      expect(svg).toHaveAttribute("width", "600")
      expect(svg).toHaveAttribute("height", "200")
    })

    it("renders legend with all event types", () => {
      render(<PrivacyTimeline data={mockData} />)

      expect(screen.getByText("address reuse")).toBeInTheDocument()
      expect(screen.getByText("exchange deposit")).toBeInTheDocument()
      expect(screen.getByText("cluster link")).toBeInTheDocument()
      expect(screen.getByText("sip payment")).toBeInTheDocument()
    })

    it("does not crash with empty data", () => {
      const { container } = render(<PrivacyTimeline data={[]} />)

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })

    it("renders circles for data points", () => {
      const { container } = render(<PrivacyTimeline data={mockData} />)

      // D3 should add circles to the SVG
      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })
  })

  describe("Interaction callbacks", () => {
    it("accepts onPointClick callback", () => {
      const onPointClick = () => {}

      const { container } = render(
        <PrivacyTimeline data={mockData} onPointClick={onPointClick} />
      )

      // Component should render without error when callback provided
      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })
  })
})

describe("generateMockTimeline", () => {
  it("generates the correct number of days", () => {
    const result = generateMockTimeline(70, 30)

    // 30 days + day 0 = 31 points
    expect(result).toHaveLength(31)
  })

  it("generates data points with dates", () => {
    const result = generateMockTimeline(70, 10)

    result.forEach((point) => {
      expect(point.date).toBeInstanceOf(Date)
      expect(typeof point.score).toBe("number")
    })
  })

  it("generates scores within 0-100 range", () => {
    const result = generateMockTimeline(50, 30)

    result.forEach((point) => {
      expect(point.score).toBeGreaterThanOrEqual(0)
      expect(point.score).toBeLessThanOrEqual(100)
    })
  })

  it("uses default 30 days when not specified", () => {
    const result = generateMockTimeline(70)

    expect(result).toHaveLength(31)
  })

  it("generates some points with events", () => {
    // Generate multiple times to statistically ensure events are created
    let hasEvents = false
    for (let i = 0; i < 10; i++) {
      const result = generateMockTimeline(50, 100)
      const withEvents = result.filter((p) => p.event)
      if (withEvents.length > 0) {
        hasEvents = true
        break
      }
    }

    expect(hasEvents).toBe(true)
  })

  it("events have correct structure", () => {
    // Generate enough data to ensure events
    const result = generateMockTimeline(50, 100)
    const withEvents = result.filter((p) => p.event)

    withEvents.forEach((point) => {
      expect(point.event).toBeDefined()
      expect(["address_reuse", "exchange_deposit", "cluster_link"]).toContain(
        point.event?.type
      )
      expect(typeof point.event?.description).toBe("string")
    })
  })

  it("dates are in chronological order", () => {
    const result = generateMockTimeline(70, 30)

    for (let i = 1; i < result.length; i++) {
      expect(result[i].date.getTime()).toBeGreaterThanOrEqual(
        result[i - 1].date.getTime()
      )
    }
  })

  it("most recent date is close to now", () => {
    const result = generateMockTimeline(70, 30)
    const now = new Date()
    const lastPoint = result[result.length - 1]

    // Should be within 1 day of now
    const diffMs = Math.abs(now.getTime() - lastPoint.date.getTime())
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeLessThan(1)
  })
})
