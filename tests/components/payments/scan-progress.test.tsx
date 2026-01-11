import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ScanProgress } from "@/components/payments/scan-progress"

describe("ScanProgress", () => {
  it("renders progress percentage", () => {
    render(<ScanProgress progress={50} isScanning={true} />)
    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  it("shows scanning message when scanning", () => {
    render(<ScanProgress progress={50} isScanning={true} />)
    expect(screen.getByText(/Scanning blockchain/i)).toBeInTheDocument()
  })

  it("shows complete message when done", () => {
    render(<ScanProgress progress={100} isScanning={false} />)
    expect(screen.getByText(/Scan complete/i)).toBeInTheDocument()
  })

  it("shows pulse animation when scanning", () => {
    render(<ScanProgress progress={50} isScanning={true} />)
    expect(
      screen.getByText(/Checking stealth addresses/i)
    ).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(
      <ScanProgress progress={50} isScanning={true} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass("custom-class")
  })
})
