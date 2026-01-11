import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { QRCodeDisplay } from "@/components/payments/qr-code-display"

describe("QRCodeDisplay", () => {
  it("renders QR code SVG", () => {
    render(<QRCodeDisplay value="test-value" />)
    const svg = document.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("applies custom size", () => {
    render(<QRCodeDisplay value="test-value" size={300} />)
    const svg = document.querySelector("svg")
    expect(svg).toHaveAttribute("width", "300")
    expect(svg).toHaveAttribute("height", "300")
  })

  it("applies custom className", () => {
    render(<QRCodeDisplay value="test-value" className="custom-class" />)
    const container = document.querySelector(".custom-class")
    expect(container).toBeInTheDocument()
  })

  it("has white background container", () => {
    render(<QRCodeDisplay value="test-value" />)
    const container = document.querySelector(".bg-white")
    expect(container).toBeInTheDocument()
  })
})
