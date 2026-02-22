import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ComplianceDashboard } from "@/components/enterprise/compliance-dashboard"

// Mock wallet adapter
let mockPublicKey: { toBase58: () => string } | null = { toBase58: () => "wallet123" }

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({ publicKey: mockPublicKey, connected: !!mockPublicKey }),
  useConnection: () => ({ connection: {} }),
}))

// Mock wallet store
let mockWalletStore = { address: "wallet123", isConnected: true }

vi.mock("@/stores/wallet", () => ({
  useWalletStore: () => mockWalletStore,
}))

// Mock history stores
vi.mock("@/stores/payment-history", () => ({
  usePaymentHistoryStore: (sel: (state: unknown) => unknown) => sel({ getAll: () => [] }),
}))

vi.mock("@/stores/swap-history", () => ({
  useSwapHistoryStore: (sel: (state: unknown) => unknown) => sel({ swaps: [] }),
}))

vi.mock("@/stores/governance-history", () => ({
  useGovernanceHistoryStore: (sel: (state: unknown) => unknown) => sel({ votes: [] }),
}))

// Mock viewing key hooks
vi.mock("@/hooks/use-viewing-key-disclosure", () => ({
  useViewingKeyDisclosure: () => ({
    keys: [],
    generateKey: vi.fn(),
    removeKey: vi.fn(),
  }),
}))

vi.mock("@/hooks/use-viewing-key-storage", () => ({
  useViewingKeyStorage: () => ({ keys: [], isLoaded: true }),
}))

vi.mock("@/hooks/use-stealth-keys", () => ({
  useStealthKeys: () => ({ keys: null }),
}))

describe("ComplianceDashboard", () => {
  beforeEach(() => {
    mockPublicKey = { toBase58: () => "wallet123" }
    mockWalletStore = { address: "wallet123", isConnected: true }
  })

  it("renders all three tab buttons", () => {
    render(<ComplianceDashboard />)
    const buttons = screen.getAllByRole("button")
    const tabLabels = buttons.map((b) => b.textContent?.trim())
    expect(tabLabels).toContain("📋Audit Trail")
    expect(tabLabels).toContain("🔑Viewing Keys")
    expect(tabLabels).toContain("📥Export")
  })

  it("renders stats section with labels", () => {
    render(<ComplianceDashboard />)
    expect(screen.getByText("Payments")).toBeInTheDocument()
    expect(screen.getByText("Swaps")).toBeInTheDocument()
    expect(screen.getByText("Votes")).toBeInTheDocument()
    // "Viewing Keys" appears in both stats and tabs
    expect(screen.getAllByText("Viewing Keys").length).toBeGreaterThanOrEqual(2)
  })

  it("shows audit trail tab by default", () => {
    render(<ComplianceDashboard />)
    // AuditTrail shows "No transactions" when entries are empty
    expect(screen.getByText(/no transactions/i)).toBeInTheDocument()
  })

  it("switches to viewing keys tab on click", () => {
    render(<ComplianceDashboard />)
    // "Viewing Keys" appears in both stats and tab — click the button
    const viewingKeysButtons = screen.getAllByText("Viewing Keys")
    const tabButton = viewingKeysButtons.find((el) => el.closest("button"))!
    fireEvent.click(tabButton)
    // ShareKeyPanel shows "No viewing keys yet" in empty state
    expect(screen.getByText(/no viewing keys yet/i)).toBeInTheDocument()
  })

  it("switches to export tab on click", () => {
    render(<ComplianceDashboard />)
    fireEvent.click(screen.getByText("Export"))
    // ExportReportPanel shows generate button
    expect(screen.getByText(/generate & download report/i)).toBeInTheDocument()
  })

  it("shows connect wallet state when not connected", () => {
    mockPublicKey = null
    mockWalletStore = { address: null as unknown as string, isConnected: false }
    render(<ComplianceDashboard />)
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument()
    expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument()
  })
})
