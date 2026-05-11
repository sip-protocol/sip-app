import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { PublicKey } from "@solana/web3.js"

// ── mocks ───────────────────────────────────────────────────────────────────

const mockGetAllDomains = vi.fn()
vi.mock("@bonfida/spl-name-service", () => ({
  getAllDomains: (...args: unknown[]) => mockGetAllDomains(...args),
}))

// PublishCard is a complex child — stub it so page tests stay focused
vi.mock(
  "@/app/(wallet)/wallet/sip-stealth/PublishCard",
  () => ({
    PublishCard: ({ domainPubkey }: { domainPubkey: string }) => (
      <div data-testid={`publish-card-${domainPubkey}`}>card-{domainPubkey.slice(0, 4)}</div>
    ),
  }),
)

const mockConnection = {}
let mockWallet = {
  publicKey: null as PublicKey | null,
  connected: false,
}

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => mockWallet,
  useConnection: () => ({ connection: mockConnection }),
}))

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

// ── helpers ──────────────────────────────────────────────────────────────────

const PUBKEY_A = new PublicKey("CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB")
const PUBKEY_B = new PublicKey("7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E")

async function renderPage() {
  const { default: SipStealthPage } = await import(
    "@/app/(wallet)/wallet/sip-stealth/page"
  )
  return render(<SipStealthPage />)
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("SipStealthPage", () => {
  beforeEach(() => {
    vi.resetModules()
    mockGetAllDomains.mockReset()
    mockWallet = { publicKey: null, connected: false }
  })

  it("shows wallet-not-connected state when wallet is disconnected", async () => {
    await renderPage()
    expect(screen.getByText("Connect your wallet")).toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    expect(mockGetAllDomains).not.toHaveBeenCalled()
  })

  it("shows page header regardless of wallet state", async () => {
    await renderPage()
    expect(screen.getByText("Enable Private Payments")).toBeInTheDocument()
  })

  it("shows loading state while domains are being fetched", async () => {
    mockWallet = { publicKey: PUBKEY_A, connected: true }
    // Don't resolve yet
    mockGetAllDomains.mockReturnValue(new Promise(() => {}))

    await renderPage()

    // Loading state is set via queueMicrotask, so wait for it
    await waitFor(() => {
      const skeletons = document.querySelectorAll('[aria-hidden="true"]')
      expect(skeletons.length).toBe(3)
    })
  })

  it("shows empty state when user has no .sol domains", async () => {
    mockWallet = { publicKey: PUBKEY_A, connected: true }
    mockGetAllDomains.mockResolvedValue([])

    await renderPage()

    await waitFor(() => {
      expect(screen.getByText("No .sol domains found")).toBeInTheDocument()
    })
    expect(screen.getByText(/Get a .sol domain/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Get a .sol domain/ })).toHaveAttribute(
      "href",
      "https://sns.id",
    )
  })

  it("renders a PublishCard for each domain when domains are loaded", async () => {
    mockWallet = { publicKey: PUBKEY_A, connected: true }
    mockGetAllDomains.mockResolvedValue([PUBKEY_A, PUBKEY_B])

    await renderPage()

    await waitFor(() => {
      expect(
        screen.getByTestId(`publish-card-${PUBKEY_A.toBase58()}`),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId(`publish-card-${PUBKEY_B.toBase58()}`),
      ).toBeInTheDocument()
    })
  })

  it("shows error state when getAllDomains rejects", async () => {
    mockWallet = { publicKey: PUBKEY_A, connected: true }
    mockGetAllDomains.mockRejectedValue(new Error("RPC timeout"))

    await renderPage()

    await waitFor(() => {
      expect(screen.getByText("Failed to load domains")).toBeInTheDocument()
      expect(screen.getByText("RPC timeout")).toBeInTheDocument()
    })
  })

  it("does not call getAllDomains when wallet disconnects mid-render", async () => {
    // Start disconnected — transition to connected is out of scope here,
    // but we verify disconnected path stays inert.
    mockWallet = { publicKey: null, connected: false }
    await renderPage()
    expect(mockGetAllDomains).not.toHaveBeenCalled()
  })

  it("passes correct connection and publicKey to getAllDomains", async () => {
    mockWallet = { publicKey: PUBKEY_A, connected: true }
    mockGetAllDomains.mockResolvedValue([])

    await renderPage()

    await waitFor(() => {
      expect(mockGetAllDomains).toHaveBeenCalledWith(mockConnection, PUBKEY_A)
    })
  })
})
