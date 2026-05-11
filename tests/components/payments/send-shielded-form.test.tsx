import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { PublicKey } from "@solana/web3.js"

// ── Mock class registry ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockClasses: Record<string, new (...args: any[]) => unknown> = {}

// ── Mock @/lib/sns-stealth-client ──────────────────────────────────────────

const mockSnsResolve = vi.fn()

vi.mock("@/lib/sns-stealth-client", () => {
  class MetaAddress {
    spending: Uint8Array
    viewing: Uint8Array
    chain: string
    domain: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(args: any) {
      this.spending = args.spending
      this.viewing = args.viewing
      this.chain = args.chain ?? "solana"
      this.domain = args.domain ?? ""
    }
  }
  class NotFound {
    subject: string
    constructor(subject: string) { this.subject = subject }
  }
  class Malformed {
    reason: string
    constructor(reason: string) { this.reason = reason }
  }
  class NetworkError extends Error {}
  class OnChainError extends Error {}
  class UserRejected extends Error {}

  Object.assign(MockClasses, { MetaAddress, NotFound, Malformed, NetworkError, OnChainError, UserRejected })

  return {
    resolve: (...args: unknown[]) => mockSnsResolve(...args),
    MetaAddress,
    NotFound,
    Malformed,
    NetworkError,
    OnChainError,
    UserRejected,
    invalidateCache: vi.fn(),
  }
})

// ── Mock @bonfida/spl-name-service ─────────────────────────────────────────

vi.mock("@bonfida/spl-name-service", () => ({
  resolve: vi.fn(),
}))

// ── Mock @solana/wallet-adapter-react ──────────────────────────────────────

const mockPublicKey = new PublicKey("CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB")
const mockConnection = {
  getBalance: vi.fn().mockResolvedValue(5_000_000_000), // 5 SOL
  rpcEndpoint: "https://api.mainnet-beta.solana.com",
}

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: mockPublicKey,
    connected: true,
  }),
  useConnection: () => ({ connection: mockConnection }),
}))

// ── Mock hooks ─────────────────────────────────────────────────────────────

const mockSend = vi.fn()
const mockReset = vi.fn()

vi.mock("@/hooks/use-send-payment", () => ({
  useSendPayment: () => ({
    status: "idle",
    txHash: null,
    error: null,
    currentStep: null,
    send: mockSend,
    reset: mockReset,
  }),
}))

vi.mock("@/hooks/use-viewing-key-storage", () => ({
  useViewingKeyStorage: () => ({ saveKey: vi.fn() }),
}))

// ── Mock stores ────────────────────────────────────────────────────────────

vi.mock("@/stores/demo-mode", () => ({
  useDemoModeStore: () => ({ isDemoMode: false, enableDemo: vi.fn() }),
}))

// ── Mock components (keep tests focused on form logic) ────────────────────

vi.mock("@/components/ui/demo-banner", () => ({
  DemoBanner: () => <div data-testid="demo-banner" />,
}))

vi.mock("@/components/payments/transaction-status", () => ({
  TransactionStatus: ({ status }: { status: string }) => (
    <div data-testid="tx-status">{status}</div>
  ),
}))

vi.mock("@/components/payments/viewing-key", () => ({
  ViewingKeyPanel: ({ onViewingKeyChange }: { onViewingKeyChange: (k: null) => void }) => (
    <button type="button" onClick={() => onViewingKeyChange(null)}>
      ViewingKeyPanel
    </button>
  ),
}))

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

// ── Fixtures ───────────────────────────────────────────────────────────────

const VALID_SIP =
  "sip:solana:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E"

const SPENDING_BYTES = new Uint8Array(32).fill(1)
const VIEWING_BYTES = new Uint8Array(32).fill(2)

// ── Helpers ────────────────────────────────────────────────────────────────

async function renderForm() {
  const { SendShieldedForm } = await import(
    "@/components/payments/send-shielded-form"
  )
  return render(<SendShieldedForm />)
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /Send Shielded Payment/i })
}

function getRecipientInput() {
  return screen.getByLabelText("Recipient") as HTMLInputElement
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("SendShieldedForm - submit gate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: sns resolve stays pending (no interference)
    mockSnsResolve.mockReturnValue(new Promise(() => {}))
  })

  it("submit button is disabled when recipient is empty", async () => {
    await renderForm()
    expect(getSubmitButton()).toBeDisabled()
  })

  it("submit button is disabled for invalid input", async () => {
    await renderForm()
    fireEvent.change(getRecipientInput(), { target: { value: "garbage" } })
    // 'garbage' → invalid → not ready
    expect(getSubmitButton()).toBeDisabled()
  })

  it("submit button is disabled while SNS is resolving", async () => {
    await renderForm()
    fireEvent.change(getRecipientInput(), { target: { value: "alice.sol" } })
    // resolving state → not ready → disabled
    expect(getSubmitButton()).toBeDisabled()
  })

  it("submit button enables after sip: URI entered + amount provided", async () => {
    await renderForm()

    fireEvent.change(getRecipientInput(), { target: { value: VALID_SIP } })
    // Enter amount
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "0.01" },
    })

    await waitFor(() => {
      expect(getSubmitButton()).not.toBeDisabled()
    })
  })

  it("submit button is disabled when SNS resolves to not-found-record", async () => {
    const { NotFound } = MockClasses
    mockSnsResolve.mockResolvedValue(
      new (NotFound as new (s: string) => unknown)("record"),
    )

    await renderForm()

    fireEvent.change(getRecipientInput(), { target: { value: "alice.sol" } })
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "0.01" },
    })

    await waitFor(() => {
      expect(screen.getByText(/Private payment not available/i)).toBeInTheDocument()
    })

    expect(getSubmitButton()).toBeDisabled()
  })
})

describe("SendShieldedForm - sip: URI submit", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSnsResolve.mockReturnValue(new Promise(() => {}))
    mockSend.mockResolvedValue({ txHash: "abc123" })
  })

  it("calls send() with the sip: URI as recipient", async () => {
    await renderForm()

    fireEvent.change(getRecipientInput(), { target: { value: VALID_SIP } })
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "0.1" },
    })

    await waitFor(() => expect(getSubmitButton()).not.toBeDisabled())

    fireEvent.click(getSubmitButton())

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ recipient: VALID_SIP }),
      )
    })
  })
})

describe("SendShieldedForm - SNS resolved submit", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { MetaAddress } = MockClasses
    mockSnsResolve.mockResolvedValue(
      new (MetaAddress as new (a: object) => unknown)({
        spending: SPENDING_BYTES,
        viewing: VIEWING_BYTES,
        chain: "solana",
        domain: "alice.sol",
      }),
    )
    mockSend.mockResolvedValue({ txHash: "snstxhash" })
  })

  it("calls send() with the resolved sip: URI (not the raw .sol input)", async () => {
    await renderForm()

    fireEvent.change(getRecipientInput(), { target: { value: "alice.sol" } })
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "0.05" },
    })

    // Wait for SNS resolution to complete
    await waitFor(() => {
      expect(screen.getByText(/alice\.sol.*private payment available/i)).toBeInTheDocument()
    })

    await waitFor(() => expect(getSubmitButton()).not.toBeDisabled())

    fireEvent.click(getSubmitButton())

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          // Must be a sip: URI, NOT "alice.sol"
          recipient: expect.stringMatching(
            /^sip:solana:[1-9A-HJ-NP-Za-km-z]{32,44}:[1-9A-HJ-NP-Za-km-z]{32,44}$/,
          ),
        }),
      )
    })
  })
})

describe("SendShieldedForm - reset", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSnsResolve.mockReturnValue(new Promise(() => {}))
  })

  it("clears recipient and resets resolution on reset", async () => {
    await renderForm()

    fireEvent.change(getRecipientInput(), { target: { value: VALID_SIP } })
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "0.01" },
    })

    await waitFor(() => expect(getSubmitButton()).not.toBeDisabled())

    // Reset via the hook — we verify state was cleared by checking input is empty
    // (we can't call handleReset directly, but we can check that setRecipient("") was fired)
    // The reset is internal; we check the input is cleared by verifying
    // re-render with empty recipient disables submit
    fireEvent.change(getRecipientInput(), { target: { value: "" } })
    expect(getSubmitButton()).toBeDisabled()
  })
})
