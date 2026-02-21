import { describe, it, expect } from "vitest"

describe("useWalletAccountChange", () => {
  it("exports the hook", async () => {
    const mod = await import("@/hooks/use-wallet-account-change")
    expect(typeof mod.useWalletAccountChange).toBe("function")
  })
})
