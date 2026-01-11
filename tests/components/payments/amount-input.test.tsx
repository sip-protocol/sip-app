import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AmountInput } from "@/components/payments/amount-input"

describe("AmountInput", () => {
  const defaultProps = {
    value: "",
    token: "SOL" as const,
    onValueChange: vi.fn(),
    onTokenChange: vi.fn(),
  }

  it("renders with placeholder", () => {
    render(<AmountInput {...defaultProps} />)
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument()
  })

  it("calls onValueChange when typing valid number", () => {
    const onValueChange = vi.fn()
    render(<AmountInput {...defaultProps} onValueChange={onValueChange} />)
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "1.5" } })
    expect(onValueChange).toHaveBeenCalledWith("1.5")
  })

  it("rejects non-numeric input", () => {
    const onValueChange = vi.fn()
    render(<AmountInput {...defaultProps} onValueChange={onValueChange} />)
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "abc" } })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("shows max button when balance is provided", () => {
    render(<AmountInput {...defaultProps} balance={10.5} />)
    expect(screen.getByText(/Max: 10.5000 SOL/)).toBeInTheDocument()
  })

  it("calls onValueChange with balance when max is clicked", () => {
    const onValueChange = vi.fn()
    render(<AmountInput {...defaultProps} onValueChange={onValueChange} balance={10.5} />)
    fireEvent.click(screen.getByText(/Max:/))
    expect(onValueChange).toHaveBeenCalledWith("10.5")
  })

  it("shows insufficient balance error", () => {
    render(<AmountInput {...defaultProps} value="20" balance={10} />)
    expect(screen.getByText(/Insufficient balance/)).toBeInTheDocument()
  })

  it("displays selected token", () => {
    render(<AmountInput {...defaultProps} token="USDC" />)
    expect(screen.getByText("USDC")).toBeInTheDocument()
  })
})
