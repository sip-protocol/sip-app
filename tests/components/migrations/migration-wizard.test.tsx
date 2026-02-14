import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MigrationWizard } from "@/components/migrations/migration-wizard"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    connected: false,
    publicKey: null,
  }),
}))

// Mock stealth generation
vi.mock("@/lib/migrations/stealth-migration", () => ({
  generateMigrationStealthAddress: vi.fn().mockResolvedValue({
    stealthAddress: "sip:solana:mock",
    stealthMetaAddress: "sip:solana:meta:mock",
    spendingPrivateKey: "key",
    viewingPrivateKey: "key",
    sharedSecret: "secret",
  }),
}))

describe("MigrationWizard", () => {
  it("renders the form", () => {
    render(<MigrationWizard />)
    expect(screen.getByText("Source Protocol")).toBeTruthy()
    expect(screen.getByText("Amount (SOL)")).toBeTruthy()
  })

  it("shows connect wallet message when not connected", () => {
    render(<MigrationWizard />)
    expect(screen.getByText("Connect Wallet to Migrate")).toBeTruthy()
  })

  it("shows protocol selector", () => {
    render(<MigrationWizard />)
    expect(screen.getByText("Saber")).toBeTruthy()
    expect(screen.getByText("Manual SOL Entry")).toBeTruthy()
  })

  it("shows footer with Sunrise Stake info", () => {
    render(<MigrationWizard />)
    expect(screen.getByText("Sunrise Stake")).toBeTruthy()
    expect(screen.getByText("gSOL (green SOL)")).toBeTruthy()
  })
})
