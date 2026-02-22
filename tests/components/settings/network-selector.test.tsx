import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { NetworkSelector } from "@/components/settings/network-selector"
import { useNetworkStore } from "@/stores/network"

describe("NetworkSelector", () => {
  beforeEach(() => {
    useNetworkStore.getState().reset()
  })

  it("renders with devnet selected by default", () => {
    render(<NetworkSelector />)
    expect(screen.getByRole("button", { name: "Devnet" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Mainnet" })).toBeInTheDocument()
  })

  it("shows network badge with purple for devnet", () => {
    render(<NetworkSelector />)
    const badge = screen.getByTestId("network-badge")
    expect(badge.className).toContain("purple")
    expect(badge).toHaveTextContent("Devnet")
  })

  it("shows mainnet warning when switching to mainnet", () => {
    render(<NetworkSelector />)
    fireEvent.click(screen.getByText("Mainnet"))
    expect(screen.getByText(/real SOL/i)).toBeInTheDocument()
  })

  it("does not switch to mainnet until confirmed", () => {
    render(<NetworkSelector />)
    fireEvent.click(screen.getByText("Mainnet"))
    // Still on devnet
    expect(useNetworkStore.getState().cluster).toBe("devnet")
  })

  it("switches to mainnet after confirmation", () => {
    render(<NetworkSelector />)
    fireEvent.click(screen.getByText("Mainnet"))
    fireEvent.click(screen.getByText("Confirm"))
    expect(useNetworkStore.getState().cluster).toBe("mainnet-beta")
  })

  it("dismisses warning on cancel", () => {
    render(<NetworkSelector />)
    fireEvent.click(screen.getByText("Mainnet"))
    expect(screen.getByText(/real SOL/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Cancel"))
    expect(screen.queryByText(/real SOL/i)).not.toBeInTheDocument()
  })

  it("switches to devnet without warning", () => {
    // Start on mainnet
    useNetworkStore.getState().setCluster("mainnet-beta")
    render(<NetworkSelector />)
    fireEvent.click(screen.getByText("Devnet"))
    expect(useNetworkStore.getState().cluster).toBe("devnet")
  })

  it("shows green badge when on mainnet", () => {
    useNetworkStore.getState().setCluster("mainnet-beta")
    render(<NetworkSelector />)
    const badge = screen.getByTestId("network-badge")
    expect(badge.className).toContain("green")
    expect(badge).toHaveTextContent("Mainnet-Beta")
  })
})
