import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { LoyaltyStatus } from "@/components/loyalty/loyalty-status"

describe("LoyaltyStatus", () => {
  describe("join mode", () => {
    it("renders all 3 join step labels", () => {
      render(<LoyaltyStatus currentStep="selecting_campaign" mode="join" />)
      expect(screen.getByText("Select Campaign")).toBeInTheDocument()
      expect(screen.getByText("Joining Campaign")).toBeInTheDocument()
      expect(screen.getByText("Joined")).toBeInTheDocument()
    })

    it("shows active header for in-progress steps", () => {
      render(<LoyaltyStatus currentStep="joining" mode="join" />)
      expect(screen.getByText("Joining Campaign...")).toBeInTheDocument()
    })

    it("shows complete header when done", () => {
      render(<LoyaltyStatus currentStep="joined" mode="join" />)
      expect(screen.getByText("Campaign Joined!")).toBeInTheDocument()
    })
  })

  describe("action mode", () => {
    it("renders all 3 action step labels", () => {
      render(<LoyaltyStatus currentStep="verifying_action" mode="action" />)
      expect(screen.getByText("Verify Action")).toBeInTheDocument()
      expect(screen.getByText("Record Progress")).toBeInTheDocument()
      expect(screen.getByText("Recorded")).toBeInTheDocument()
    })

    it("shows active header for recording", () => {
      render(<LoyaltyStatus currentStep="recording" mode="action" />)
      expect(screen.getByText("Recording Action...")).toBeInTheDocument()
    })

    it("shows complete header when recorded", () => {
      render(<LoyaltyStatus currentStep="recorded" mode="action" />)
      expect(screen.getByText("Action Recorded!")).toBeInTheDocument()
    })
  })

  describe("claim mode", () => {
    it("renders all 3 claim step labels", () => {
      render(<LoyaltyStatus currentStep="generating_stealth" mode="claim" />)
      expect(screen.getByText("Generate Stealth Address")).toBeInTheDocument()
      expect(screen.getByText("Claiming Reward")).toBeInTheDocument()
      expect(screen.getByText("Claimed")).toBeInTheDocument()
    })

    it("shows active header for claiming", () => {
      render(<LoyaltyStatus currentStep="claiming" mode="claim" />)
      expect(screen.getByText("Claiming Reward...")).toBeInTheDocument()
    })

    it("shows complete header when claimed", () => {
      render(<LoyaltyStatus currentStep="claimed" mode="claim" />)
      expect(screen.getByText("Reward Claimed!")).toBeInTheDocument()
    })
  })

  it("shows failed header and error message", () => {
    render(
      <LoyaltyStatus
        currentStep="failed"
        mode="claim"
        error="Stealth address generation failed"
      />,
    )
    expect(screen.getByText("Claim Failed")).toBeInTheDocument()
    expect(screen.getByText("Stealth address generation failed")).toBeInTheDocument()
  })
})
