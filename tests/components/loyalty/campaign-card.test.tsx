import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CampaignCard } from "@/components/loyalty/campaign-card"
import type { Campaign, CampaignProgress } from "@/lib/loyalty/types"

const mockCampaign: Campaign = {
  id: "camp-test",
  name: "Privacy Pioneer",
  description: "Complete 5 shielded transfers to prove your commitment.",
  actionType: "shielded_transfer",
  requiredCount: 5,
  rewardAmount: 0.5,
  rewardToken: "SOL",
  status: "active",
  startDate: Date.now() - 86400000,
  endDate: Date.now() + 86400000 * 30,
  participantCount: 142,
  icon: "\u{1F6E1}\uFE0F",
}

const mockProgress: CampaignProgress = {
  campaignId: "camp-test",
  completedActions: 3,
  requiredActions: 5,
  isComplete: false,
  joinedAt: Date.now() - 86400000 * 5,
}

describe("CampaignCard", () => {
  it("renders campaign name", () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText("Privacy Pioneer")).toBeInTheDocument()
  })

  it("renders campaign description", () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText(/Complete 5 shielded transfers/)).toBeInTheDocument()
  })

  it("renders reward amount", () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText("0.5 SOL")).toBeInTheDocument()
  })

  it("renders participant count", () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText("142 participants")).toBeInTheDocument()
  })

  it("renders status badge", () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("shows progress bar when joined", () => {
    render(<CampaignCard campaign={mockCampaign} progress={mockProgress} />)
    expect(screen.getByText("3/5")).toBeInTheDocument()
  })

  it("shows Join button when not joined", () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText("Join")).toBeInTheDocument()
  })

  it("calls onJoin when Join is clicked", () => {
    const onJoin = vi.fn()
    render(<CampaignCard campaign={mockCampaign} onJoin={onJoin} />)
    fireEvent.click(screen.getByText("Join"))
    expect(onJoin).toHaveBeenCalledWith(mockCampaign)
  })
})
