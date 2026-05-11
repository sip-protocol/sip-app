import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { PublicKey } from "@solana/web3.js"

// ── mock class registry (populated inside vi.mock factory) ────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockClasses: Record<string, new (...args: any[]) => unknown> = {}

// ── mocks ───────────────────────────────────────────────────────────────────

const mockReverseLookup = vi.fn()
vi.mock("@bonfida/spl-name-service", () => ({
  reverseLookup: (...args: unknown[]) => mockReverseLookup(...args),
}))

const mockResolve = vi.fn()
const mockPublish = vi.fn()

vi.mock("@/lib/sns-stealth-client", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class MetaAddress { constructor(..._: any[]) {} }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class NotFound { constructor(..._: any[]) {} }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class Malformed { constructor(..._: any[]) {} }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class UserRejected { constructor(..._: any[]) {} }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class NetworkError { constructor(..._: any[]) {} }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class OnChainError { constructor(..._: any[]) {} }

  // Register for outer-scope use
  Object.assign(MockClasses, { MetaAddress, NotFound, Malformed, UserRejected, NetworkError, OnChainError })

  return {
    resolve: (...args: unknown[]) => mockResolve(...args),
    publish: (...args: unknown[]) => mockPublish(...args),
    MetaAddress,
    NotFound,
    Malformed,
    UserRejected,
    NetworkError,
    OnChainError,
    invalidateCache: vi.fn(),
  }
})

const mockGetExplorerUrl = vi.fn((sig: string) => `https://solscan.io/tx/${sig}`)
vi.mock("@/stores/network", () => ({
  useNetworkStore: {
    getState: () => ({ getExplorerUrl: mockGetExplorerUrl }),
  },
}))

const mockConnection = {}
const mockWallet = {
  publicKey: new PublicKey("CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB"),
  connected: true,
  signMessage: vi.fn(),
  sendTransaction: vi.fn(),
}

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => mockWallet,
  useConnection: () => ({ connection: mockConnection }),
}))

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

// ── helpers ──────────────────────────────────────────────────────────────────

const DOMAIN_PUBKEY = "CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB"
const BARE_NAME = "rector"
const FULL_DOMAIN = "rector.sol"

async function renderCard(domainPubkey = DOMAIN_PUBKEY) {
  const { PublishCard } = await import(
    "@/app/(wallet)/wallet/sip-stealth/PublishCard"
  )
  return render(<PublishCard domainPubkey={domainPubkey} />)
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("PublishCard", () => {
  beforeEach(() => {
    vi.resetModules()
    mockReverseLookup.mockReset()
    mockResolve.mockReset()
    mockPublish.mockReset()
    mockGetExplorerUrl.mockImplementation((sig: string) => `https://solscan.io/tx/${sig}`)
  })

  // ── loading state ──────────────────────────────────────────────────────────

  it("shows loading skeleton on mount before resolution completes", async () => {
    mockReverseLookup.mockReturnValue(new Promise(() => {}))

    await renderCard()

    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Loading domain"]')).toBeInTheDocument()
  })

  // ── has-record state ───────────────────────────────────────────────────────

  it("shows 'Private payments enabled' when a MetaAddress record exists", async () => {
    mockReverseLookup.mockResolvedValue(BARE_NAME)
    mockResolve.mockResolvedValue(new MockClasses.MetaAddress())

    await renderCard()

    await waitFor(() => {
      expect(screen.getByText("Private payments enabled")).toBeInTheDocument()
    })
    expect(screen.getByText(FULL_DOMAIN)).toBeInTheDocument()
    // Enable button must NOT be present
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  // ── no-record state ────────────────────────────────────────────────────────

  it("shows Enable button when NotFound is returned", async () => {
    mockReverseLookup.mockResolvedValue(BARE_NAME)
    mockResolve.mockResolvedValue(new MockClasses.NotFound())

    await renderCard()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Enable/i })).toBeInTheDocument()
    })
    expect(screen.getByText(FULL_DOMAIN)).toBeInTheDocument()
    expect(screen.queryByText("Private payments enabled")).not.toBeInTheDocument()
  })

  it("shows Enable button when Malformed is returned", async () => {
    mockReverseLookup.mockResolvedValue(BARE_NAME)
    mockResolve.mockResolvedValue(new MockClasses.Malformed())

    await renderCard()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Enable/i })).toBeInTheDocument()
    })
  })

  // ── publish → success ──────────────────────────────────────────────────────

  it("transitions to published state after successful publish", async () => {
    const SIG = "5MrK1ExAbcDef123456789abcdef"
    mockReverseLookup.mockResolvedValue(BARE_NAME)
    mockResolve.mockResolvedValue(new MockClasses.NotFound())
    mockPublish.mockResolvedValue({ signature: SIG })

    await renderCard()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Enable/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /Enable/i }))

    await waitFor(() => {
      expect(screen.getByText("Published")).toBeInTheDocument()
    })

    // Explorer link
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", `https://solscan.io/tx/${SIG}`)
    expect(link).toHaveAttribute("target", "_blank")
    expect(mockGetExplorerUrl).toHaveBeenCalledWith(SIG)
  })

  it("shows 'Publishing…' in button while in-flight", async () => {
    mockReverseLookup.mockResolvedValue(BARE_NAME)
    mockResolve.mockResolvedValue(new MockClasses.NotFound())
    // Never resolves — keeps publishing state
    mockPublish.mockReturnValue(new Promise(() => {}))

    await renderCard()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Enable/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /Enable/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Publishing/i })).toBeInTheDocument()
    })

    expect(screen.getByRole("button")).toBeDisabled()
  })

  // ── publish → error ────────────────────────────────────────────────────────

  it("shows error message and re-enables button on generic publish failure", async () => {
    mockReverseLookup.mockResolvedValue(BARE_NAME)
    mockResolve.mockResolvedValue(new MockClasses.NotFound())
    mockPublish.mockRejectedValue(new Error("RPC error"))

    await renderCard()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Enable/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /Enable/i }))

    await waitFor(() => {
      expect(screen.getByText("RPC error")).toBeInTheDocument()
    })

    expect(screen.getByRole("button", { name: /Enable/i })).not.toBeDisabled()
  })

  it("shows 'Transaction rejected' for UserRejected error", async () => {
    mockReverseLookup.mockResolvedValue(BARE_NAME)
    mockResolve.mockResolvedValue(new MockClasses.NotFound())
    mockPublish.mockRejectedValue(new MockClasses.UserRejected())

    await renderCard()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Enable/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /Enable/i }))

    await waitFor(() => {
      expect(screen.getByText("Transaction rejected")).toBeInTheDocument()
    })
  })

  // ── error loading card ─────────────────────────────────────────────────────

  it("shows error card when reverseLookup throws", async () => {
    mockReverseLookup.mockRejectedValue(new Error("Domain not found"))

    await renderCard()

    await waitFor(() => {
      expect(screen.getByText("Domain not found")).toBeInTheDocument()
    })

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  // ── publish passes correct args ────────────────────────────────────────────

  it("calls publish with connection, full domain, and wallet", async () => {
    mockReverseLookup.mockResolvedValue(BARE_NAME)
    mockResolve.mockResolvedValue(new MockClasses.NotFound())
    mockPublish.mockResolvedValue({ signature: "sig123" })

    await renderCard()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Enable/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /Enable/i }))

    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith(mockConnection, FULL_DOMAIN, mockWallet)
    })
  })
})
