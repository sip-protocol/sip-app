import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { PrivacyLevel } from "@sip-protocol/types"
import { useMintNFT } from "@/hooks/use-mint-nft"

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
    async mintNFT(params: { name: string; generatedArtId: string }) {
      const record = {
        id: "mint_mock_123",
        type: "mint",
        status: "minted",
        privacyLevel: "shielded",
        generatedArtId: params.generatedArtId,
        nftName: params.name,
        mintAddress: "SIPnft_mock",
        metadataUri: "https://arweave.net/mock",
        startedAt: Date.now(),
        completedAt: Date.now(),
        stepTimestamps: {},
      }
      const nft = {
        id: "nft_mock_789",
        generatedArtId: params.generatedArtId,
        name: params.name,
        symbol: "SIPART",
        mintAddress: "SIPnft_mock",
        metadataUri: "https://arweave.net/mock",
        mintedAt: Date.now(),
      }
      this.onStepChange?.("preparing_nft", record)
      this.onStepChange?.("minting", record)
      this.onStepChange?.("minted", record)
      return { record, nft }
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

describe("useMintNFT", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useMintNFT())
    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("completes mint NFT flow", async () => {
    const { result } = renderHook(() => useMintNFT())

    await act(async () => {
      await result.current.mintNFT({
        generatedArtId: "ga_123",
        name: "My Privacy Art",
        description: "A beautiful piece",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("minted")
    expect(result.current.activeRecord).toBeTruthy()
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useMintNFT())

    await act(async () => {
      await result.current.mintNFT({
        generatedArtId: "ga_123",
        name: "My Privacy Art",
        description: "Test",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("minted")

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.activeRecord).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
