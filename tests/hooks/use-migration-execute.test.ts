import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useMigrationExecute } from "@/hooks/use-migration-execute"
import { PrivacyLevel } from "@sip-protocol/types"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => "MockPublicKey123" },
    signTransaction: vi.fn(),
  }),
}))

// Mock stealth generation
vi.mock("@/lib/migrations/stealth-migration", () => ({
  generateMigrationStealthAddress: vi.fn().mockResolvedValue({
    stealthAddress: "sip:solana:mock-stealth",
    stealthMetaAddress: "sip:solana:meta:mock-meta",
    spendingPrivateKey: "mock-spending-key",
    viewingPrivateKey: "mock-viewing-key",
    sharedSecret: "mock-secret",
  }),
}))

describe("useMigrationExecute", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useMigrationExecute())
    expect(result.current.status).toBe("idle")
    expect(result.current.activeMigration).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("sets scanning status when migrating", async () => {
    const { result } = renderHook(() => useMigrationExecute())

    act(() => {
      result.current.migrate({
        source: { protocol: null, type: "manual", balance: "10", token: "SOL" },
        amount: "1.0",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("scanning_wallet")
  })

  it("validates amount before execution", async () => {
    const { result } = renderHook(() => useMigrationExecute())

    await act(async () => {
      await result.current.migrate({
        source: { protocol: null, type: "manual", balance: "10", token: "SOL" },
        amount: "0",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("Amount must be greater than 0")
  })

  it("completes migration successfully", async () => {
    const { result } = renderHook(() => useMigrationExecute())

    await act(async () => {
      const promise = result.current.migrate({
        source: { protocol: null, type: "manual", balance: "10", token: "SOL" },
        amount: "1.0",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
      await vi.advanceTimersByTimeAsync(20000)
      await promise
    })

    expect(result.current.status).toBe("complete")
    expect(result.current.activeMigration).toBeTruthy()
    expect(result.current.activeMigration?.stealthAddress).toBe(
      "sip:solana:mock-stealth"
    )
  })

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useMigrationExecute())

    await act(async () => {
      const promise = result.current.migrate({
        source: { protocol: null, type: "manual", balance: "10", token: "SOL" },
        amount: "1.0",
        privacyLevel: PrivacyLevel.SHIELDED,
      })
      await vi.advanceTimersByTimeAsync(20000)
      await promise
    })

    expect(result.current.status).toBe("complete")

    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe("idle")
    expect(result.current.activeMigration).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
