import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { usePrivacyAction } from "@/hooks/usePrivacyAction"
import type { PrivacyActionResult } from "@/hooks/usePrivacyAction"

// Mock wallet store
const mockWalletStore = { isConnected: true }
vi.mock("@/stores/wallet", () => ({
  useWalletStore: (selector?: (s: typeof mockWalletStore) => unknown) =>
    selector ? selector(mockWalletStore) : mockWalletStore,
}))

// Mock toast store
const mockAddToast = vi.fn()
vi.mock("@/stores/toast", () => ({
  useToastStore: (selector?: (s: { addToast: typeof mockAddToast }) => unknown) =>
    selector ? selector({ addToast: mockAddToast }) : { addToast: mockAddToast },
}))

describe("usePrivacyAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWalletStore.isConnected = true
  })

  it("initializes with idle status", () => {
    const { result } = renderHook(() =>
      usePrivacyAction({ actionType: "bridge" })
    )
    expect(result.current.status).toBe("idle")
    expect(result.current.error).toBeNull()
    expect(result.current.result).toBeNull()
  })

  it("executes action and returns success", async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      usePrivacyAction({ actionType: "bridge", onSuccess })
    )

    const mockResult: PrivacyActionResult = {
      success: true,
      data: { amount: "1.0" },
      txSignature: "mock-sig-123",
    }

    await act(async () => {
      await result.current.execute(async () => mockResult)
    })

    expect(result.current.status).toBe("success")
    expect(result.current.result).toEqual(mockResult)
    expect(result.current.error).toBeNull()
    expect(onSuccess).toHaveBeenCalledWith(mockResult)
  })

  it("handles action failure from result", async () => {
    const onError = vi.fn()
    const { result } = renderHook(() =>
      usePrivacyAction({ actionType: "vote", onError })
    )

    await act(async () => {
      await result.current.execute(async () => ({
        success: false,
        error: "Insufficient funds",
      }))
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("Insufficient funds")
    expect(onError).toHaveBeenCalledWith("Insufficient funds")
    expect(mockAddToast).toHaveBeenCalledWith({
      title: "Insufficient funds",
      type: "error",
    })
  })

  it("handles thrown error in execute function", async () => {
    const onError = vi.fn()
    const { result } = renderHook(() =>
      usePrivacyAction({ actionType: "art_mint", onError })
    )

    await act(async () => {
      await result.current.execute(async () => {
        throw new Error("Network timeout")
      })
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("Network timeout")
    expect(onError).toHaveBeenCalledWith("Network timeout")
    expect(mockAddToast).toHaveBeenCalledWith({
      title: "Network timeout",
      type: "error",
    })
  })

  it("shows error toast when wallet not connected", async () => {
    mockWalletStore.isConnected = false

    const { result } = renderHook(() =>
      usePrivacyAction({ actionType: "social_post" })
    )

    await act(async () => {
      await result.current.execute(async () => ({ success: true }))
    })

    expect(result.current.error).toBe("Wallet not connected")
    expect(mockAddToast).toHaveBeenCalledWith({
      title: "Wallet not connected",
      type: "error",
    })
  })

  it("resets state to idle", async () => {
    const { result } = renderHook(() =>
      usePrivacyAction({ actionType: "bridge" })
    )

    await act(async () => {
      await result.current.execute(async () => ({
        success: true,
        txSignature: "sig-456",
      }))
    })

    expect(result.current.status).toBe("success")

    act(() => result.current.reset())

    expect(result.current.status).toBe("idle")
    expect(result.current.error).toBeNull()
    expect(result.current.result).toBeNull()
  })

  it("defaults error message when action fails without message", async () => {
    const { result } = renderHook(() =>
      usePrivacyAction({ actionType: "loyalty_claim" })
    )

    await act(async () => {
      await result.current.execute(async () => ({ success: false }))
    })

    expect(result.current.error).toBe("Action failed")
  })

  it("handles non-Error thrown values", async () => {
    const { result } = renderHook(() =>
      usePrivacyAction({ actionType: "channel_subscribe" })
    )

    await act(async () => {
      await result.current.execute(async () => {
        throw "string error"
      })
    })

    expect(result.current.error).toBe("Unknown error occurred")
  })
})
