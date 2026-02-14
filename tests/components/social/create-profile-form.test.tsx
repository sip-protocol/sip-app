import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { CreateProfileForm } from "@/components/social/create-profile-form"

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    signTransaction: vi.fn(),
  }),
}))

vi.mock("@/lib/social/social-service", () => {
  class MockSocialService {
    validate() { return null }
    async createProfile() {
      return {
        id: "profile_mock_123",
        type: "profile",
        profileId: "p_mock_456",
        status: "profile_created",
        privacyLevel: "shielded",
        username: "test_user",
        stealthAddress: "sip:solana:0xmock",
        stealthMetaAddress: "st:sol:0xmock",
        startedAt: Date.now(),
        completedAt: Date.now(),
        stepTimestamps: {},
      }
    }
  }
  return { SocialService: MockSocialService }
})

vi.mock("@/hooks/use-social-profile", () => ({
  useSocialProfile: () => ({
    status: "idle",
    activeRecord: null,
    error: null,
    createProfile: vi.fn(),
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

describe("CreateProfileForm", () => {
  it("renders username input", () => {
    render(<CreateProfileForm />)
    expect(screen.getByPlaceholderText("anonymous_builder")).toBeInTheDocument()
  })

  it("renders bio textarea", () => {
    render(<CreateProfileForm />)
    expect(
      screen.getByPlaceholderText("Privacy advocate, builder, anon..."),
    ).toBeInTheDocument()
  })

  it("renders privacy toggle with all options", () => {
    render(<CreateProfileForm />)
    expect(screen.getAllByText("Shielded").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Compliant").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Transparent").length).toBeGreaterThanOrEqual(1)
  })

  it("shows connect wallet CTA when not connected", () => {
    render(<CreateProfileForm />)
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument()
  })

  it("renders powered by SIP footer", () => {
    render(<CreateProfileForm />)
    expect(screen.getByText("SIP Stealth Addresses")).toBeInTheDocument()
  })
})
