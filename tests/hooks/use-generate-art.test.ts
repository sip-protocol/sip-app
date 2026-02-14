import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { PrivacyLevel } from "@sip-protocol/types"
import { useGenerateArt } from "@/hooks/use-generate-art"

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    signTransaction: vi.fn(),
  }),
}))

vi.mock("@/lib/art/art-service", () => {
  class MockArtService {
    private onStepChange?: (step: string, record: Record<string, unknown>) => void
    constructor(options: { onStepChange?: (step: string, record: Record<string, unknown>) => void } = {}) {
      this.onStepChange = options.onStepChange
    }
    validate() { return null }
    async generateArt(params: { styleId: string }) {
      const record = {
        id: "art_mock_123",
        type: "generate",
        status: "generated",
        privacyLevel: "shielded",
        styleId: params.styleId,
        svgData: "<svg></svg>",
        seed: "aabb",
        stealthAddress: "sip:solana:0xmock",
        metaAddress: "st:sol:0xmock",
        startedAt: Date.now(),
        completedAt: Date.now(),
        stepTimestamps: {},
      }
      const art = {
        id: "ga_mock_456",
        parameters: { styleId: params.styleId, palette: ["#f43f5e"], shapes: { count: 10, types: ["circle"] }, transforms: { rotation: 0, scale: 1, opacity: 1 }, seed: "aabb" },
        svgData: "<svg></svg>",
        seed: "aabb",
        stealthAddress: "sip:solana:0xmock",
        metaAddress: "st:sol:0xmock",
        privacyLevel: "shielded",
        createdAt: Date.now(),
      }
      this.onStepChange?.("selecting_style", record)
      this.onStepChange?.("generating", record)
      this.onStepChange?.("generated", record)
      return { record, art }
    }
  }
  return { ArtService: MockArtService }
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

describe("useGenerateArt", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useGenerateArt())
    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
    expect(result.current.generatedArt).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("completes generate art flow", async () => {
    const { result } = renderHook(() => useGenerateArt())

    await act(async () => {
      await result.current.generateArt({
        styleId: "cipher_bloom",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("generated")
    expect(result.current.activeRecord).toBeTruthy()
    expect(result.current.generatedArt).toBeTruthy()
  })

  it("returns record on success", async () => {
    const { result } = renderHook(() => useGenerateArt())

    let generateResult: unknown
    await act(async () => {
      generateResult = await result.current.generateArt({
        styleId: "cipher_bloom",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(generateResult).toBeTruthy()
    expect((generateResult as { id: string }).id).toBe("art_mock_123")
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useGenerateArt())

    await act(async () => {
      await result.current.generateArt({
        styleId: "cipher_bloom",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("generated")

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
    expect(result.current.generatedArt).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
