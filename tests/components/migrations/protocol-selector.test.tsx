import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ProtocolSelector } from "@/components/migrations/protocol-selector"

describe("ProtocolSelector", () => {
  it("renders all selectable protocols", () => {
    render(<ProtocolSelector selected={null} onSelect={vi.fn()} />)

    expect(screen.getByText("Saber")).toBeTruthy()
    expect(screen.getByText("Raydium Legacy Pools")).toBeTruthy()
    expect(screen.getByText("Solend v1")).toBeTruthy()
    expect(screen.getByText("Port Finance")).toBeTruthy()
    expect(screen.getByText("Jet Protocol v1")).toBeTruthy()
    expect(screen.getByText("Mercurial Finance")).toBeTruthy()
  })

  it("renders manual entry option", () => {
    render(<ProtocolSelector selected={null} onSelect={vi.fn()} />)
    expect(screen.getByText("Manual SOL Entry")).toBeTruthy()
  })

  it("renders status badges", () => {
    render(<ProtocolSelector selected={null} onSelect={vi.fn()} />)
    expect(screen.getByText("Inactive")).toBeTruthy()
    expect(screen.getAllByText("Deprecated").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Dead").length).toBeGreaterThan(0)
  })

  it("calls onSelect when protocol clicked", () => {
    const onSelect = vi.fn()
    render(<ProtocolSelector selected={null} onSelect={onSelect} />)

    fireEvent.click(screen.getByText("Saber"))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "saber" })
    )
  })

  it("deselects when same protocol clicked again", () => {
    const onSelect = vi.fn()
    const saber = {
      id: "saber",
      name: "Saber",
      icon: "/protocols/saber.png",
      description: "Stablecoin DEX — deprecated, low liquidity",
      status: "inactive" as const,
      category: "defi" as const,
    }

    render(<ProtocolSelector selected={saber} onSelect={onSelect} />)

    fireEvent.click(screen.getByText("Saber"))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it("disables all buttons when disabled prop is true", () => {
    render(
      <ProtocolSelector selected={null} onSelect={vi.fn()} disabled={true} />
    )

    const buttons = screen.getAllByRole("button")
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })
})
