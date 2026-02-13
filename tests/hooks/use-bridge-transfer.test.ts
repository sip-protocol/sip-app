import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useBridgeTransfer } from "@/hooks/use-bridge-transfer"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    signTransaction: vi.fn(),
  }),
}))

// Mock BridgeService as a class
vi.mock("@/lib/bridge/bridge-service", () => {
  class MockBridgeService {
    private onStepChange?: (step: string, transfer: Record<string, unknown>) => void
    constructor(options: { onStepChange?: (step: string, transfer: Record<string, unknown>) => void } = {}) {
      this.onStepChange = options.onStepChange
    }
    validate(params: { sourceChain: string; destChain: string }) {
      if (params.sourceChain === params.destChain) {
        return "Source and destination chains must be different"
      }
      return null
    }
    async executeBridge(params: { sourceChain: string; destChain: string; token: string; amount: string; privacyLevel: string }) {
      const transfer = {
        id: "bridge_mock_123",
        sourceChain: params.sourceChain,
        destChain: params.destChain,
        token: params.token,
        amount: params.amount,
        stealthAddress: "sip:ethereum:0xstealth",
        stealthMetaAddress: "sip:ethereum:0xspend:0xview",
        privacyLevel: params.privacyLevel,
        status: "complete" as const,
        sourceTxHash: "0x" + "a".repeat(64),
        destTxHash: "0x" + "b".repeat(64),
        wormholeMessageId: "12345/abcdef",
        startedAt: Date.now(),
        completedAt: Date.now(),
        stepTimestamps: {},
      }
      this.onStepChange?.("generating_stealth", transfer)
      this.onStepChange?.("complete", transfer)
      return transfer
    }
  }
  return { BridgeService: MockBridgeService }
})

// Mock tracking
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

const validParams = {
  sourceChain: "solana" as const,
  destChain: "ethereum" as const,
  token: "USDC",
  amount: "100",
  privacyLevel: "shielded" as const,
}

describe("useBridgeTransfer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useBridgeTransfer())
    expect(result.current.status).toBe("idle")
    expect(result.current.activeTransfer).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("completes bridge flow", async () => {
    const { result } = renderHook(() => useBridgeTransfer())

    await act(async () => {
      await result.current.bridge(validParams)
    })

    expect(result.current.status).toBe("complete")
    expect(result.current.activeTransfer).toBeTruthy()
    expect(result.current.activeTransfer?.stealthAddress).toBe(
      "sip:ethereum:0xstealth",
    )
  })

  it("sets error for invalid params", async () => {
    const { result } = renderHook(() => useBridgeTransfer())

    await act(async () => {
      await result.current.bridge({
        ...validParams,
        destChain: "solana",
      })
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe(
      "Source and destination chains must be different",
    )
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useBridgeTransfer())

    await act(async () => {
      await result.current.bridge(validParams)
    })

    expect(result.current.status).toBe("complete")

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.activeTransfer).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("returns transfer result on success", async () => {
    const { result } = renderHook(() => useBridgeTransfer())

    let transferResult: unknown
    await act(async () => {
      transferResult = await result.current.bridge(validParams)
    })

    expect(transferResult).toBeTruthy()
    expect((transferResult as { id: string }).id).toBe("bridge_mock_123")
  })
})
