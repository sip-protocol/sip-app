import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { RecipientInput, validateRecipient } from "@/components/payments/recipient-input"

describe("validateRecipient", () => {
  it("validates correct sip address format", () => {
    const validAddress = "sip:solana:02abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890:03abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
    expect(validateRecipient(validAddress)).toBe(true)
  })

  it("rejects invalid formats", () => {
    expect(validateRecipient("")).toBe(false)
    expect(validateRecipient("invalid")).toBe(false)
    expect(validateRecipient("sip:ethereum:abc:def")).toBe(false)
    expect(validateRecipient("0x1234")).toBe(false)
  })
})

describe("RecipientInput", () => {
  it("renders with placeholder", () => {
    render(<RecipientInput value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText(/sip:solana/)).toBeInTheDocument()
  })

  it("calls onChange when typing", () => {
    const onChange = vi.fn()
    render(<RecipientInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } })
    expect(onChange).toHaveBeenCalledWith("test")
  })

  it("shows error for invalid address after blur", () => {
    render(<RecipientInput value="invalid" onChange={() => {}} />)
    fireEvent.blur(screen.getByRole("textbox"))
    expect(screen.getByText(/Invalid stealth address/)).toBeInTheDocument()
  })

  it("disables input when disabled prop is true", () => {
    render(<RecipientInput value="" onChange={() => {}} disabled />)
    expect(screen.getByRole("textbox")).toBeDisabled()
  })
})
