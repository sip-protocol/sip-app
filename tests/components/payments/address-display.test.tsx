import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AddressDisplay } from "@/components/payments/address-display"

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  configurable: true,
})

describe("AddressDisplay", () => {
  const mockAddress = "sip:solana:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"

  beforeEach(() => {
    mockWriteText.mockClear()
    mockWriteText.mockResolvedValue(undefined)
  })

  it("renders the address", () => {
    render(<AddressDisplay address={mockAddress} />)
    expect(screen.getByText("sip:")).toBeInTheDocument()
    expect(screen.getByText("solana:")).toBeInTheDocument()
  })

  it("renders with label", () => {
    render(<AddressDisplay address={mockAddress} label="Your Address" />)
    expect(screen.getByText("Your Address")).toBeInTheDocument()
  })

  it("copies address to clipboard when copy button is clicked", async () => {
    render(<AddressDisplay address={mockAddress} />)

    const copyButton = screen.getByRole("button", { name: /copy/i })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(mockAddress)
    })
  })

  it("shows 'Copied!' feedback after copying", async () => {
    render(<AddressDisplay address={mockAddress} />)

    const copyButton = screen.getByRole("button", { name: /copy/i })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument()
    })
  })

  it("displays truncated address in subtitle", () => {
    render(<AddressDisplay address={mockAddress} />)
    // Should show truncated format
    expect(screen.getByText(/sip:solana:/)).toBeInTheDocument()
  })
})
