import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ClaimButton } from "@/components/payments/claim-button"

describe("ClaimButton", () => {
  const mockOnClaim = vi.fn()

  beforeEach(() => {
    mockOnClaim.mockClear()
    mockOnClaim.mockResolvedValue(undefined)
  })

  it("renders claim button when not claimed", () => {
    render(
      <ClaimButton paymentId="pay_1" claimed={false} onClaim={mockOnClaim} />
    )
    expect(screen.getByRole("button", { name: /claim/i })).toBeInTheDocument()
  })

  it("renders claimed badge when claimed", () => {
    render(
      <ClaimButton paymentId="pay_1" claimed={true} onClaim={mockOnClaim} />
    )
    expect(screen.getByText(/Claimed/i)).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("calls onClaim when clicked", async () => {
    render(
      <ClaimButton paymentId="pay_1" claimed={false} onClaim={mockOnClaim} />
    )

    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(mockOnClaim).toHaveBeenCalledWith("pay_1")
    })
  })

  it("shows claiming state while processing", async () => {
    mockOnClaim.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(
      <ClaimButton paymentId="pay_1" claimed={false} onClaim={mockOnClaim} />
    )

    fireEvent.click(screen.getByRole("button"))

    expect(screen.getByText(/Claiming/i)).toBeInTheDocument()
  })

  it("disables button while claiming", async () => {
    mockOnClaim.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(
      <ClaimButton paymentId="pay_1" claimed={false} onClaim={mockOnClaim} />
    )

    fireEvent.click(screen.getByRole("button"))

    expect(screen.getByRole("button")).toBeDisabled()
  })
})
