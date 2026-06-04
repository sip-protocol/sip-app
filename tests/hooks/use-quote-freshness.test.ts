import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"

// useQuote pulls the SIP client + wallet store; stub both — the no-quote
// freshness-reset path under test never reaches the network.
vi.mock("@/contexts", () => ({
  useSIP: () => ({ client: {}, isProductionMode: false }),
}))
vi.mock("@/stores", async (orig) => ({
  ...(await orig<typeof import("@/stores")>()),
  useWalletStore: () => ({ address: null, chain: null }),
}))

import { useQuote } from "@/hooks/use-quote"

describe("useQuote freshness", () => {
  it("reports expired freshness and null expiresIn when there is no quote", async () => {
    const { result } = renderHook(() => useQuote(null))

    await waitFor(() => expect(result.current.freshness).toBe("expired"))
    expect(result.current.expiresIn).toBeNull()
    expect(result.current.quote).toBeNull()
  })
})
