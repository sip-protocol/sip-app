import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { PrivacyLevel } from "@sip-protocol/types"
import { useClaimReward } from "@/hooks/use-claim-reward"

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
    async claimReward(params: { campaignId: string; amount: number; token: string }) {
      const record = {
        id: "claim_mock_123",
        type: "claim",
        campaignId: params.campaignId,
        status: "claimed",
        privacyLevel: "shielded",
        rewardAmount: params.amount,
        rewardToken: params.token,
        stealthAddress: "sip:solana:0xmock",
        stealthMetaAddress: "st:sol:0xmock",
        startedAt: Date.now(),
        completedAt: Date.now(),
        stepTimestamps: {},
      }
      this.onStepChange?.("generating_stealth", record)
      this.onStepChange?.("claiming", record)
      this.onStepChange?.("claimed", record)
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

describe("useClaimReward", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useClaimReward())
    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
  })

  it("completes claim reward flow", async () => {
    const { result } = renderHook(() => useClaimReward())

    await act(async () => {
      await result.current.claimReward({
        rewardId: "reward-1",
        campaignId: "camp-stealth-builder",
        amount: 0.3,
        token: "SOL",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("claimed")
    expect(result.current.activeRecord?.stealthAddress).toBeTruthy()
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useClaimReward())

    await act(async () => {
      await result.current.claimReward({
        rewardId: "reward-1",
        campaignId: "camp-stealth-builder",
        amount: 0.3,
        token: "SOL",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("claimed")

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
  })
})
