import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ComplianceStats } from "@/components/enterprise/compliance-stats"

describe("ComplianceStats", () => {
  it("renders all labels when stats are zero", () => {
    render(
      <ComplianceStats payments={0} swaps={0} votes={0} viewingKeys={0} />
    )
    expect(screen.getByText("Payments")).toBeInTheDocument()
    expect(screen.getByText("Swaps")).toBeInTheDocument()
    expect(screen.getByText("Votes")).toBeInTheDocument()
    expect(screen.getByText("Viewing Keys")).toBeInTheDocument()
  })

  it("renders correct counts for each stat", () => {
    render(
      <ComplianceStats payments={42} swaps={18} votes={7} viewingKeys={3} />
    )
    expect(screen.getByText("42")).toBeInTheDocument()
    expect(screen.getByText("18")).toBeInTheDocument()
    expect(screen.getByText("7")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })
})
