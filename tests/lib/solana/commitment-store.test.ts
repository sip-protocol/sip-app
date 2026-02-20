import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.hoisted runs in the hoisted scope alongside vi.mock factories
const {
  mockAdd,
  mockGetLatestBlockhash,
  mockTransferIx,
  mockCreateMemoInstruction,
  mockSetComputeUnitLimit,
  mockSetComputeUnitPrice,
  mockBuildVerifyCommitmentInstruction,
  mockCreateRealCommitment,
} = vi.hoisted(() => ({
  mockAdd: vi.fn().mockReturnThis(),
  mockGetLatestBlockhash: vi.fn().mockResolvedValue({
    blockhash: "mock-blockhash-" + "a".repeat(32),
    lastValidBlockHeight: 200000,
  }),
  mockTransferIx: vi.fn().mockReturnValue({
    programId: "11111111111111111111111111111111",
  }),
  mockCreateMemoInstruction: vi.fn().mockReturnValue({
    programId: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  }),
  mockSetComputeUnitLimit: vi.fn().mockReturnValue({
    programId: "ComputeBudget111111111111111111111111111111",
    data: "setComputeUnitLimit",
  }),
  mockSetComputeUnitPrice: vi.fn().mockReturnValue({
    programId: "ComputeBudget111111111111111111111111111111",
    data: "setComputeUnitPrice",
  }),
  mockBuildVerifyCommitmentInstruction: vi.fn().mockReturnValue({
    programId: "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at",
    data: "verifyCommitment",
  }),
  mockCreateRealCommitment: vi.fn().mockResolvedValue({
    commitmentHash: "0x" + "ab".repeat(33),
    commitmentDisplay: "ab...ab",
    blindingFactor: "0x" + "cd".repeat(32),
  }),
}))

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
    SystemProgram: {
      transfer: mockTransferIx,
    },
    ComputeBudgetProgram: {
      setComputeUnitLimit: mockSetComputeUnitLimit,
      setComputeUnitPrice: mockSetComputeUnitPrice,
    },
  }
})

vi.mock("@solana/spl-memo", () => ({
  createMemoInstruction: mockCreateMemoInstruction,
}))

vi.mock("@/lib/solana/program-client", () => ({
  buildVerifyCommitmentInstruction: mockBuildVerifyCommitmentInstruction,
}))

vi.mock("@/lib/crypto-helpers", () => ({
  createRealCommitment: mockCreateRealCommitment,
}))

import {
  createCommitmentStore,
  createRevealTransaction,
  verifyCommitmentReveal,
  hashCommitment,
} from "@/lib/solana/commitment-store"
import { PublicKey } from "@solana/web3.js"

describe("hashCommitment", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a 0x-prefixed hex string", async () => {
    const hash = await hashCommitment("test-data", "test-salt")

    expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it("is deterministic — same input produces same output", async () => {
    const hash1 = await hashCommitment("proposal:1:yes:100", "salt-abc")
    const hash2 = await hashCommitment("proposal:1:yes:100", "salt-abc")

    expect(hash1).toBe(hash2)
  })

  it("produces different hashes for different data", async () => {
    const hash1 = await hashCommitment("data-a", "same-salt")
    const hash2 = await hashCommitment("data-b", "same-salt")

    expect(hash1).not.toBe(hash2)
  })

  it("produces different hashes for different salts", async () => {
    const hash1 = await hashCommitment("same-data", "salt-1")
    const hash2 = await hashCommitment("same-data", "salt-2")

    expect(hash1).not.toBe(hash2)
  })
})

describe("createCommitmentStore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns commitmentHash as 0x-prefixed hex", async () => {
    const result = await createCommitmentStore({
      data: "proposalId:yes:100",
      commitmentType: "vote",
    })

    expect(result.commitmentHash).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it("returns a 32-byte hex salt", async () => {
    const result = await createCommitmentStore({
      data: "proposalId:yes:100",
      commitmentType: "vote",
    })

    // 32 bytes = 64 hex chars
    expect(result.salt).toMatch(/^[0-9a-f]{64}$/)
  })

  it("returns buildTransaction function", async () => {
    const result = await createCommitmentStore({
      data: "move:rock",
      commitmentType: "move",
    })

    expect(typeof result.buildTransaction).toBe("function")
  })

  it("returns getExplorerUrl function", async () => {
    const result = await createCommitmentStore({
      data: "ticket:123",
      commitmentType: "ticket",
    })

    expect(typeof result.getExplorerUrl).toBe("function")
  })

  it("produces different salts on each call", async () => {
    const result1 = await createCommitmentStore({
      data: "same-data",
      commitmentType: "generic",
    })
    const result2 = await createCommitmentStore({
      data: "same-data",
      commitmentType: "generic",
    })

    expect(result1.salt).not.toBe(result2.salt)
    expect(result1.commitmentHash).not.toBe(result2.commitmentHash)
  })
})

describe("buildTransaction (commitment)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a Transaction object", async () => {
    const result = await createCommitmentStore({
      data: "proposalId:yes:100",
      commitmentType: "vote",
    })

    const senderPubkey = new PublicKey(
      "Sender111111111111111111111111111111111111"
    )
    const tx = await result.buildTransaction(
      senderPubkey,
      "https://api.devnet.solana.com"
    )

    expect(tx).toBeDefined()
  })

  it("fetches a recent blockhash", async () => {
    const result = await createCommitmentStore({
      data: "move:rock",
      commitmentType: "move",
    })

    const senderPubkey = new PublicKey(
      "Sender111111111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

    expect(mockGetLatestBlockhash).toHaveBeenCalledWith("confirmed")
  })

  it("adds compute budget + verify_commitment instructions (3 calls to add)", async () => {
    const result = await createCommitmentStore({
      data: "data",
      commitmentType: "generic",
    })

    const senderPubkey = new PublicKey(
      "Sender111111111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

    expect(mockAdd).toHaveBeenCalledTimes(3)
  })

  it("sets compute unit limit to 200_000", async () => {
    const result = await createCommitmentStore({
      data: "data",
      commitmentType: "generic",
    })

    const senderPubkey = new PublicKey(
      "Sender111111111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

    expect(mockSetComputeUnitLimit).toHaveBeenCalledWith({ units: 200_000 })
  })

  it("sets compute unit price to 50_000 microLamports", async () => {
    const result = await createCommitmentStore({
      data: "data",
      commitmentType: "generic",
    })

    const senderPubkey = new PublicKey(
      "Sender111111111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

    expect(mockSetComputeUnitPrice).toHaveBeenCalledWith({
      microLamports: 50_000,
    })
  })

  it("calls buildVerifyCommitmentInstruction with correct params", async () => {
    const result = await createCommitmentStore({
      data: "proposalId:yes:100",
      commitmentType: "vote",
    })

    const senderPubkey = new PublicKey(
      "Sender111111111111111111111111111111111111"
    )
    await result.buildTransaction(senderPubkey, "https://api.devnet.solana.com")

    expect(mockBuildVerifyCommitmentInstruction).toHaveBeenCalledWith(
      expect.objectContaining({
        payer: senderPubkey,
        commitment: expect.any(Uint8Array),
        value: expect.any(BigInt),
        blinding: expect.any(Uint8Array),
      })
    )
  })
})

describe("getExplorerUrl (commitment)", () => {
  it("generates mainnet Solscan URL by default", async () => {
    const result = await createCommitmentStore({
      data: "data",
      commitmentType: "generic",
    })

    const url = result.getExplorerUrl("5abc123def")
    expect(url).toBe("https://solscan.io/tx/5abc123def")
  })

  it("generates mainnet Solscan URL when cluster is mainnet-beta", async () => {
    const result = await createCommitmentStore({
      data: "data",
      commitmentType: "generic",
    })

    const url = result.getExplorerUrl("5abc123def", "mainnet-beta")
    expect(url).toBe("https://solscan.io/tx/5abc123def")
  })
})

describe("createRevealTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a Transaction object", async () => {
    const senderPubkey = new PublicKey(
      "Sender111111111111111111111111111111111111"
    )
    const tx = await createRevealTransaction(
      "proposalId:yes:100",
      "ab".repeat(32),
      "vote",
      senderPubkey,
      "https://api.devnet.solana.com"
    )

    expect(tx).toBeDefined()
  })

  it("adds memo with SIP-REVEAL:<type>:<hash>:<data>:<salt> format", async () => {
    const data = "proposalId:yes:100"
    const salt = "ab".repeat(32)
    const senderPubkey = new PublicKey(
      "Sender111111111111111111111111111111111111"
    )

    await createRevealTransaction(
      data,
      salt,
      "vote",
      senderPubkey,
      "https://api.devnet.solana.com"
    )

    expect(mockCreateMemoInstruction).toHaveBeenCalledWith(
      expect.stringMatching(
        /^SIP-REVEAL:vote:0x[0-9a-f]{64}:proposalId:yes:100:/
      )
    )
  })

  it("adds both transfer and memo instructions", async () => {
    const senderPubkey = new PublicKey(
      "Sender111111111111111111111111111111111111"
    )

    await createRevealTransaction(
      "data",
      "ab".repeat(32),
      "generic",
      senderPubkey,
      "https://api.devnet.solana.com"
    )

    expect(mockAdd).toHaveBeenCalledTimes(2)
  })
})

describe("verifyCommitmentReveal", () => {
  it("returns true for matching data and salt", async () => {
    const data = "proposalId:yes:100"
    const salt = "deadbeef".repeat(8)

    const isValid = await verifyCommitmentReveal(data, salt, data, salt)

    expect(isValid).toBe(true)
  })

  it("returns false for mismatched data", async () => {
    const salt = "deadbeef".repeat(8)

    const isValid = await verifyCommitmentReveal(
      "proposalId:yes:100",
      salt,
      "proposalId:no:50",
      salt
    )

    expect(isValid).toBe(false)
  })

  it("returns false for mismatched salt", async () => {
    const data = "proposalId:yes:100"

    const isValid = await verifyCommitmentReveal(
      data,
      "aa".repeat(32),
      data,
      "bb".repeat(32)
    )

    expect(isValid).toBe(false)
  })
})
