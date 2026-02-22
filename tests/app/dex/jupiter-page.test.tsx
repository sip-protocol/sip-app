import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({ publicKey: null, signTransaction: null, connected: false }),
  useConnection: () => ({ connection: {} }),
}))

vi.mock("@/stores", () => ({
  useWalletStore: () => ({
    isConnected: false,
    address: null,
    openModal: vi.fn(),
  }),
}))

vi.mock("@/stores/toast", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock("@/lib", () => ({
  getSDK: vi.fn().mockResolvedValue({
    generateEd25519StealthMetaAddress: () => ({
      metaAddress: { spendingPublicKey: "sp", viewingPublicKey: "vp" },
      viewingPrivateKey: "vk",
    }),
    generateEd25519StealthAddress: () => ({
      stealthAddress: { address: "stealth123", ephemeralPublicKey: "eph123" },
    }),
  }),
}))

vi.mock("@/lib/dex/jupiter-client", () => ({
  getJupiterSwapTransaction: vi.fn(),
}))

describe("JupiterPage", () => {
  it("shows connect wallet prompt when not connected", async () => {
    const { default: JupiterPage } = await import(
      "@/app/(dex)/dex/jupiter/page"
    )
    render(<JupiterPage />)
    const elements = screen.getAllByText("Connect Wallet")
    expect(elements.length).toBeGreaterThan(0)
  })
})
