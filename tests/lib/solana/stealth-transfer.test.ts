import { describe, it, expect, vi, beforeEach } from "vitest"

// Track calls for assertions
const mockAdd = vi.fn().mockReturnThis()
const mockGetLatestBlockhash = vi.fn().mockResolvedValue({
  blockhash: "mock-blockhash-" + "a".repeat(32),
  lastValidBlockHeight: 123456,
})
const mockSetComputeUnitLimit = vi.fn().mockReturnValue({
  programId: "ComputeBudget111111111111111111111111111111",
  type: "setComputeUnitLimit",
})
const mockSetComputeUnitPrice = vi.fn().mockReturnValue({
  programId: "ComputeBudget111111111111111111111111111111",
  type: "setComputeUnitPrice",
})
const mockBuildShieldedTransferInstruction = vi.fn().mockResolvedValue({
  programId: "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at",
  type: "shieldedTransfer",
})

vi.mock("@solana/web3.js", () => {
  class MockPublicKey {
    _key: string
    constructor(key: string) {
      this._key = key
    }
    toBase58() {
      return this._key
    }
    toString() {
      return this._key
    }
    toBuffer() {
      return Buffer.alloc(32)
    }
  }

  class MockTransaction {
    feePayer: unknown = null
    recentBlockhash: unknown = null
    constructor(_opts?: unknown) {}
    add(...args: unknown[]) {
      mockAdd(...args)
      return this
    }
  }

  class MockConnection {
    constructor(_url: string, _commitment?: string) {}
    getLatestBlockhash = mockGetLatestBlockhash
  }

  return {
    PublicKey: MockPublicKey,
    Transaction: MockTransaction,
    Connection: MockConnection,
    ComputeBudgetProgram: {
      setComputeUnitLimit: mockSetComputeUnitLimit,
      setComputeUnitPrice: mockSetComputeUnitPrice,
    },
  }
})

vi.mock("@/lib/solana/program-client", () => ({
  buildShieldedTransferInstruction: mockBuildShieldedTransferInstruction,
}))

vi.mock("@/lib/crypto-helpers", () => ({
  createRealCommitment: vi.fn().mockResolvedValue({
    commitmentHash: "0x" + "ab".repeat(33),
    commitmentDisplay: "ab...ab",
    blindingFactor: "0x" + "cd".repeat(32),
  }),
}))

// Mock SIP SDK (same pattern as music/governance tests)
vi.mock("@sip-protocol/sdk", () => ({
  generateStealthMetaAddress: () => ({
    metaAddress: {
      spendingPublicKey: "0x" + "aa".repeat(32),
      viewingPublicKey: "0x" + "bb".repeat(32),
    },
    spendingPrivateKey: "0x" + "cc".repeat(32),
    viewingPrivateKey: "0x" + "dd".repeat(32),
  }),
  generateStealthAddress: () => ({
    stealthAddress: {
      address: "0x" + "ee".repeat(32),
      ephemeralPublicKey: "0x" + "11".repeat(33),
      viewTag: 42,
    },
    sharedSecret: "0x" + "ff".repeat(32),
  }),
  encodeStealthMetaAddress: () => "st:sol:0x" + "ab".repeat(32),
  createCommitment: () => ({
    value: "0x" + "ab".repeat(32),
    blindingFactor: "0x" + "cd".repeat(32),
  }),
}))

vi.mock("@/lib/sip-client", () => ({
  getSDK: async () => {
    const sdk = await import("@sip-protocol/sdk")
    return sdk
  },
}))

describe("createStealthTransfer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a valid stealth address", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })

    expect(result.stealthAddress).toBeTruthy()
    expect(typeof result.stealthAddress).toBe("string")
    // Should be a raw address (no sip: prefix) — ready for Solana PublicKey
    expect(result.stealthAddress).not.toContain("sip:")
  })

  it("returns ephemeral public key", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({ amountLamports: 500_000 })

    expect(result.ephemeralPublicKey).toBeTruthy()
    expect(typeof result.ephemeralPublicKey).toBe("string")
  })

  it("returns a valid Pedersen commitment", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })

    expect(result.commitment).toBeDefined()
    expect(result.commitment.commitmentHash).toMatch(/^0x/)
    expect(result.commitment.blindingFactor).toMatch(/^0x/)
    expect(result.commitment.commitmentDisplay).toContain("...")
  })

  it("returns encoded meta address", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })

    expect(result.metaAddress).toBeTruthy()
    expect(result.metaAddress).toContain("st:sol:")
  })

  it("returns buildTransaction function", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })

    expect(typeof result.buildTransaction).toBe("function")
  })

  it("returns getExplorerUrl function", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })

    expect(typeof result.getExplorerUrl).toBe("function")
  })
})

describe("buildTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a Transaction object", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")
    const { PublicKey } = await import("@solana/web3.js")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })
    const senderPubkey = new PublicKey(
      "SenderPubkey111111111111111111111111111111"
    )
    const tx = await result.buildTransaction(
      senderPubkey,
      "https://api.devnet.solana.com"
    )

    expect(tx).toBeDefined()
    // Should have called add() for CU limit + CU price + shielded transfer
    expect(mockAdd).toHaveBeenCalled()
  })

  it("calls buildShieldedTransferInstruction", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")
    const { PublicKey } = await import("@solana/web3.js")

    const result = await createStealthTransfer({ amountLamports: 2_000_000 })
    const senderPubkey = new PublicKey(
      "SenderPubkey111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

    expect(mockBuildShieldedTransferInstruction).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: senderPubkey,
        actualAmount: BigInt(2_000_000),
      })
    )
  })

  it("fetches a recent blockhash from the provided RPC", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")
    const { PublicKey } = await import("@solana/web3.js")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })
    const senderPubkey = new PublicKey(
      "SenderPubkey111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

    expect(mockGetLatestBlockhash).toHaveBeenCalledWith("confirmed")
  })

  it("adds compute budget + shielded_transfer instructions (3 calls to add)", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")
    const { PublicKey } = await import("@solana/web3.js")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })
    const senderPubkey = new PublicKey(
      "SenderPubkey111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

    // CU limit + CU price + shielded transfer = 3 calls to add()
    expect(mockAdd).toHaveBeenCalledTimes(3)
    expect(mockSetComputeUnitLimit).toHaveBeenCalledWith({ units: 300_000 })
    expect(mockSetComputeUnitPrice).toHaveBeenCalledWith({
      microLamports: 50_000,
    })
    expect(mockBuildShieldedTransferInstruction).toHaveBeenCalled()
  })
})

describe("getExplorerUrl", () => {
  it("generates mainnet Solscan URL by default", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })
    const url = result.getExplorerUrl("5abc123def")

    expect(url).toBe("https://solscan.io/tx/5abc123def")
  })

  it("generates mainnet Solscan URL when cluster is mainnet-beta", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })
    const url = result.getExplorerUrl("5abc123def", "mainnet-beta")

    expect(url).toBe("https://solscan.io/tx/5abc123def")
  })

  it("generates devnet Solscan URL when cluster is devnet", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({ amountLamports: 1_000_000 })
    const url = result.getExplorerUrl("txhash999", "devnet")

    expect(url).toBe("https://solscan.io/tx/txhash999?cluster=devnet")
  })
})
