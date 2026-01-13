import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ProtectionComparison } from "@/components/privacy-dashboard/ProtectionComparison"

// Mock improvements data
const mockImprovements = [
  {
    category: "addressReuse",
    currentScore: 15,
    projectedScore: 23,
    reason: "Stealth addresses prevent reuse",
  },
  {
    category: "clusterExposure",
    currentScore: 10,
    projectedScore: 22,
    reason: "Pedersen commitments hide links",
  },
  {
    category: "exchangeExposure",
    currentScore: 8,
    projectedScore: 18,
    reason: "Private withdrawals",
  },
  {
    category: "temporalPatterns",
    currentScore: 5,
    projectedScore: 12,
    reason: "Randomized timing",
  },
  {
    category: "socialLinks",
    currentScore: 7,
    projectedScore: 13,
    reason: "Anonymous transactions",
  },
]

describe("ProtectionComparison", () => {

  describe("Component rendering", () => {
    it("renders SVG element with correct dimensions", () => {
      const { container } = render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
          width={600}
          height={400}
        />
      )

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute("width", "600")
      expect(svg).toHaveAttribute("height", "400")
    })

    it("renders with default dimensions when not specified", () => {
      const { container } = render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      const svg = container.querySelector("svg")
      expect(svg).toHaveAttribute("width", "500")
      expect(svg).toHaveAttribute("height", "300")
    })

    it("receives currentScore prop", () => {
      const { container } = render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      // Component renders with score props
      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })

    it("receives projectedScore prop", () => {
      const { container } = render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      // Component renders with score props
      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })

    it("displays improvements list", () => {
      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      expect(screen.getByText("Address Reuse")).toBeInTheDocument()
      expect(screen.getByText("Cluster Exposure")).toBeInTheDocument()
      expect(screen.getByText("Exchange Exposure")).toBeInTheDocument()
      expect(screen.getByText("Temporal Patterns")).toBeInTheDocument()
      expect(screen.getByText("Social Links")).toBeInTheDocument()
    })

    it("shows current scores in improvements list", () => {
      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      expect(screen.getByText("15")).toBeInTheDocument()
      expect(screen.getByText("10")).toBeInTheDocument()
      expect(screen.getByText("8")).toBeInTheDocument()
    })

    it("renders Apply SIP Protection button initially", () => {
      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      expect(screen.getByText("Apply SIP Protection")).toBeInTheDocument()
    })
  })

  describe("Interaction callbacks", () => {
    it("calls onApplySIP when button is clicked", async () => {
      const onApplySIP = vi.fn()

      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
          onApplySIP={onApplySIP}
        />
      )

      const button = screen.getByText("Apply SIP Protection")
      fireEvent.click(button)

      expect(onApplySIP).toHaveBeenCalledTimes(1)
    })

    it("shows Reset and Try SIP Now buttons after applying", () => {
      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      const applyButton = screen.getByText("Apply SIP Protection")
      fireEvent.click(applyButton)

      // Buttons should appear immediately (state change is sync)
      expect(screen.getByText("Reset")).toBeInTheDocument()
      expect(screen.getByText(/Try SIP Now/)).toBeInTheDocument()
    })

    it("shows projected scores after applying", () => {
      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      const applyButton = screen.getByText("Apply SIP Protection")
      fireEvent.click(applyButton)

      // Projected scores should appear immediately in the improvements list
      expect(screen.getByText("23")).toBeInTheDocument()
      expect(screen.getByText("22")).toBeInTheDocument()
      expect(screen.getByText("18")).toBeInTheDocument()
    })

    it("changes state when applying protection", () => {
      const { container } = render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      const applyButton = screen.getByText("Apply SIP Protection")
      fireEvent.click(applyButton)

      // Component should re-render showing different state
      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
      expect(screen.getByText("Reset")).toBeInTheDocument()
    })

    it("resets to initial state when Reset is clicked", () => {
      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      // Apply
      fireEvent.click(screen.getByText("Apply SIP Protection"))
      expect(screen.getByText("Reset")).toBeInTheDocument()

      // Reset
      fireEvent.click(screen.getByText("Reset"))
      expect(screen.getByText("Apply SIP Protection")).toBeInTheDocument()
    })

    it("Try SIP Now link goes to /payments", () => {
      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      fireEvent.click(screen.getByText("Apply SIP Protection"))

      const link = screen.getByText(/Try SIP Now/).closest("a")
      expect(link).toHaveAttribute("href", "/payments")
    })
  })

  describe("Score display", () => {
    it("handles edge case scores", () => {
      const { container } = render(
        <ProtectionComparison
          currentScore={0}
          projectedScore={100}
          improvements={mockImprovements}
        />
      )

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })

    it("handles same current and projected scores", () => {
      const { container } = render(
        <ProtectionComparison
          currentScore={50}
          projectedScore={50}
          improvements={mockImprovements}
        />
      )

      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })

    it("handles empty improvements array", () => {
      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={[]}
        />
      )

      expect(screen.getByText("Apply SIP Protection")).toBeInTheDocument()
    })
  })

  describe("Category label mapping", () => {
    it("maps category IDs to human-readable labels", () => {
      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={mockImprovements}
        />
      )

      // Verify labels are mapped correctly
      expect(screen.getByText("Address Reuse")).toBeInTheDocument()
      expect(screen.getByText("Cluster Exposure")).toBeInTheDocument()
      expect(screen.getByText("Exchange Exposure")).toBeInTheDocument()
      expect(screen.getByText("Temporal Patterns")).toBeInTheDocument()
      expect(screen.getByText("Social Links")).toBeInTheDocument()
    })

    it("falls back to category ID for unknown categories", () => {
      const customImprovements = [
        {
          category: "unknownCategory",
          currentScore: 5,
          projectedScore: 10,
          reason: "Test",
        },
      ]

      render(
        <ProtectionComparison
          currentScore={45}
          projectedScore={88}
          improvements={customImprovements}
        />
      )

      expect(screen.getByText("unknownCategory")).toBeInTheDocument()
    })
  })
})
