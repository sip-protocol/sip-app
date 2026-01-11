import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { KeyBackupWarning } from "@/components/payments/key-backup-warning"

describe("KeyBackupWarning", () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    mockOnConfirm.mockClear()
    mockOnCancel.mockClear()
  })

  it("renders warning message", () => {
    render(<KeyBackupWarning onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    expect(screen.getByText(/Important: Backup Your Keys/i)).toBeInTheDocument()
  })

  it("displays backup instructions", () => {
    render(<KeyBackupWarning onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    expect(screen.getByText(/Keys are stored in your browser/i)).toBeInTheDocument()
    expect(screen.getByText(/Clearing browser data will delete your keys/i)).toBeInTheDocument()
  })

  it("calls onConfirm when confirm button is clicked", () => {
    render(<KeyBackupWarning onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    fireEvent.click(screen.getByText(/I Understand, Generate Keys/i))
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it("calls onCancel when cancel button is clicked", () => {
    render(<KeyBackupWarning onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    fireEvent.click(screen.getByText(/Cancel/i))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it("shows warning about lost keys", () => {
    render(<KeyBackupWarning onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    expect(screen.getByText(/There is no way to recover lost keys/i)).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(
      <KeyBackupWarning
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        className="custom-class"
      />
    )
    expect(container.firstChild).toHaveClass("custom-class")
  })
})
