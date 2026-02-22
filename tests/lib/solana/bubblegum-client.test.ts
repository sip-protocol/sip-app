import { describe, it, expect, vi, beforeEach } from "vitest"

// Track calls to Transaction.add
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
      if (typeof this._key === "string") {
        // Return deterministic bytes based on key string
        const bytes = new Uint8Array(32)
        for (let i = 0; i < Math.min(this._key.length, 32); i++) {
          bytes[i] = this._key.charCodeAt(i)
        }
        return bytes
      }
      if (this._key instanceof Uint8Array && this._key.length === 32) {
        return this._key
      }
      return new Uint8Array(32).fill(0x01)
    }
    toBuffer() {
      return Buffer.from(this.toBytes())
    }
    equals(other: MockPublicKey) {
      return this.toBase58() === other.toBase58()
    }
    static findProgramAddressSync(
      _seeds: Uint8Array[],
      _programId: MockPublicKey
    ) {
      return [
        new MockPublicKey("DerivedPDA1111111111111111111111111111111111"),
        255,
      ]
    }
  }

  class MockTransaction {
    feePayer: unknown = null
    instructions: unknown[] = []
    constructor(_opts?: unknown) {}
    add(...args: unknown[]) {
      this.instructions.push(...args)
      mockAdd(...args)
      return this
    }
  }

  class MockConnection {
    constructor(_url: string, _commitment?: string) {}
    getLatestBlockhash = mockGetLatestBlockhash
  }

  class MockTransactionInstruction {
    keys: unknown[]
    programId: MockPublicKey
    data: Uint8Array
    constructor(opts: {
      keys: unknown[]
      programId: MockPublicKey
      data: Uint8Array
    }) {
      this.keys = opts.keys
      this.programId = opts.programId
      this.data = opts.data
    }
  }

  return {
    PublicKey: MockPublicKey,
    Transaction: MockTransaction,
    TransactionInstruction: MockTransactionInstruction,
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

describe("bubblegum-client", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("buildMintCNFTTransaction", () => {
    it("builds a transaction with correct structure", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection } = await import("@solana/web3.js")

      const result = await buildMintCNFTTransaction({
        connection: new Connection("https://api.devnet.solana.com"),
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "SIP Art #1",
          uri: "https://arweave.net/abc123",
        },
      })

      expect(result.transaction).toBeDefined()
      expect(result.treeConfigPda).toBeDefined()
    })

    it("fetches recent blockhash from connection", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection } = await import("@solana/web3.js")

      await buildMintCNFTTransaction({
        connection: new Connection("https://api.devnet.solana.com"),
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "SIP Art #1",
          uri: "https://arweave.net/abc123",
        },
      })

      expect(mockGetLatestBlockhash).toHaveBeenCalledWith("confirmed")
    })

    it("adds compute budget instructions", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection, ComputeBudgetProgram } =
        await import("@solana/web3.js")

      await buildMintCNFTTransaction({
        connection: new Connection("https://api.devnet.solana.com"),
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "SIP Art #1",
          uri: "https://arweave.net/abc123",
        },
      })

      expect(ComputeBudgetProgram.setComputeUnitLimit).toHaveBeenCalledWith({
        units: 200_000,
      })
      expect(ComputeBudgetProgram.setComputeUnitPrice).toHaveBeenCalledWith({
        microLamports: 50_000,
      })
    })

    it("adds 3 instructions (CU limit, CU price, mint)", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection } = await import("@solana/web3.js")

      await buildMintCNFTTransaction({
        connection: new Connection("https://api.devnet.solana.com"),
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "SIP Art #1",
          uri: "https://arweave.net/abc123",
        },
      })

      // CU limit + CU price + mintToCollectionV1 = 3 calls
      expect(mockAdd).toHaveBeenCalledTimes(3)
    })

    it("throws on empty metadata name", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection } = await import("@solana/web3.js")

      await expect(
        buildMintCNFTTransaction({
          connection: new Connection("https://api.devnet.solana.com"),
          payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
          recipient: new PublicKey(
            "StealthAddr1111111111111111111111111111111111"
          ),
          merkleTree: new PublicKey(
            "MerkleTree11111111111111111111111111111111111"
          ),
          collectionMint: new PublicKey(
            "Collection11111111111111111111111111111111111"
          ),
          metadata: {
            name: "",
            uri: "https://arweave.net/abc123",
          },
        })
      ).rejects.toThrow("metadata.name is required")
    })

    it("throws on empty metadata uri", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection } = await import("@solana/web3.js")

      await expect(
        buildMintCNFTTransaction({
          connection: new Connection("https://api.devnet.solana.com"),
          payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
          recipient: new PublicKey(
            "StealthAddr1111111111111111111111111111111111"
          ),
          merkleTree: new PublicKey(
            "MerkleTree11111111111111111111111111111111111"
          ),
          collectionMint: new PublicKey(
            "Collection11111111111111111111111111111111111"
          ),
          metadata: {
            name: "SIP Art #1",
            uri: "",
          },
        })
      ).rejects.toThrow("metadata.uri is required")
    })

    it("throws on invalid sellerFeeBasisPoints", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection } = await import("@solana/web3.js")

      await expect(
        buildMintCNFTTransaction({
          connection: new Connection("https://api.devnet.solana.com"),
          payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
          recipient: new PublicKey(
            "StealthAddr1111111111111111111111111111111111"
          ),
          merkleTree: new PublicKey(
            "MerkleTree11111111111111111111111111111111111"
          ),
          collectionMint: new PublicKey(
            "Collection11111111111111111111111111111111111"
          ),
          metadata: {
            name: "SIP Art #1",
            uri: "https://arweave.net/abc123",
            sellerFeeBasisPoints: 15000,
          },
        })
      ).rejects.toThrow("sellerFeeBasisPoints must be between 0 and 10000")
    })

    it("throws on creator shares not summing to 100", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection } = await import("@solana/web3.js")

      await expect(
        buildMintCNFTTransaction({
          connection: new Connection("https://api.devnet.solana.com"),
          payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
          recipient: new PublicKey(
            "StealthAddr1111111111111111111111111111111111"
          ),
          merkleTree: new PublicKey(
            "MerkleTree11111111111111111111111111111111111"
          ),
          collectionMint: new PublicKey(
            "Collection11111111111111111111111111111111111"
          ),
          metadata: {
            name: "SIP Art #1",
            uri: "https://arweave.net/abc123",
            creators: [
              {
                address: new PublicKey(
                  "Creator11111111111111111111111111111111111111"
                ),
                verified: false,
                share: 60,
              },
              {
                address: new PublicKey(
                  "Creator21111111111111111111111111111111111111"
                ),
                verified: false,
                share: 30,
              },
            ],
          },
        })
      ).rejects.toThrow("Creator shares must sum to 100, got 90")
    })

    it("accepts valid custom creators", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection } = await import("@solana/web3.js")

      const result = await buildMintCNFTTransaction({
        connection: new Connection("https://api.devnet.solana.com"),
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "SIP Art #1",
          uri: "https://arweave.net/abc123",
          creators: [
            {
              address: new PublicKey(
                "Creator11111111111111111111111111111111111111"
              ),
              verified: false,
              share: 70,
            },
            {
              address: new PublicKey(
                "Creator21111111111111111111111111111111111111"
              ),
              verified: false,
              share: 30,
            },
          ],
        },
      })

      expect(result.transaction).toBeDefined()
    })

    it("accepts optional symbol and sellerFeeBasisPoints", async () => {
      const { buildMintCNFTTransaction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey, Connection } = await import("@solana/web3.js")

      const result = await buildMintCNFTTransaction({
        connection: new Connection("https://api.devnet.solana.com"),
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "SIP Art #1",
          symbol: "SIPART",
          uri: "https://arweave.net/abc123",
          sellerFeeBasisPoints: 500,
        },
      })

      expect(result.transaction).toBeDefined()
    })
  })

  describe("buildMintToCollectionV1Instruction", () => {
    it("builds an instruction with 16 account keys", async () => {
      const { buildMintToCollectionV1Instruction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const ix = buildMintToCollectionV1Instruction({
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "Test cNFT",
          uri: "https://arweave.net/test",
        },
      })

      // 16 accounts for mintToCollectionV1
      expect(ix.keys).toHaveLength(16)
    })

    it("sets the Bubblegum program ID", async () => {
      const { buildMintToCollectionV1Instruction, BUBBLEGUM_PROGRAM_ID } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const ix = buildMintToCollectionV1Instruction({
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "Test cNFT",
          uri: "https://arweave.net/test",
        },
      })

      expect(ix.programId.toBase58()).toBe(BUBBLEGUM_PROGRAM_ID.toBase58())
    })

    it("starts instruction data with correct discriminator", async () => {
      const { buildMintToCollectionV1Instruction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const ix = buildMintToCollectionV1Instruction({
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "Test cNFT",
          uri: "https://arweave.net/test",
        },
      })

      const disc = Array.from(new Uint8Array(ix.data.slice(0, 8)))
      expect(disc).toEqual([153, 18, 178, 47, 197, 158, 86, 15])
    })

    it("uses recipient as leafOwner (index 1) and leafDelegate (index 2)", async () => {
      const { buildMintToCollectionV1Instruction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const recipient = new PublicKey(
        "StealthAddr1111111111111111111111111111111111"
      )

      const ix = buildMintToCollectionV1Instruction({
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient,
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "Test cNFT",
          uri: "https://arweave.net/test",
        },
      })

      // leafOwner (index 1) = recipient
      expect(ix.keys[1].pubkey.toBase58()).toBe(recipient.toBase58())
      expect(ix.keys[1].isSigner).toBe(false)

      // leafDelegate (index 2) = recipient
      expect(ix.keys[2].pubkey.toBase58()).toBe(recipient.toBase58())
      expect(ix.keys[2].isSigner).toBe(false)
    })

    it("sets payer as signer on positions 4, 5, 6", async () => {
      const { buildMintToCollectionV1Instruction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const payer = new PublicKey(
        "PayerPubkey111111111111111111111111111111111"
      )

      const ix = buildMintToCollectionV1Instruction({
        payer,
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "Test cNFT",
          uri: "https://arweave.net/test",
        },
      })

      // payer (index 4) — signer + writable
      expect(ix.keys[4].pubkey.toBase58()).toBe(payer.toBase58())
      expect(ix.keys[4].isSigner).toBe(true)
      expect(ix.keys[4].isWritable).toBe(true)

      // treeCreatorOrDelegate (index 5) — signer
      expect(ix.keys[5].pubkey.toBase58()).toBe(payer.toBase58())
      expect(ix.keys[5].isSigner).toBe(true)

      // collectionAuthority (index 6) — signer
      expect(ix.keys[6].pubkey.toBase58()).toBe(payer.toBase58())
      expect(ix.keys[6].isSigner).toBe(true)
    })

    it("sets merkleTree as writable (index 3)", async () => {
      const { buildMintToCollectionV1Instruction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const ix = buildMintToCollectionV1Instruction({
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "Test cNFT",
          uri: "https://arweave.net/test",
        },
      })

      expect(ix.keys[3].isWritable).toBe(true)
    })

    it("includes metadata name in instruction data", async () => {
      const { buildMintToCollectionV1Instruction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const ix = buildMintToCollectionV1Instruction({
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "SIP Art #1",
          uri: "https://arweave.net/abc123",
        },
      })

      // The name "SIP Art #1" should appear in the serialized data
      const dataStr = Buffer.from(ix.data).toString("utf8")
      expect(dataStr).toContain("SIP Art #1")
    })

    it("includes metadata uri in instruction data", async () => {
      const { buildMintToCollectionV1Instruction } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const ix = buildMintToCollectionV1Instruction({
        payer: new PublicKey("PayerPubkey111111111111111111111111111111111"),
        recipient: new PublicKey(
          "StealthAddr1111111111111111111111111111111111"
        ),
        merkleTree: new PublicKey(
          "MerkleTree11111111111111111111111111111111111"
        ),
        collectionMint: new PublicKey(
          "Collection11111111111111111111111111111111111"
        ),
        metadata: {
          name: "SIP Art #1",
          uri: "https://arweave.net/abc123",
        },
      })

      const dataStr = Buffer.from(ix.data).toString("utf8")
      expect(dataStr).toContain("https://arweave.net/abc123")
    })
  })

  describe("PDA derivation", () => {
    it("findTreeConfigPda returns a PublicKey and bump", async () => {
      const { findTreeConfigPda } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const [pda, bump] = findTreeConfigPda(
        new PublicKey("MerkleTree11111111111111111111111111111111111")
      )
      expect(pda).toBeDefined()
      expect(pda.toBase58()).toBeTruthy()
      expect(typeof bump).toBe("number")
    })

    it("findMetadataPda returns a PublicKey and bump", async () => {
      const { findMetadataPda } = await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const [pda, bump] = findMetadataPda(
        new PublicKey("Collection11111111111111111111111111111111111")
      )
      expect(pda).toBeDefined()
      expect(typeof bump).toBe("number")
    })

    it("findMasterEditionPda returns a PublicKey and bump", async () => {
      const { findMasterEditionPda } =
        await import("@/lib/solana/bubblegum-client")
      const { PublicKey } = await import("@solana/web3.js")

      const [pda, bump] = findMasterEditionPda(
        new PublicKey("Collection11111111111111111111111111111111111")
      )
      expect(pda).toBeDefined()
      expect(typeof bump).toBe("number")
    })

    it("findBubblegumSignerPda returns a PublicKey and bump", async () => {
      const { findBubblegumSignerPda } =
        await import("@/lib/solana/bubblegum-client")

      const [pda, bump] = findBubblegumSignerPda()
      expect(pda).toBeDefined()
      expect(typeof bump).toBe("number")
    })
  })

  describe("program constants", () => {
    it("exports BUBBLEGUM_PROGRAM_ID as correct address", async () => {
      const { BUBBLEGUM_PROGRAM_ID } =
        await import("@/lib/solana/bubblegum-client")
      expect(BUBBLEGUM_PROGRAM_ID.toBase58()).toBe(
        "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"
      )
    })

    it("exports SPL_NOOP_PROGRAM_ID as correct address", async () => {
      const { SPL_NOOP_PROGRAM_ID } =
        await import("@/lib/solana/bubblegum-client")
      expect(SPL_NOOP_PROGRAM_ID.toBase58()).toBe(
        "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"
      )
    })

    it("exports SPL_ACCOUNT_COMPRESSION_PROGRAM_ID as correct address", async () => {
      const { SPL_ACCOUNT_COMPRESSION_PROGRAM_ID } =
        await import("@/lib/solana/bubblegum-client")
      expect(SPL_ACCOUNT_COMPRESSION_PROGRAM_ID.toBase58()).toBe(
        "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK"
      )
    })

    it("exports TOKEN_METADATA_PROGRAM_ID as correct address", async () => {
      const { TOKEN_METADATA_PROGRAM_ID } =
        await import("@/lib/solana/bubblegum-client")
      expect(TOKEN_METADATA_PROGRAM_ID.toBase58()).toBe(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
      )
    })
  })
})
