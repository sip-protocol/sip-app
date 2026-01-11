import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PrivacyToggle } from "@/components/payments/privacy-toggle"

describe("PrivacyToggle", () => {
  it("renders all three options", () => {
    render(<PrivacyToggle value="shielded" onChange={() => {}} />)
    expect(screen.getByText("Shielded")).toBeInTheDocument()
    expect(screen.getByText("Compliant")).toBeInTheDocument()
    expect(screen.getByText("Transparent")).toBeInTheDocument()
  })

  it("highlights the selected option", () => {
    render(<PrivacyToggle value="compliant" onChange={() => {}} />)
    const compliantBtn = screen.getByText("Compliant").closest("button")
    expect(compliantBtn).toHaveClass("border-sip-purple-500")
  })

  it("calls onChange when clicking an option", () => {
    const onChange = vi.fn()
    render(<PrivacyToggle value="shielded" onChange={onChange} />)
    fireEvent.click(screen.getByText("Transparent"))
    expect(onChange).toHaveBeenCalledWith("transparent")
  })

  it("disables buttons when disabled", () => {
    render(<PrivacyToggle value="shielded" onChange={() => {}} disabled />)
    const buttons = screen.getAllByRole("button")
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })
})
