import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { PaymentList } from "@/components/payments/payment-list"
import type { DetectedPayment } from "@/hooks/use-scan-payments"

describe("PaymentList", () => {
  const mockOnClaim = vi.fn()

  const mockPayments: DetectedPayment[] = [
    {
      id: "pay_1",
      txHash: "abc123...def",
      amount: 0.5,
      token: "SOL",
      stealthAddress: "stealth_1",
      timestamp: Date.now() - 3600000, // 1 hour ago
      claimed: false,
    },
    {
      id: "pay_2",
      txHash: "xyz789...ghi",
      amount: 25.0,
      token: "USDC",
      stealthAddress: "stealth_2",
      timestamp: Date.now() - 86400000, // 1 day ago
      claimed: true,
    },
  ]

  it("renders empty state when no payments", () => {
    render(<PaymentList payments={[]} onClaim={mockOnClaim} />)
    expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument()
  })

  it("renders payment list with amounts", () => {
    render(<PaymentList payments={mockPayments} onClaim={mockOnClaim} />)
    expect(screen.getByText(/0.5 SOL/i)).toBeInTheDocument()
    expect(screen.getByText(/25 USDC/i)).toBeInTheDocument()
  })

  it("displays relative timestamps", () => {
    render(<PaymentList payments={mockPayments} onClaim={mockOnClaim} />)
    expect(screen.getByText(/1 hour ago/i)).toBeInTheDocument()
    expect(screen.getByText(/1 day ago/i)).toBeInTheDocument()
  })

  it("shows claimed badge for claimed payments", () => {
    render(<PaymentList payments={mockPayments} onClaim={mockOnClaim} />)
    const claimedBadges = screen.getAllByText(/Claimed/i)
    expect(claimedBadges.length).toBeGreaterThan(0)
  })

  it("shows claim button for unclaimed payments", () => {
    render(<PaymentList payments={mockPayments} onClaim={mockOnClaim} />)
    expect(screen.getByRole("button", { name: /claim/i })).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(
      <PaymentList
        payments={mockPayments}
        onClaim={mockOnClaim}
        className="custom-class"
      />
    )
    expect(container.firstChild).toHaveClass("custom-class")
  })
})
