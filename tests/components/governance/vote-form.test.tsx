import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { VoteForm } from "@/components/governance/vote-form"
import type { Proposal } from "@/lib/governance/types"

const now = Date.now()
const DAY = 86400000

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    signTransaction: vi.fn(),
  }),
}))

// Mock GovernanceService
vi.mock("@/lib/governance/governance-service", () => {
  class MockGovernanceService {
    validate() { return null }
    async commitVote() { return {} }
    async revealVote() { return {} }
  }
  return { GovernanceService: MockGovernanceService }
})

// Mock hooks
vi.mock("@/hooks/use-governance-vote", () => ({
  useGovernanceVote: () => ({
    status: "idle",
    activeVote: null,
    error: null,
    commitVote: vi.fn(),
    revealVote: vi.fn(),
    reset: vi.fn(),
  }),
}))

vi.mock("@/hooks/use-voter-weight", () => ({
  useVoterWeight: () => ({
    weight: "15000",
    isLoading: false,
  }),
}))

vi.mock("@/hooks/useTrackEvent", () => ({
  useTrackEvent: () => ({
    track: vi.fn(),
    trackBridge: vi.fn(),
    trackVote: vi.fn(),
    trackSocial: vi.fn(),
    trackLoyalty: vi.fn(),
    trackArt: vi.fn(),
    trackChannel: vi.fn(),
  }),
}))

const mockProposal: Proposal = {
  id: "prop-test-01",
  daoId: "marinade",
  daoName: "Marinade Finance",
  daoIcon: "/tokens/mnde.png",
  title: "Test Proposal",
  description: "A test proposal",
  choices: ["For", "Against", "Abstain"],
  status: "voting",
  startTime: now - DAY,
  endTime: now + 3 * DAY,
  revealTime: now + 4 * DAY,
  totalVotes: 100,
  quorum: 200,
  encryptionKey: "0xabc",
}

describe("VoteForm", () => {
  it("renders proposal title and DAO name", () => {
    render(<VoteForm proposal={mockProposal} />)
    expect(screen.getByText("Test Proposal")).toBeInTheDocument()
    expect(screen.getByText("Marinade Finance")).toBeInTheDocument()
  })

  it("renders choice selector with all options", () => {
    render(<VoteForm proposal={mockProposal} />)
    expect(screen.getByText("For")).toBeInTheDocument()
    expect(screen.getByText("Against")).toBeInTheDocument()
    expect(screen.getByText("Abstain")).toBeInTheDocument()
  })

  it("renders privacy toggle", () => {
    render(<VoteForm proposal={mockProposal} />)
    expect(screen.getAllByText("Shielded").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Compliant").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Transparent").length).toBeGreaterThanOrEqual(1)
  })

  it("shows connect wallet when not connected", () => {
    render(<VoteForm proposal={mockProposal} />)
    expect(screen.getByText("Connect Wallet to Vote")).toBeInTheDocument()
  })

  it("renders powered by footer", () => {
    render(<VoteForm proposal={mockProposal} />)
    expect(screen.getByText("Pedersen Commitments")).toBeInTheDocument()
  })
})
