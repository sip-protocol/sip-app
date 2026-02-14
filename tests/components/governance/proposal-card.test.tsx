import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ProposalCard } from "@/components/governance/proposal-card"
import type { Proposal } from "@/lib/governance/types"

const now = Date.now()
const DAY = 86400000

const mockProposal: Proposal = {
  id: "prop-test-01",
  daoId: "marinade",
  daoName: "Marinade Finance",
  daoIcon: "/tokens/mnde.png",
  title: "Test Proposal Title",
  description: "A test proposal description for testing purposes.",
  choices: ["For", "Against", "Abstain"],
  status: "voting",
  startTime: now - DAY,
  endTime: now + 3 * DAY,
  revealTime: now + 4 * DAY,
  totalVotes: 100,
  quorum: 200,
  encryptionKey: "0xabc",
}

describe("ProposalCard", () => {
  it("renders DAO name and proposal title", () => {
    render(<ProposalCard proposal={mockProposal} />)
    expect(screen.getByText("Marinade Finance")).toBeInTheDocument()
    expect(screen.getByText("Test Proposal Title")).toBeInTheDocument()
  })

  it("renders status badge", () => {
    render(<ProposalCard proposal={mockProposal} />)
    expect(screen.getByText("Voting")).toBeInTheDocument()
  })

  it("renders vote count and quorum", () => {
    render(<ProposalCard proposal={mockProposal} />)
    expect(screen.getByText("100 votes")).toBeInTheDocument()
    expect(screen.getByText("Quorum: 200")).toBeInTheDocument()
  })

  it("shows Vote button when status is voting", () => {
    const onVote = vi.fn()
    render(<ProposalCard proposal={mockProposal} onVote={onVote} />)
    const button = screen.getByText("Vote")
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onVote).toHaveBeenCalledWith("prop-test-01")
  })

  it("shows Reveal button when status is reveal and has committed vote", () => {
    const onReveal = vi.fn()
    const revealProposal = { ...mockProposal, status: "reveal" as const }
    render(
      <ProposalCard
        proposal={revealProposal}
        onReveal={onReveal}
        hasCommittedVote={true}
      />,
    )
    // "Reveal" appears twice: status badge + button
    const reveals = screen.getAllByText("Reveal")
    expect(reveals.length).toBe(2)
    // Click the button (last one)
    fireEvent.click(reveals[reveals.length - 1])
    expect(onReveal).toHaveBeenCalledWith("prop-test-01")
  })

  it("does not show Reveal button without committed vote", () => {
    const revealProposal = { ...mockProposal, status: "reveal" as const }
    render(
      <ProposalCard
        proposal={revealProposal}
        hasCommittedVote={false}
      />,
    )
    // Only the status badge "Reveal" should appear, not a button
    const reveals = screen.getAllByText("Reveal")
    expect(reveals).toHaveLength(1) // Just the status badge
  })

  it("renders description", () => {
    render(<ProposalCard proposal={mockProposal} />)
    expect(
      screen.getByText("A test proposal description for testing purposes."),
    ).toBeInTheDocument()
  })
})
