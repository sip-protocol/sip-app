import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { TransactionStatus } from "@/components/solana/transaction-status"

describe("TransactionStatus", () => {
  it("renders nothing when idle", () => {
    const { container } = render(
      <TransactionStatus
        status="idle"
        txSignature={null}
        explorerUrl={null}
        error={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it("shows signing message", () => {
    render(
      <TransactionStatus
        status="signing"
        txSignature={null}
        explorerUrl={null}
        error={null}
      />
    )
    expect(screen.getByText(/signing/i)).toBeInTheDocument()
  })

  it("shows sending message", () => {
    render(
      <TransactionStatus
        status="sending"
        txSignature={null}
        explorerUrl={null}
        error={null}
      />
    )
    expect(screen.getByText(/sending/i)).toBeInTheDocument()
  })

  it("shows confirming message", () => {
    render(
      <TransactionStatus
        status="confirming"
        txSignature={null}
        explorerUrl={null}
        error={null}
      />
    )
    expect(screen.getByText(/confirming/i)).toBeInTheDocument()
  })

  it("shows confirmed with explorer link", () => {
    render(
      <TransactionStatus
        status="confirmed"
        txSignature="5xMockSignature123abc456def789ghi"
        explorerUrl="https://solscan.io/tx/5xMockSignature123abc456def789ghi?cluster=devnet"
        error={null}
      />
    )
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument()
    const link = screen.getByRole("link")
    expect(link.getAttribute("href")).toContain("solscan.io")
    expect(link.getAttribute("target")).toBe("_blank")
  })

  it("shows truncated signature when confirmed", () => {
    render(
      <TransactionStatus
        status="confirmed"
        txSignature="5xMockSignature123abc456def789ghi"
        explorerUrl="https://solscan.io/tx/5xMockSignature123abc456def789ghi?cluster=devnet"
        error={null}
      />
    )
    // Should show truncated: first 8...last 8
    expect(screen.getByText(/5xMockSi/)).toBeInTheDocument()
  })

  it("shows error message", () => {
    render(
      <TransactionStatus
        status="error"
        txSignature={null}
        explorerUrl={null}
        error="Insufficient balance"
      />
    )
    expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument()
  })

  it("shows building message", () => {
    render(
      <TransactionStatus
        status="building"
        txSignature={null}
        explorerUrl={null}
        error={null}
      />
    )
    expect(screen.getByText(/building/i)).toBeInTheDocument()
  })
})
