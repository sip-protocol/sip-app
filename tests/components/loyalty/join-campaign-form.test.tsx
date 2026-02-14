import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { JoinCampaignForm } from "@/components/loyalty/join-campaign-form"
import type { Campaign } from "@/lib/loyalty/types"

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    signTransaction: vi.fn(),
  }),
}))

vi.mock("@/lib/loyalty/loyalty-service", () => {
  class MockLoyaltyService {
    validate() { return null }
    async joinCampaign() {
      return {
        id: "join_mock_123",
        type: "join",
        campaignId: "camp-test",
        status: "joined",
        privacyLevel: "shielded",
        campaignName: "Privacy Pioneer",
        startedAt: Date.now(),
        completedAt: Date.now(),
        stepTimestamps: {},
      }
    }
  }
  return { LoyaltyService: MockLoyaltyService }
})

vi.mock("@/hooks/use-loyalty-campaign", () => ({
  useLoyaltyCampaign: () => ({
    status: "idle",
    activeRecord: null,
    error: null,
    joinCampaign: vi.fn(),
    reset: vi.fn(),
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

const mockCampaign: Campaign = {
  id: "camp-test",
  name: "Privacy Pioneer",
  description: "Complete 5 shielded transfers.",
  actionType: "shielded_transfer",
  requiredCount: 5,
  rewardAmount: 0.5,
  rewardToken: "SOL",
  status: "active",
  startDate: Date.now(),
  endDate: Date.now() + 86400000 * 30,
  participantCount: 142,
  icon: "\u{1F6E1}\uFE0F",
}

describe("JoinCampaignForm", () => {
  it("renders campaign name", () => {
    render(<JoinCampaignForm campaign={mockCampaign} />)
    expect(screen.getByText("Privacy Pioneer")).toBeInTheDocument()
  })

  it("renders privacy toggle with all options", () => {
    render(<JoinCampaignForm campaign={mockCampaign} />)
    expect(screen.getAllByText("Shielded").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Compliant").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Transparent").length).toBeGreaterThanOrEqual(1)
  })

  it("shows connect wallet CTA when not connected", () => {
    render(<JoinCampaignForm campaign={mockCampaign} />)
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument()
  })

  it("renders Torque Protocol footer", () => {
    render(<JoinCampaignForm campaign={mockCampaign} />)
    expect(screen.getByText("Torque Protocol")).toBeInTheDocument()
  })

  it("shows reward info", () => {
    render(<JoinCampaignForm campaign={mockCampaign} />)
    expect(screen.getByText("0.5 SOL")).toBeInTheDocument()
  })
})
