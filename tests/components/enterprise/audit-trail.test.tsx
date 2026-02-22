import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { AuditTrail } from "@/components/enterprise/audit-trail"

let mockPayments: unknown[] = []
let mockSwaps: unknown[] = []
let mockVotes: unknown[] = []

vi.mock("@/stores/payment-history", () => ({
  usePaymentHistoryStore: (selector: (state: unknown) => unknown) =>
    selector({ getAll: () => mockPayments }),
}))

vi.mock("@/stores/swap-history", () => ({
  useSwapHistoryStore: (selector: (state: unknown) => unknown) =>
    selector({ swaps: mockSwaps }),
}))

vi.mock("@/stores/governance-history", () => ({
  useGovernanceHistoryStore: (selector: (state: unknown) => unknown) =>
    selector({ votes: mockVotes }),
}))

describe("AuditTrail", () => {
  beforeEach(() => {
    mockPayments = []
    mockSwaps = []
    mockVotes = []
  })

  it("shows empty state when no transactions", () => {
    render(<AuditTrail walletAddress="wallet_abc" />)
    expect(screen.getByText(/no transactions/i)).toBeInTheDocument()
  })

  it("renders payment entries", () => {
    mockPayments = [
      {
        id: "pay_1",
        type: "sent",
        walletAddress: "wallet_abc",
        amount: 1.5,
        token: "SOL",
        txSignature: "tx_pay_1",
        stealthAddress: "stealth_abcdef1234567890",
        recipient: "recipient_1",
        timestamp: 1700000000000,
      },
    ]

    render(<AuditTrail walletAddress="wallet_abc" />)
    expect(screen.getByText(/Sent 1.5 SOL/)).toBeInTheDocument()
    expect(screen.getByText("payment")).toBeInTheDocument()
  })

  it("renders swap entries", () => {
    mockSwaps = [
      {
        id: "swap_1",
        fromToken: "SOL",
        toToken: "USDC",
        fromChain: "solana",
        toChain: "solana",
        fromAmount: "2.5",
        toAmount: "125.00",
        status: "completed",
        txHash: "tx_swap_1",
        timestamp: 1700001000000,
        privacyLevel: "shielded",
      },
    ]

    render(<AuditTrail walletAddress="wallet_abc" />)
    expect(screen.getByText(/SOL → USDC/)).toBeInTheDocument()
    expect(screen.getByText("swap")).toBeInTheDocument()
  })

  it("renders vote entries", () => {
    mockVotes = [
      {
        id: "vote_1",
        proposalId: "prop_1234abcd",
        daoName: "Jupiter",
        proposalTitle: "Increase fees",
        choice: 0,
        choiceLabel: "For",
        weight: "100",
        encryptedVote: {
          ciphertext: "enc",
          nonce: "nonce",
          encryptionKeyHash: "hash",
          proposalId: "prop_1234abcd",
          voter: "voter_1",
          timestamp: 1700002000000,
        },
        encryptionKey: "key_1",
        status: "committed",
        privacyLevel: "shielded",
        startedAt: 1700002000000,
        stepTimestamps: {},
      },
    ]

    render(<AuditTrail walletAddress="wallet_abc" />)
    expect(screen.getByText(/Vote on prop_1234/)).toBeInTheDocument()
    expect(screen.getByText("vote")).toBeInTheDocument()
  })
})
