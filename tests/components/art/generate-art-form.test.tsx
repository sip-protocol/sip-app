import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { GenerateArtForm } from "@/components/art/generate-art-form"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({ connected: false, publicKey: null }),
}))

// Mock hooks
vi.mock("@/hooks/use-generate-art", () => ({
  useGenerateArt: () => ({
    status: "idle",
    activeRecord: null,
    generatedArt: null,
    error: null,
    generateArt: vi.fn(),
    reset: vi.fn(),
  }),
}))

describe("GenerateArtForm", () => {
  it("renders the form header", () => {
    render(<GenerateArtForm />)
    expect(screen.getByText("Generate Privacy Art")).toBeInTheDocument()
  })

  it("renders the style selector section", () => {
    render(<GenerateArtForm />)
    expect(screen.getByText("Cipher Bloom")).toBeInTheDocument()
    expect(screen.getByText("Stealth Grid")).toBeInTheDocument()
    expect(screen.getByText("Commitment Flow")).toBeInTheDocument()
  })

  it("shows Connect Wallet when not connected", () => {
    render(<GenerateArtForm />)
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument()
  })

  it("renders the Exchange Art footer", () => {
    render(<GenerateArtForm />)
    expect(screen.getByText("Exchange Art")).toBeInTheDocument()
    expect(screen.getByText("Powered by")).toBeInTheDocument()
  })

  it("renders privacy toggle with shielded default", () => {
    render(<GenerateArtForm />)
    const shieldedElements = screen.getAllByText("Shielded")
    expect(shieldedElements.length).toBeGreaterThanOrEqual(1)
  })
})
