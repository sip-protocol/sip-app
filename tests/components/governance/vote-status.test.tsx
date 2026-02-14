import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { VoteStatus } from "@/components/governance/vote-status"

describe("VoteStatus", () => {
  describe("commit mode", () => {
    it("renders all 3 commit step labels", () => {
      render(<VoteStatus currentStep="encrypting" mode="commit" />)
      expect(screen.getByText("Encrypt Vote")).toBeInTheDocument()
      expect(screen.getByText("Submit Commitment")).toBeInTheDocument()
      expect(screen.getByText("Committed")).toBeInTheDocument()
    })

    it("shows in progress header for active steps", () => {
      render(<VoteStatus currentStep="committing" mode="commit" />)
      expect(screen.getByText("Committing Vote...")).toBeInTheDocument()
    })

    it("shows committed header when done", () => {
      render(<VoteStatus currentStep="committed" mode="commit" />)
      expect(screen.getByText("Vote Committed!")).toBeInTheDocument()
    })

    it("shows failed header and error message", () => {
      render(
        <VoteStatus
          currentStep="failed"
          mode="commit"
          error="Encryption failed"
        />,
      )
      expect(screen.getByText("Vote Commit Failed")).toBeInTheDocument()
      expect(screen.getByText("Encryption failed")).toBeInTheDocument()
    })

    it("shows description for current step", () => {
      render(<VoteStatus currentStep="encrypting" mode="commit" />)
      expect(
        screen.getByText(
          "Creating Pedersen commitment and encrypting with XChaCha20-Poly1305",
        ),
      ).toBeInTheDocument()
    })
  })

  describe("reveal mode", () => {
    it("renders all 2 reveal step labels", () => {
      render(<VoteStatus currentStep="revealing" mode="reveal" />)
      expect(screen.getByText("Decrypt Vote")).toBeInTheDocument()
      expect(screen.getByText("Revealed")).toBeInTheDocument()
    })

    it("shows in progress header for active step", () => {
      render(<VoteStatus currentStep="revealing" mode="reveal" />)
      expect(screen.getByText("Revealing Vote...")).toBeInTheDocument()
    })

    it("shows revealed header when done", () => {
      render(<VoteStatus currentStep="revealed" mode="reveal" />)
      expect(screen.getByText("Vote Revealed!")).toBeInTheDocument()
    })

    it("shows failed header for reveal failure", () => {
      render(
        <VoteStatus
          currentStep="failed"
          mode="reveal"
          error="Wrong key"
        />,
      )
      expect(screen.getByText("Vote Reveal Failed")).toBeInTheDocument()
      expect(screen.getByText("Wrong key")).toBeInTheDocument()
    })
  })
})
