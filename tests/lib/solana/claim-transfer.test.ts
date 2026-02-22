import { describe, it, expect, vi, beforeEach } from "vitest"

// Track calls
const mockAdd = vi.fn().mockReturnThis()
const mockGetLatestBlockhash = vi.fn().mockResolvedValue({
  blockhash: "mock-blockhash-" + "a".repeat(32),
  lastValidBlockHeight: 123456,
})

vi.mock("@solana/web3.js", () => {
  class MockPublicKey {
    _key: string | Uint8Array
    constructor(key: string | Uint8Array) {
      this._key = key
    }
    toBase58() {
      return typeof this._key === "string"
        ? this._key
        : "MockBase58Address1111111111111111111111111"
    }
    toBytes() {
      return new Uint8Array(32).fill(0x01)
    }
    toBuffer() {
      return Buffer.alloc(32)
    }
    equals(other: MockPublicKey) {
      return this.toBase58() === other.toBase58()
    }
    static findProgramAddressSync(
      _seeds: Uint8Array[],
      _programId: MockPublicKey
    ) {
      return [
        new MockPublicKey("NullifierPDA1111111111111111111111111111111"),
        255,
      ]
    }
  }

  class MockKeypair {
    publicKey: MockPublicKey
    secretKey: Uint8Array
    constructor(publicKey: MockPublicKey, secretKey: Uint8Array) {
      this.publicKey = publicKey
      this.secretKey = secretKey
    }
    static fromSeed(seed: Uint8Array) {
      return new MockKeypair(
        new MockPublicKey("StealthReconstructed1111111111111111111111111"),
        new Uint8Array(64).fill(seed[0] ?? 0xab)
      )
    }
  }

  class MockTransaction {
    feePayer: unknown = null
    constructor(_opts?: unknown) {}
    add(...args: unknown[]) {
      mockAdd(...args)
      return this
    }
    partialSign() {}
  }

  class MockConnection {
    constructor(_url: string, _commitment?: string) {}
    getLatestBlockhash = mockGetLatestBlockhash
  }

  return {
    PublicKey: MockPublicKey,
    Keypair: MockKeypair,
    Transaction: MockTransaction,
    Connection: MockConnection,
    ComputeBudgetProgram: {
      setComputeUnitLimit: vi.fn().mockReturnValue({ type: "cuLimit" }),
      setComputeUnitPrice: vi.fn().mockReturnValue({ type: "cuPrice" }),
    },
    SystemProgram: {
      programId: new MockPublicKey("11111111111111111111111111111111"),
    },
  }
})

vi.mock("@/lib/solana/program-client", () => ({
  buildClaimTransferInstruction: vi.fn().mockReturnValue({
    programId: "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at",
    type: "claimTransfer",
  }),
  SIP_PROGRAM_ID: {
    _key: "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at",
    toBase58: () => "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at",
  },
}))

vi.mock("@/lib/solana/stealth-transfer", () => ({
  decryptStealthSeed: vi.fn().mockReturnValue(new Uint8Array(32).fill(0xab)),
}))

vi.mock("@noble/hashes/sha2.js", () => ({
  sha256: vi.fn().mockReturnValue(new Uint8Array(32).fill(0x42)),
  sha512: vi.fn().mockReturnValue(new Uint8Array(64).fill(0x42)),
}))

vi.mock("@noble/hashes/utils.js", () => ({
  bytesToHex: vi.fn().mockReturnValue("42".repeat(32)),
  concatBytes: vi.fn().mockReturnValue(new Uint8Array(64).fill(0x42)),
}))

vi.mock("@noble/curves/ed25519.js", () => ({
  ed25519: {
    Point: {
      fromHex: vi.fn().mockReturnValue({
        multiply: vi.fn().mockReturnValue({
          toBytes: vi.fn().mockReturnValue(new Uint8Array(32).fill(0xff)),
        }),
      }),
    },
  },
}))

vi.mock("bs58", () => ({
  default: {
    decode: (_str: string) => new Uint8Array(32).fill(0xcc),
    encode: (bytes: Uint8Array) => "MockBase58" + bytes[0].toString(16),
  },
}))

describe("buildClaimTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("builds a claim transaction", async () => {
    const { buildClaimTransaction } =
      await import("@/lib/solana/claim-transfer")
    const { PublicKey } = await import("@solana/web3.js")

    // Mock stealthRecipient to match what Keypair.fromSeed returns
    const stealthRecipient = new PublicKey(
      "StealthReconstructed1111111111111111111111111"
    )

    const result = await buildClaimTransaction({
      transferRecordPda: new PublicKey(
        "TransferRecord11111111111111111111111111111"
      ),
      encryptedSeed: new Uint8Array(48).fill(0xee),
      ephemeralPubkey: new Uint8Array(32).fill(0x11),
      stealthRecipient,
      spendingPrivateKey: "HYvJjCgo4yLbAoSvBw8bW6eDTFkFEzRZhMbucFfgJnBb",
      recipientPubkey: new PublicKey(
        "RecipientWallet111111111111111111111111111111"
      ),
      rpcUrl: "https://api.devnet.solana.com",
    })

    expect(result.transaction).toBeDefined()
    expect(result.stealthSigner).toBeDefined()
  })

  it("calls buildClaimTransferInstruction with correct params", async () => {
    const { buildClaimTransaction } =
      await import("@/lib/solana/claim-transfer")
    const { buildClaimTransferInstruction } =
      await import("@/lib/solana/program-client")
    const { PublicKey } = await import("@solana/web3.js")

    await buildClaimTransaction({
      transferRecordPda: new PublicKey(
        "TransferRecord11111111111111111111111111111"
      ),
      encryptedSeed: new Uint8Array(48).fill(0xee),
      ephemeralPubkey: new Uint8Array(32).fill(0x11),
      stealthRecipient: new PublicKey(
        "StealthReconstructed1111111111111111111111111"
      ),
      spendingPrivateKey: "HYvJjCgo4yLbAoSvBw8bW6eDTFkFEzRZhMbucFfgJnBb",
      recipientPubkey: new PublicKey(
        "RecipientWallet111111111111111111111111111111"
      ),
      rpcUrl: "https://api.devnet.solana.com",
    })

    expect(buildClaimTransferInstruction).toHaveBeenCalledWith(
      expect.objectContaining({
        nullifier: expect.any(Uint8Array),
        proof: expect.any(Uint8Array),
      })
    )
  })
})

describe("recoverSharedSecret", () => {
  it("recovers shared secret from spending key and ephemeral pubkey", async () => {
    const { recoverSharedSecret } = await import("@/lib/solana/claim-transfer")

    const result = recoverSharedSecret(
      "HYvJjCgo4yLbAoSvBw8bW6eDTFkFEzRZhMbucFfgJnBb",
      new Uint8Array(32).fill(0x11)
    )

    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(32)
  })
})
