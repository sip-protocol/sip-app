import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useConnections } from "@/hooks/use-connections"

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    signTransaction: vi.fn(),
  }),
}))

vi.mock("@/lib/social/social-service", () => {
  class MockSocialService {
    validate() { return null }
    async followProfile() {
      return {
        id: "follow_mock_123",
        type: "follow",
        profileId: "profile-dolphin",
        status: "connected",
        privacyLevel: "shielded",
        targetProfileId: "profile-shadow",
        sharedSecret: "0xmock",
        startedAt: Date.now(),
        completedAt: Date.now(),
        stepTimestamps: {},
      }
    }
  }
  return { SocialService: MockSocialService }
})

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

describe("useConnections", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("loads connections for a profile", async () => {
    const { result } = renderHook(() => useConnections("profile-dolphin"))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.connections.length).toBeGreaterThanOrEqual(2)
  })

  it("returns empty connections when no profileId", () => {
    const { result } = renderHook(() => useConnections(null))
    expect(result.current.connections).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useConnections("profile-dolphin"))
    expect(result.current.status).toBe("idle")
    expect(result.current.error).toBeNull()
  })
})
