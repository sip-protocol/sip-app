import { describe, it, expect } from "vitest"
import {
  scanWallet,
  createProtocolSource,
  createManualSource,
} from "@/lib/migrations/dead-protocol-scanner"
import { DEAD_PROTOCOLS } from "@/lib/migrations/constants"

describe("dead-protocol-scanner", () => {
  describe("scanWallet", () => {
    it("returns SOL balance and sources", async () => {
      const result = await scanWallet("MockWalletAddress123")

      expect(result.solBalance).toBeGreaterThan(0)
      expect(result.sources).toHaveLength(1)
      expect(result.sources[0].type).toBe("manual")
      expect(result.sources[0].token).toBe("SOL")
    })

    it("manual source has balance", async () => {
      const result = await scanWallet("MockWalletAddress123")
      const manual = result.sources[0]

      expect(parseFloat(manual.balance)).toBeGreaterThan(0)
    })
  })

  describe("createProtocolSource", () => {
    it("creates source with protocol", () => {
      const protocol = DEAD_PROTOCOLS.find((p) => p.id === "saber")!
      const source = createProtocolSource(protocol, "5.5")

      expect(source.protocol).toEqual(protocol)
      expect(source.type).toBe("protocol")
      expect(source.balance).toBe("5.5")
      expect(source.token).toBe("SOL")
    })

    it("defaults balance to 0", () => {
      const protocol = DEAD_PROTOCOLS.find((p) => p.id === "saber")!
      const source = createProtocolSource(protocol)

      expect(source.balance).toBe("0")
    })
  })

  describe("createManualSource", () => {
    it("creates manual source with balance", () => {
      const source = createManualSource("10.5")

      expect(source.protocol).toBeNull()
      expect(source.type).toBe("manual")
      expect(source.balance).toBe("10.5")
      expect(source.token).toBe("SOL")
    })
  })
})
