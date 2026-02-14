import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { PrivacyLevel } from "@sip-protocol/types"
import { useLoyaltyCampaign } from "@/hooks/use-loyalty-campaign"

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    signTransaction: vi.fn(),
  }),
}))

vi.mock("@/lib/loyalty/loyalty-service", () => {
  class MockLoyaltyService {
    private onStepChange?: (step: string, record: Record<string, unknown>) => void
    constructor(options: { onStepChange?: (step: string, record: Record<string, unknown>) => void } = {}) {
      this.onStepChange = options.onStepChange
    }
    validate() { return null }
    async joinCampaign(params: { campaignId: string }) {
      const record = {
        id: "join_mock_123",
        type: "join",
        campaignId: params.campaignId,
        status: "joined",
        privacyLevel: "shielded",
        campaignName: "Privacy Pioneer",
        startedAt: Date.now(),
        completedAt: Date.now(),
        stepTimestamps: {},
      }
      this.onStepChange?.("selecting_campaign", record)
      this.onStepChange?.("joining", record)
      this.onStepChange?.("joined", record)
      return record
    }
  }
  return { LoyaltyService: MockLoyaltyService }
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

describe("useLoyaltyCampaign", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useLoyaltyCampaign())
    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("completes join campaign flow", async () => {
    const { result } = renderHook(() => useLoyaltyCampaign())

    await act(async () => {
      await result.current.joinCampaign({
        campaignId: "camp-privacy-pioneer",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("joined")
    expect(result.current.activeRecord).toBeTruthy()
    expect(result.current.activeRecord?.id).toBe("join_mock_123")
  })

  it("returns record on success", async () => {
    const { result } = renderHook(() => useLoyaltyCampaign())

    let joinResult: unknown
    await act(async () => {
      joinResult = await result.current.joinCampaign({
        campaignId: "camp-privacy-pioneer",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(joinResult).toBeTruthy()
    expect((joinResult as { id: string }).id).toBe("join_mock_123")
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useLoyaltyCampaign())

    await act(async () => {
      await result.current.joinCampaign({
        campaignId: "camp-privacy-pioneer",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("joined")

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
