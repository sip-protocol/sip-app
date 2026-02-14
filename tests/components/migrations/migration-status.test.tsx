import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MigrationStatus } from "@/components/migrations/migration-status"

describe("MigrationStatus", () => {
  it("renders scanning step as active", () => {
    render(<MigrationStatus currentStep="scanning_wallet" />)
    expect(screen.getByText("Migration in Progress")).toBeTruthy()
    expect(screen.getByText("Scan Wallet")).toBeTruthy()
  })

  it("renders generating stealth step", () => {
    render(<MigrationStatus currentStep="generating_stealth" />)
    expect(screen.getByText("Generate Stealth Address")).toBeTruthy()
  })

  it("renders complete state", () => {
    render(<MigrationStatus currentStep="complete" />)
    expect(screen.getByText("Green Migration Complete!")).toBeTruthy()
  })

  it("renders failed state with error", () => {
    render(
      <MigrationStatus currentStep="failed" error="Insufficient balance" />
    )
    expect(screen.getByText("Migration Failed")).toBeTruthy()
    expect(screen.getByText("Insufficient balance")).toBeTruthy()
  })

  it("renders failed state without error", () => {
    render(<MigrationStatus currentStep="failed" />)
    expect(screen.getByText("Migration Failed")).toBeTruthy()
  })

  it("shows all 5 steps", () => {
    render(<MigrationStatus currentStep="scanning_wallet" />)
    expect(screen.getByText("Scan Wallet")).toBeTruthy()
    expect(screen.getByText("Generate Stealth Address")).toBeTruthy()
    expect(screen.getByText("Withdraw from Source")).toBeTruthy()
    expect(screen.getByText("Deposit to Sunrise")).toBeTruthy()
    expect(screen.getByText("Complete")).toBeTruthy()
  })

  it("applies custom className", () => {
    const { container } = render(
      <MigrationStatus currentStep="scanning_wallet" className="custom-class" />
    )
    expect(container.firstChild).toHaveClass("custom-class")
  })
})
