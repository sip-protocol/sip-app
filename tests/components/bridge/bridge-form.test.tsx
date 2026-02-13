import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { BridgeForm } from "@/components/bridge/bridge-form"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    signTransaction: vi.fn(),
  }),
  useConnection: () => ({
    connection: null,
  }),
}))

// Mock bridge hooks
vi.mock("@/hooks/use-bridge-transfer", () => ({
  useBridgeTransfer: () => ({
    status: "idle",
    activeTransfer: null,
    error: null,
    bridge: vi.fn(),
    reset: vi.fn(),
  }),
}))

vi.mock("@/hooks/use-bridge-routes", () => ({
  useBridgeRoutes: () => ({
    availableDestChains: ["ethereum", "base"],
    availableTokens: ["USDC"],
    route: undefined,
    sourceChainInfo: undefined,
    destChainInfo: undefined,
    estimatedTime: null,
  }),
}))

vi.mock("@/hooks/use-bridge-fee", () => ({
  useBridgeFee: () => ({
    fee: null,
    isEstimating: false,
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

describe("BridgeForm", () => {
  it("renders the form with chain selectors", () => {
    render(<BridgeForm />)
    expect(screen.getByText("From")).toBeInTheDocument()
    expect(screen.getByText("To")).toBeInTheDocument()
  })

  it("shows Connect Wallet button when disconnected", () => {
    render(<BridgeForm />)
    expect(
      screen.getByText("Connect Wallet to Bridge"),
    ).toBeInTheDocument()
  })

  it("renders amount input", () => {
    render(<BridgeForm />)
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument()
  })

  it("renders privacy toggle", () => {
    render(<BridgeForm />)
    expect(screen.getByText("Privacy Level")).toBeInTheDocument()
    expect(screen.getAllByText("Shielded").length).toBeGreaterThan(0)
  })

  it("renders protocol footer", () => {
    render(<BridgeForm />)
    expect(screen.getByText("Wormhole NTT")).toBeInTheDocument()
  })
})
