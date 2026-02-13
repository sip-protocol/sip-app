import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { BridgeStatus } from "@/components/bridge/bridge-status"

describe("BridgeStatus", () => {
  it("renders all 5 step labels", () => {
    render(<BridgeStatus currentStep="generating_stealth" />)
    expect(screen.getByText("Generate Stealth Address")).toBeInTheDocument()
    expect(screen.getByText("Lock Tokens")).toBeInTheDocument()
    expect(screen.getByText("Guardian Attestation")).toBeInTheDocument()
    expect(screen.getByText("Relay to Destination")).toBeInTheDocument()
    expect(screen.getByText("Complete")).toBeInTheDocument()
  })

  it("shows in progress header for active steps", () => {
    render(<BridgeStatus currentStep="awaiting_attestation" />)
    expect(
      screen.getByText("Bridge Transfer in Progress"),
    ).toBeInTheDocument()
  })

  it("shows complete header when done", () => {
    render(<BridgeStatus currentStep="complete" />)
    expect(
      screen.getByText("Bridge Transfer Complete!"),
    ).toBeInTheDocument()
  })

  it("shows failed header and error message", () => {
    render(
      <BridgeStatus currentStep="failed" error="Simulation error" />,
    )
    expect(
      screen.getByText("Bridge Transfer Failed"),
    ).toBeInTheDocument()
    expect(screen.getByText("Simulation error")).toBeInTheDocument()
  })

  it("shows description for current step", () => {
    render(<BridgeStatus currentStep="relaying" />)
    expect(
      screen.getByText(
        "Delivering tokens to stealth address on destination chain",
      ),
    ).toBeInTheDocument()
  })
})
