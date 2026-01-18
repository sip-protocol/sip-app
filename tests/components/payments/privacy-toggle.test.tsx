import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PrivacyToggle } from "@/components/payments/privacy-toggle"

describe("PrivacyToggle", () => {
  it("renders all three options", () => {
    render(<PrivacyToggle value="shielded" onChange={() => {}} />)
    // Use getAllByText since info panel also shows selected level name
    expect(screen.getAllByText("Shielded").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Compliant").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Transparent").length).toBeGreaterThan(0)
  })

  it("highlights the selected option", () => {
    render(<PrivacyToggle value="compliant" onChange={() => {}} />)
    // Get button by role and name to avoid multiple matches from info panel
    const compliantBtn = screen.getByRole("button", { name: /compliant/i })
    expect(compliantBtn).toHaveClass("border-sip-purple-500")
  })

  it("calls onChange when clicking an option", () => {
    const onChange = vi.fn()
    render(<PrivacyToggle value="shielded" onChange={onChange} />)
    // Get button by role to avoid multiple text matches
    const transparentBtn = screen.getByRole("button", { name: /transparent/i })
    fireEvent.click(transparentBtn)
    expect(onChange).toHaveBeenCalledWith("transparent")
  })

  it("disables buttons when disabled", () => {
    render(<PrivacyToggle value="shielded" onChange={() => {}} disabled />)
    const buttons = screen.getAllByRole("button")
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })
})
