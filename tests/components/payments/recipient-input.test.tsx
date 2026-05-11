import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { PublicKey } from "@solana/web3.js"

// ── Mock class registry (populated inside vi.mock factory) ─────────────────
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

const mockBonfidaResolve = vi.fn()

vi.mock("@bonfida/spl-name-service", () => ({
  resolve: (...args: unknown[]) => mockBonfidaResolve(...args),
}))

// ── Mock @solana/wallet-adapter-react ──────────────────────────────────────

const mockConnection = {}
vi.mock("@solana/wallet-adapter-react", () => ({
  useConnection: () => ({ connection: mockConnection }),
  useWallet: () => ({ publicKey: null, connected: false }),
}))

// ── Mock logger ────────────────────────────────────────────────────────────

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

// ── Fixtures ───────────────────────────────────────────────────────────────

const VALID_SIP =
  "sip:solana:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E"

// 32-byte Uint8Array stubs representing spending/viewing keys
const SPENDING_BYTES = new Uint8Array(32).fill(1)
const VIEWING_BYTES = new Uint8Array(32).fill(2)

// bs58 encode of 32 bytes filled with 0x01 / 0x02
// we don't hard-code the exact base58; we verify the resulting URI shape instead

// ── Helpers ────────────────────────────────────────────────────────────────

async function renderInput(value = "", onChange = vi.fn(), onResolutionChange = vi.fn()) {
  const { RecipientInput } = await import("@/components/payments/recipient-input")
  return render(
    <RecipientInput
      value={value}
      onChange={onChange}
      onResolutionChange={onResolutionChange}
    />,
  )
}

// ── backward compat: validateRecipient ────────────────────────────────────

describe("validateRecipient (backward compat)", () => {
  it("validates correct sip address format", async () => {
    const { validateRecipient } = await import("@/components/payments/recipient-input")
    expect(validateRecipient(VALID_SIP)).toBe(true)
  })

  it("rejects invalid formats", async () => {
    const { validateRecipient } = await import("@/components/payments/recipient-input")
    expect(validateRecipient("")).toBe(false)
    expect(validateRecipient("invalid")).toBe(false)
    expect(validateRecipient("sip:ethereum:abc:def")).toBe(false)
    expect(validateRecipient("0x1234")).toBe(false)
    expect(validateRecipient("alice.sol")).toBe(false) // SNS requires async resolution
  })
})

// ── RecipientInput: rendering ─────────────────────────────────────────────

describe("RecipientInput - rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders with updated placeholder accepting .sol", async () => {
    await renderInput()
    const input = screen.getByRole("textbox")
    expect(input.getAttribute("placeholder")).toMatch(/alice\.sol/)
  })

  it("shows help text when empty", async () => {
    await renderInput()
    expect(screen.getByText(/\.sol domain or SIP stealth/i)).toBeInTheDocument()
  })

  it("calls onChange when typing", async () => {
    const onChange = vi.fn()
    await renderInput("", onChange)
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "alice.sol" } })
    expect(onChange).toHaveBeenCalledWith("alice.sol")
  })

  it("disables input when disabled prop is true", async () => {
    const { RecipientInput } = await import("@/components/payments/recipient-input")
    render(<RecipientInput value="" onChange={() => {}} disabled />)
    expect(screen.getByRole("textbox")).toBeDisabled()
  })
})

// ── RecipientInput: sip: URI (backward compat) ─────────────────────────────

describe("RecipientInput - sip: URI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows green confirmation for valid sip: URI", async () => {
    const onResolutionChange = vi.fn()
    await renderInput(VALID_SIP, vi.fn(), onResolutionChange)

    expect(screen.getByText(/SIP stealth address ready/i)).toBeInTheDocument()
    expect(onResolutionChange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "sip-uri", uri: VALID_SIP }),
    )
  })

  it("shows error for invalid input after blur", async () => {
    await renderInput("not-valid-garbage")
    fireEvent.blur(screen.getByRole("textbox"))
    expect(screen.getByText(/Invalid format/i)).toBeInTheDocument()
  })
})

// ── RecipientInput: SNS resolving state ────────────────────────────────────

describe("RecipientInput - SNS resolving", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Keep mockSnsResolve pending indefinitely so we can inspect the resolving state
    mockSnsResolve.mockReturnValue(new Promise(() => {}))
  })

  it("shows resolving spinner while SNS lookup is in flight", async () => {
    const onResolutionChange = vi.fn()
    await renderInput("alice.sol", vi.fn(), onResolutionChange)

    // Resolving state is set synchronously (before debounce fires)
    expect(onResolutionChange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "sns-resolving", domain: "alice.sol" }),
    )
    expect(screen.getByText(/Resolving alice\.sol/i)).toBeInTheDocument()
  })
})

// ── RecipientInput: SNS resolved ───────────────────────────────────────────

describe("RecipientInput - SNS resolved (SIP-STEALTH record found)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows green confirmation and calls onResolutionChange with sns-resolved", async () => {
    const { MetaAddress } = MockClasses
    mockSnsResolve.mockResolvedValue(
      new (MetaAddress as new (a: object) => { spending: Uint8Array; viewing: Uint8Array })({
        spending: SPENDING_BYTES,
        viewing: VIEWING_BYTES,
        chain: "solana",
        domain: "alice.sol",
      }),
    )

    const onResolutionChange = vi.fn()
    await renderInput("alice.sol", vi.fn(), onResolutionChange)

    await waitFor(() => {
      expect(onResolutionChange).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "sns-resolved", domain: "alice.sol" }),
      )
    })

    await waitFor(() => {
      expect(screen.getByText(/alice\.sol.*private payment available/i)).toBeInTheDocument()
    })
  })

  it("builds a valid sip: URI from MetaAddress bytes", async () => {
    const { MetaAddress } = MockClasses
    mockSnsResolve.mockResolvedValue(
      new (MetaAddress as new (a: object) => unknown)({
        spending: SPENDING_BYTES,
        viewing: VIEWING_BYTES,
        chain: "solana",
        domain: "alice.sol",
      }),
    )

    const onResolutionChange = vi.fn()
    await renderInput("alice.sol", vi.fn(), onResolutionChange)

    await waitFor(() => {
      const calls = onResolutionChange.mock.calls as Array<[{ kind: string; uri?: string }]>
      const resolved = calls.find(([r]) => r.kind === "sns-resolved")
      expect(resolved).toBeDefined()
      const r = resolved![0]
      expect(r.uri).toMatch(/^sip:solana:[1-9A-HJ-NP-Za-km-z]{32,44}:[1-9A-HJ-NP-Za-km-z]{32,44}$/)
    })
  })
})

// ── RecipientInput: SNS not-found-record ───────────────────────────────────

describe("RecipientInput - SNS not-found-record", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { NotFound } = MockClasses
    mockSnsResolve.mockResolvedValue(
      new (NotFound as new (s: string) => unknown)("record"),
    )
  })

  it("shows yellow warning box with domain name", async () => {
    await renderInput("alice.sol")

    await waitFor(() => {
      expect(screen.getByText(/Private payment not available/i)).toBeInTheDocument()
      expect(screen.getByText(/alice\.sol hasn't enabled SIP-STEALTH/i)).toBeInTheDocument()
    })
  })

  it("shows Send Public and Cancel buttons", async () => {
    await renderInput("alice.sol")

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Send Public/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument()
    })
  })

  it("Cancel button calls onChange with empty string", async () => {
    const onChange = vi.fn()
    await renderInput("alice.sol", onChange)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }))
    expect(onChange).toHaveBeenCalledWith("")
  })

  it("Send Public button resolves via Bonfida and shows public address preview", async () => {
    const PUBLIC_KEY = new PublicKey("CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB")
    mockBonfidaResolve.mockResolvedValue(PUBLIC_KEY)

    await renderInput("alice.sol")

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Send Public/i })).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Send Public/i }))
    })

    await waitFor(() => {
      expect(mockBonfidaResolve).toHaveBeenCalledWith(
        mockConnection,
        "alice.sol",
      )
      expect(
        screen.getByText(/CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB/),
      ).toBeInTheDocument()
    })
  })

  it("Send Public shows error when Bonfida resolve throws", async () => {
    mockBonfidaResolve.mockRejectedValue(new Error("Domain not found"))

    await renderInput("alice.sol")

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Send Public/i })).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Send Public/i }))
    })

    await waitFor(() => {
      expect(
        screen.getByText(/Could not look up public address/i),
      ).toBeInTheDocument()
    })
  })

  it("calls onResolutionChange with sns-not-found-record", async () => {
    const onResolutionChange = vi.fn()
    await renderInput("alice.sol", vi.fn(), onResolutionChange)

    await waitFor(() => {
      expect(onResolutionChange).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "sns-not-found-record", domain: "alice.sol" }),
      )
    })
  })
})

// ── RecipientInput: SNS not-found-domain ──────────────────────────────────

describe("RecipientInput - SNS not-found-domain", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { NotFound } = MockClasses
    mockSnsResolve.mockResolvedValue(
      new (NotFound as new (s: string) => unknown)("domain"),
    )
  })

  it("shows red error message", async () => {
    await renderInput("nobody.sol")

    await waitFor(() => {
      expect(screen.getByText(/nobody\.sol not found/i)).toBeInTheDocument()
    })
  })

  it("calls onResolutionChange with sns-not-found-domain", async () => {
    const onResolutionChange = vi.fn()
    await renderInput("nobody.sol", vi.fn(), onResolutionChange)

    await waitFor(() => {
      expect(onResolutionChange).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "sns-not-found-domain", domain: "nobody.sol" }),
      )
    })
  })
})

// ── RecipientInput: SNS malformed ──────────────────────────────────────────

describe("RecipientInput - SNS malformed", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { Malformed } = MockClasses
    mockSnsResolve.mockResolvedValue(
      new (Malformed as new (s: string) => unknown)("json-parse"),
    )
  })

  it("shows red error with reason", async () => {
    await renderInput("broken.sol")

    await waitFor(() => {
      expect(
        screen.getByText(/broken\.sol's privacy record is invalid \(json-parse\)/i),
      ).toBeInTheDocument()
    })
  })

  it("calls onResolutionChange with sns-malformed", async () => {
    const onResolutionChange = vi.fn()
    await renderInput("broken.sol", vi.fn(), onResolutionChange)

    await waitFor(() => {
      expect(onResolutionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "sns-malformed",
          domain: "broken.sol",
          reason: "json-parse",
        }),
      )
    })
  })
})

// ── RecipientInput: network error fallback ────────────────────────────────

describe("RecipientInput - network error", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSnsResolve.mockRejectedValue(new Error("network timeout"))
  })

  it("falls back to sns-not-found-domain on network error", async () => {
    const onResolutionChange = vi.fn()
    await renderInput("alice.sol", vi.fn(), onResolutionChange)

    await waitFor(() => {
      expect(onResolutionChange).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "sns-not-found-domain", domain: "alice.sol" }),
      )
    })
  })
})
