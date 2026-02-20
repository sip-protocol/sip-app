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

const mockKeypairGenerate = vi.fn().mockReturnValue({
  publicKey: {
    toBase58: () => "StealthPubkey11111111111111111111111111111111",
    toBuffer: () => Buffer.alloc(32),
  },
  secretKey: new Uint8Array(64).fill(0xab),
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
    getAccountInfo = vi.fn().mockResolvedValue({ lamports: 890880 })
    getMinimumBalanceForRentExemption = vi.fn().mockResolvedValue(890880)
  }

  return {
    PublicKey: MockPublicKey,
    Keypair: {
      generate: mockKeypairGenerate,
    },
    Transaction: MockTransaction,
    Connection: MockConnection,
    ComputeBudgetProgram: {
      setComputeUnitLimit: mockSetComputeUnitLimit,
      setComputeUnitPrice: mockSetComputeUnitPrice,
    },
    SystemProgram: {
      transfer: vi.fn().mockReturnValue({ type: "systemTransfer" }),
    },
  }
})

vi.mock("@/lib/solana/program-client", () => ({
  buildShieldedTransferInstruction: mockBuildShieldedTransferInstruction,
  FEE_COLLECTOR: { toBase58: () => "FeeCollector111111111111111111111111111111" },
}))

vi.mock("@/lib/crypto-helpers", () => ({
  createRealCommitment: vi.fn().mockResolvedValue({
    commitmentHash: "0x" + "ab".repeat(33),
    commitmentDisplay: "ab...ab",
    blindingFactor: "0x" + "cd".repeat(32),
  }),
}))

// Mock noble crypto (used for encryption)
vi.mock("@noble/hashes/sha2.js", () => ({
  sha256: vi.fn().mockReturnValue(new Uint8Array(32).fill(0x42)),
}))

vi.mock("@noble/ciphers/chacha.js", () => ({
  xchacha20poly1305: vi.fn().mockReturnValue({
    encrypt: vi.fn().mockReturnValue(new Uint8Array(48).fill(0xee)),
    decrypt: vi.fn().mockReturnValue(new Uint8Array(32).fill(0xab)),
  }),
}))

vi.mock("@noble/hashes/utils.js", () => ({
  bytesToHex: vi.fn().mockReturnValue("42".repeat(32)),
  concatBytes: vi.fn().mockReturnValue(new Uint8Array(64).fill(0x42)),
}))

// Mock SIP SDK
vi.mock("@sip-protocol/sdk", () => ({
  generateStealthMetaAddress: () => ({
    metaAddress: {
      spendingKey: "0x" + "aa".repeat(32),
      viewingKey: "0x" + "bb".repeat(32),
      chain: "solana",
    },
    spendingPrivateKey: "0x" + "cc".repeat(32),
    viewingPrivateKey: "0x" + "dd".repeat(32),
  }),
  generateStealthAddress: () => ({
    stealthAddress: {
      address: "0x" + "ee".repeat(32),
      ephemeralPublicKey: "0x" + "11".repeat(32),
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

const TEST_VIEWING_KEY = "0x" + "bb".repeat(32)
const TEST_SPENDING_KEY = "0x" + "aa".repeat(32)

describe("createStealthTransfer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a valid stealth address (base58)", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })

    expect(result.stealthAddress).toBeTruthy()
    expect(typeof result.stealthAddress).toBe("string")
    expect(result.stealthAddress).not.toContain("sip:")
  })

  it("returns ephemeral public key", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({
      amountLamports: 500_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })

    expect(result.ephemeralPublicKey).toBeTruthy()
    expect(typeof result.ephemeralPublicKey).toBe("string")
  })

  it("returns a valid Pedersen commitment", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })

    expect(result.commitment).toBeDefined()
    expect(result.commitment.commitmentHash).toMatch(/^0x/)
    expect(result.commitment.blindingFactor).toMatch(/^0x/)
    expect(result.commitment.commitmentDisplay).toContain("...")
  })

  it("returns viewing key hash for on-chain discovery", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })

    expect(result.viewingKeyHash).toBeTruthy()
    expect(result.viewingKeyHash).toMatch(/^0x/)
  })

  it("returns buildTransaction function", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })

    expect(typeof result.buildTransaction).toBe("function")
  })

  it("returns getExplorerUrl function", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })

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

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })
    const senderPubkey = new PublicKey(
      "SenderPubkey111111111111111111111111111111"
    )
    const tx = await result.buildTransaction(
      senderPubkey,
      "https://api.devnet.solana.com"
    )

    expect(tx).toBeDefined()
    expect(mockAdd).toHaveBeenCalled()
  })

  it("calls buildShieldedTransferInstruction with encrypted seed", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")
    const { PublicKey } = await import("@solana/web3.js")

    const result = await createStealthTransfer({
      amountLamports: 2_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })
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

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })
    const senderPubkey = new PublicKey(
      "SenderPubkey111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

    expect(mockGetLatestBlockhash).toHaveBeenCalledWith("confirmed")
  })

  it("adds compute budget + shielded_transfer instructions (3 calls when fee_collector funded)", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")
    const { PublicKey } = await import("@solana/web3.js")

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })
    const senderPubkey = new PublicKey(
      "SenderPubkey111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

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

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })
    const url = result.getExplorerUrl("5abc123def")

    expect(url).toBe("https://solscan.io/tx/5abc123def")
  })

  it("generates mainnet Solscan URL when cluster is mainnet-beta", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })
    const url = result.getExplorerUrl("5abc123def", "mainnet-beta")

    expect(url).toBe("https://solscan.io/tx/5abc123def")
  })

  it("generates devnet Solscan URL when cluster is devnet", async () => {
    const { createStealthTransfer } =
      await import("@/lib/solana/stealth-transfer")

    const result = await createStealthTransfer({
      amountLamports: 1_000_000,
      recipientViewingPublicKey: TEST_VIEWING_KEY,
      recipientSpendingPublicKey: TEST_SPENDING_KEY,
    })
    const url = result.getExplorerUrl("txhash999", "devnet")

    expect(url).toBe("https://solscan.io/tx/txhash999?cluster=devnet")
  })
})

describe("encryptStealthSeed / decryptStealthSeed", () => {
  it("exports encrypt and decrypt functions", async () => {
    const mod = await import("@/lib/solana/stealth-transfer")
    expect(typeof mod.encryptStealthSeed).toBe("function")
    expect(typeof mod.decryptStealthSeed).toBe("function")
  })
})
