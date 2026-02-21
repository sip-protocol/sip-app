import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { PrivacyLevel } from "@sip-protocol/types"
import { useSocialProfile } from "@/hooks/use-social-profile"

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    connected: false,
    signTransaction: vi.fn(),
    sendTransaction: vi.fn(),
  }),
  useConnection: () => ({
    connection: {
      rpcEndpoint: "https://api.mainnet-beta.solana.com",
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "mock-blockhash",
        lastValidBlockHeight: 12345,
      }),
    },
  }),
}))

vi.mock("@/hooks/use-on-chain-commit", () => ({
  useOnChainCommit: () => ({
    commit: vi.fn().mockResolvedValue(null),
    tx: {
      status: "idle",
      txSignature: null,
      explorerUrl: null,
      error: null,
      sendTransaction: vi.fn().mockResolvedValue(null),
      reset: vi.fn(),
    },
  }),
}))

vi.mock("@/lib/social/social-service", () => {
  class MockSocialService {
    private onStepChange?: (
      step: string,
      record: Record<string, unknown>
    ) => void
    constructor(
      options: {
        onStepChange?: (step: string, record: Record<string, unknown>) => void
      } = {}
    ) {
      this.onStepChange = options.onStepChange
    }
    validate() {
      return null
    }
    async createProfile(params: { username: string }) {
      const record = {
        id: "profile_mock_123",
        type: "profile",
        profileId: "p_mock_456",
        status: "profile_created",
        privacyLevel: "shielded",
        username: params.username,
        stealthAddress: "sip:solana:0xmock",
        stealthMetaAddress: "st:sol:0xmock",
        startedAt: Date.now(),
        completedAt: Date.now(),
        stepTimestamps: {},
      }
      this.onStepChange?.("generating_stealth", record)
      this.onStepChange?.("creating_profile", record)
      this.onStepChange?.("profile_created", record)
      return record
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

describe("useSocialProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useSocialProfile())
    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("completes create profile flow", async () => {
    const { result } = renderHook(() => useSocialProfile())

    await act(async () => {
      await result.current.createProfile({
        username: "test_user",
        bio: "Test bio",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("profile_created")
    expect(result.current.activeRecord).toBeTruthy()
    expect(result.current.activeRecord?.id).toBe("profile_mock_123")
  })

  it("returns record on success", async () => {
    const { result } = renderHook(() => useSocialProfile())

    let profileResult: unknown
    await act(async () => {
      profileResult = await result.current.createProfile({
        username: "test_user",
        bio: "Test bio",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(profileResult).toBeTruthy()
    expect((profileResult as { id: string }).id).toBe("profile_mock_123")
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useSocialProfile())

    await act(async () => {
      await result.current.createProfile({
        username: "test_user",
        bio: "Test bio",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("profile_created")

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
