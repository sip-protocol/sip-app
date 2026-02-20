import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TipButton } from "@/components/music/tip-button"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: vi.fn().mockReturnValue({
    publicKey: null,
    connected: false,
    sendTransaction: vi.fn(),
  }),
  useConnection: vi.fn().mockReturnValue({
    connection: {
      rpcEndpoint: "https://api.devnet.solana.com",
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "mock-blockhash",
        lastValidBlockHeight: 100,
      }),
    },
  }),
}))

// Mock stealth transfer
vi.mock("@/lib/solana/stealth-transfer", () => ({
  createStealthTransfer: vi.fn().mockResolvedValue({
    stealthAddress: "StealthAddr123",
    ephemeralPublicKey: "EphemeralPub456",
    commitment: { commitmentHash: "0xcommit789" },
    metaAddress: "sip:solana:meta:addr",
    buildTransaction: vi.fn().mockResolvedValue({ mock: "transaction" }),
    getExplorerUrl: vi
      .fn()
      .mockReturnValue("https://solscan.io/tx/mock?cluster=devnet"),
  }),
}))

// Mock useSolanaTransaction
vi.mock("@/hooks/use-solana-transaction", () => ({
  useSolanaTransaction: vi.fn().mockReturnValue({
    status: "idle",
    txSignature: null,
    explorerUrl: null,
    error: null,
    isWalletConnected: false,
    sendTransaction: vi.fn().mockResolvedValue(null),
    reset: vi.fn(),
  }),
}))

describe("TipButton", () => {
  it("shows 'Tip Artist' button initially", () => {
    render(<TipButton artistName="Test Artist" />)
    expect(screen.getByText("Tip Artist")).toBeInTheDocument()
  })

  it("expands tip form on click", () => {
    render(<TipButton artistName="Test Artist" />)
    fireEvent.click(screen.getByText("Tip Artist"))
    expect(
      screen.getByText(/anonymous tip for test artist/i)
    ).toBeInTheDocument()
  })

  it("shows amount buttons in expanded form", () => {
    render(<TipButton artistName="Test Artist" />)
    fireEvent.click(screen.getByText("Tip Artist"))
    expect(screen.getByText("0.01 SOL")).toBeInTheDocument()
    expect(screen.getByText("0.05 SOL")).toBeInTheDocument()
    expect(screen.getByText("0.1 SOL")).toBeInTheDocument()
  })

  it("shows cancel button in expanded form", () => {
    render(<TipButton artistName="Test Artist" />)
    fireEvent.click(screen.getByText("Tip Artist"))
    expect(screen.getByText("Cancel")).toBeInTheDocument()
  })

  it("collapses form on cancel", () => {
    render(<TipButton artistName="Test Artist" />)
    fireEvent.click(screen.getByText("Tip Artist"))
    fireEvent.click(screen.getByText("Cancel"))
    expect(screen.getByText("Tip Artist")).toBeInTheDocument()
  })

  it("shows Connect Wallet when not connected", () => {
    render(<TipButton artistName="Test Artist" />)
    fireEvent.click(screen.getByText("Tip Artist"))
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument()
  })

  it("disables when disabled prop is true", () => {
    render(<TipButton artistName="Test Artist" disabled />)
    const button = screen.getByText("Tip Artist")
    expect(button).toBeDisabled()
  })
})
