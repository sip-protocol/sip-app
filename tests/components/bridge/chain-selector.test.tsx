import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ChainSelector } from "@/components/bridge/chain-selector"

describe("ChainSelector", () => {
  const defaultProps = {
    sourceChain: "solana" as const,
    destChain: "ethereum" as const,
    availableDestChains: ["ethereum" as const, "base" as const],
    onSourceChange: vi.fn(),
    onDestChange: vi.fn(),
    onSwap: vi.fn(),
  }

  it("renders source and dest chain names", () => {
    render(<ChainSelector {...defaultProps} />)
    expect(screen.getByText("Solana")).toBeInTheDocument()
    expect(screen.getByText("Ethereum")).toBeInTheDocument()
  })

  it("renders From and To labels", () => {
    render(<ChainSelector {...defaultProps} />)
    expect(screen.getByText("From")).toBeInTheDocument()
    expect(screen.getByText("To")).toBeInTheDocument()
  })

  it("shows Select chain when no chain selected", () => {
    render(
      <ChainSelector
        {...defaultProps}
        sourceChain={null}
        destChain={null}
      />,
    )
    const placeholders = screen.getAllByText("Select chain")
    expect(placeholders).toHaveLength(2)
  })

  it("calls onSwap when swap button clicked", () => {
    render(<ChainSelector {...defaultProps} />)
    const swapButton = screen.getByTitle("Swap chains")
    fireEvent.click(swapButton)
    expect(defaultProps.onSwap).toHaveBeenCalledOnce()
  })

  it("disables swap button when disabled prop is true", () => {
    render(<ChainSelector {...defaultProps} disabled />)
    const swapButton = screen.getByTitle("Swap chains")
    expect(swapButton).toBeDisabled()
  })
})
