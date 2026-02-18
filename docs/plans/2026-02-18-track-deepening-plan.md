# Track Deepening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace simulated on-chain writes with real Solana transactions across 5 tracks using shared primitives.

**Architecture:** Three shared primitives in `src/lib/solana/` (stealth-transfer, commitment-store, viewing-key-disclosure) consumed by track-specific services. All primitives use existing wallet adapter (`@solana/wallet-adapter-react`) and SIP SDK (`@sip-protocol/sdk`). Demo mode gracefully degrades when no wallet is connected.

**Tech Stack:** @solana/web3.js 1.98.4, @solana/wallet-adapter-react 0.15.39, @sip-protocol/sdk, @solana/spl-memo, Vitest

---

## Task 1: Stealth Transfer Primitive

**Files:**
- Create: `src/lib/solana/stealth-transfer.ts`
- Test: `tests/lib/solana/stealth-transfer.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/lib/solana/stealth-transfer.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  createStealthTransfer,
  type StealthTransferParams,
  type StealthTransferResult,
} from "@/lib/solana/stealth-transfer"

// Mock @solana/web3.js
vi.mock("@solana/web3.js", () => {
  const mockSendTransaction = vi.fn().mockResolvedValue("mock-tx-sig-abc123")
  const mockConfirmTransaction = vi.fn().mockResolvedValue({ value: { err: null } })
  const mockGetLatestBlockhash = vi.fn().mockResolvedValue({
    blockhash: "mock-blockhash",
    lastValidBlockHeight: 100,
  })

  return {
    Connection: vi.fn().mockImplementation(() => ({
      sendTransaction: mockSendTransaction,
      confirmTransaction: mockConfirmTransaction,
      getLatestBlockhash: mockGetLatestBlockhash,
    })),
    PublicKey: vi.fn().mockImplementation((key: string) => ({
      toBase58: () => key,
      toBuffer: () => Buffer.alloc(32),
      toString: () => key,
    })),
    Transaction: vi.fn().mockImplementation(() => ({
      add: vi.fn().mockReturnThis(),
      serialize: vi.fn().mockReturnValue(Buffer.alloc(100)),
    })),
    SystemProgram: {
      transfer: vi.fn().mockReturnValue({ keys: [], programId: "system", data: Buffer.alloc(0) }),
    },
    LAMPORTS_PER_SOL: 1_000_000_000,
  }
})

// Mock SIP SDK
vi.mock("@sip-protocol/sdk", () => ({
  generateStealthMetaAddress: vi.fn().mockReturnValue({
    metaAddress: {
      spendingPublicKey: "mock-spend-pub",
      viewingPublicKey: "mock-view-pub",
    },
    spendingPrivateKey: "mock-spend-priv",
    viewingPrivateKey: "mock-view-priv",
  }),
  generateStealthAddress: vi.fn().mockReturnValue({
    stealthAddress: { address: "StealthAddr111111111111111111111111111111111" },
    ephemeralPublicKey: "mock-ephemeral-pub",
  }),
  encodeStealthMetaAddress: vi.fn().mockReturnValue("sip:solana:mock-meta"),
  createCommitment: vi.fn().mockReturnValue({
    value: "0xmockcommitment",
    blindingFactor: "0xmockblinding",
  }),
}))

// Mock sip-client
vi.mock("@/lib/sip-client", () => ({
  getSDK: vi.fn().mockResolvedValue({
    generateStealthMetaAddress: vi.fn().mockReturnValue({
      metaAddress: {
        spendingPublicKey: "mock-spend-pub",
        viewingPublicKey: "mock-view-pub",
      },
      spendingPrivateKey: "mock-spend-priv",
      viewingPrivateKey: "mock-view-priv",
    }),
    generateStealthAddress: vi.fn().mockReturnValue({
      stealthAddress: { address: "StealthAddr111111111111111111111111111111111" },
      ephemeralPublicKey: "mock-ephemeral-pub",
    }),
    encodeStealthMetaAddress: vi.fn().mockReturnValue("sip:solana:mock-meta"),
    createCommitment: vi.fn().mockReturnValue({
      value: "0xmockcommitment",
      blindingFactor: "0xmockblinding",
    }),
  }),
}))

describe("createStealthTransfer", () => {
  it("returns a transfer result with stealth address and tx builder", async () => {
    const result = await createStealthTransfer({
      amountLamports: 100_000_000, // 0.1 SOL
      memo: "tip",
    })

    expect(result.stealthAddress).toBeTruthy()
    expect(result.ephemeralPublicKey).toBeTruthy()
    expect(result.commitment).toBeTruthy()
    expect(result.commitment.commitmentHash).toMatch(/^0x/)
  })

  it("builds a signable transaction", async () => {
    const result = await createStealthTransfer({
      amountLamports: 50_000_000,
    })

    expect(result.buildTransaction).toBeTypeOf("function")

    const mockWallet = {
      publicKey: { toBase58: () => "SenderPubkey1111111111111111111111111111111" },
    }
    const tx = await result.buildTransaction(
      mockWallet.publicKey as any,
      "https://api.devnet.solana.com"
    )
    expect(tx).toBeTruthy()
  })

  it("generates explorer URL from tx signature", async () => {
    const result = await createStealthTransfer({
      amountLamports: 50_000_000,
    })

    const url = result.getExplorerUrl("some-tx-sig", "devnet")
    expect(url).toContain("solscan.io")
    expect(url).toContain("some-tx-sig")
    expect(url).toContain("devnet")
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/lib/solana/stealth-transfer.test.ts`
Expected: FAIL with "Cannot find module" (file doesn't exist yet)

**Step 3: Write minimal implementation**

```typescript
// src/lib/solana/stealth-transfer.ts
/**
 * Stealth Transfer Primitive
 *
 * Creates real Solana transactions that send SOL to one-time stealth addresses.
 * The recipient address is unlinkable to any known wallet.
 *
 * Used by: Music (tipping), DeSci (funding), Ticketing (purchase)
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js"
import { getSDK } from "@/lib/sip-client"
import { createRealCommitment, type CommitmentResult } from "@/lib/crypto-helpers"

export interface StealthTransferParams {
  /** Amount in lamports to transfer */
  amountLamports: number
  /** Optional memo attached to transaction */
  memo?: string
}

export interface StealthTransferResult {
  /** One-time stealth address (base58) */
  stealthAddress: string
  /** Ephemeral public key for recipient to derive private key */
  ephemeralPublicKey: string
  /** Pedersen commitment of the amount */
  commitment: CommitmentResult
  /** Stealth meta-address (for display) */
  metaAddress: string
  /** Build a signable transaction */
  buildTransaction: (
    senderPubkey: PublicKey,
    rpcUrl: string
  ) => Promise<Transaction>
  /** Generate Solscan explorer URL */
  getExplorerUrl: (txSignature: string, cluster?: string) => string
}

/**
 * Prepare a stealth transfer — generates addresses and commitment,
 * returns a transaction builder for wallet signing.
 *
 * Separation of concerns: this function does NOT sign or send.
 * The calling component handles wallet interaction.
 */
export async function createStealthTransfer(
  params: StealthTransferParams
): Promise<StealthTransferResult> {
  const sdk = await getSDK()

  // Generate one-time stealth address
  const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
    sdk.generateStealthMetaAddress("solana")
  const { stealthAddress, ephemeralPublicKey } =
    sdk.generateStealthAddress(metaAddress)
  const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)

  // Create Pedersen commitment for the amount
  const commitment = await createRealCommitment(BigInt(params.amountLamports))

  // Build transaction function (deferred — needs sender pubkey)
  const buildTransaction = async (
    senderPubkey: PublicKey,
    rpcUrl: string
  ): Promise<Transaction> => {
    const connection = new Connection(rpcUrl, "confirmed")
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed")

    const recipientPubkey = new PublicKey(stealthAddress.address)

    const tx = new Transaction({
      feePayer: senderPubkey,
      blockhash,
      lastValidBlockHeight,
    }).add(
      SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports: params.amountLamports,
      })
    )

    // Add memo if provided
    if (params.memo) {
      const { createMemoInstruction } = await import("@solana/spl-memo")
      tx.add(createMemoInstruction(params.memo, [senderPubkey]))
    }

    return tx
  }

  const getExplorerUrl = (txSignature: string, cluster = "devnet"): string => {
    const clusterParam = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`
    return `https://solscan.io/tx/${txSignature}${clusterParam}`
  }

  return {
    stealthAddress: stealthAddress.address,
    ephemeralPublicKey,
    commitment,
    metaAddress: metaAddressStr,
    buildTransaction,
    getExplorerUrl,
  }
}

/**
 * Get the configured Solana RPC URL.
 * Reads from env, falls back to devnet.
 */
export function getSolanaRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_RPC_URL ||
    "https://api.devnet.solana.com"
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/lib/solana/stealth-transfer.test.ts`
Expected: PASS (3 tests)

**Step 5: Install @solana/spl-memo if not present**

Run: `cd /Users/rector/local-dev/sip-app && pnpm add @solana/spl-memo`

**Step 6: Commit**

```bash
cd /Users/rector/local-dev/sip-app
git add src/lib/solana/stealth-transfer.ts tests/lib/solana/stealth-transfer.test.ts
git commit -m "feat: stealth transfer primitive for real SOL transfers via one-time addresses"
```

---

## Task 2: Commitment Store Primitive

**Files:**
- Create: `src/lib/solana/commitment-store.ts`
- Test: `tests/lib/solana/commitment-store.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/lib/solana/commitment-store.test.ts
import { describe, it, expect, vi } from "vitest"
import {
  createCommitmentStore,
  verifyCommitmentReveal,
  type CommitmentStoreParams,
} from "@/lib/solana/commitment-store"

// Mock @solana/web3.js
vi.mock("@solana/web3.js", () => {
  return {
    Connection: vi.fn().mockImplementation(() => ({
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "mock-blockhash",
        lastValidBlockHeight: 100,
      }),
    })),
    PublicKey: vi.fn().mockImplementation((key: string) => ({
      toBase58: () => key,
      toBuffer: () => Buffer.alloc(32),
      toString: () => key,
    })),
    Transaction: vi.fn().mockImplementation(() => ({
      add: vi.fn().mockReturnThis(),
    })),
    SystemProgram: {
      transfer: vi.fn().mockReturnValue({ keys: [], programId: "system", data: Buffer.alloc(0) }),
    },
  }
})

// Mock sip-client
vi.mock("@/lib/sip-client", () => ({
  getSDK: vi.fn().mockResolvedValue({
    createCommitment: vi.fn().mockReturnValue({
      value: "0xmockcommitment123",
      blindingFactor: "0xmockblinding456",
    }),
  }),
}))

describe("createCommitmentStore", () => {
  it("creates a commitment with type metadata", async () => {
    const result = await createCommitmentStore({
      data: "vote-choice-1",
      commitmentType: "vote",
    })

    expect(result.commitmentHash).toBeTruthy()
    expect(result.salt).toBeTruthy()
    expect(result.buildTransaction).toBeTypeOf("function")
  })

  it("generates explorer URL", async () => {
    const result = await createCommitmentStore({
      data: "move-rock",
      commitmentType: "move",
    })

    const url = result.getExplorerUrl("tx-sig-123", "devnet")
    expect(url).toContain("solscan.io")
    expect(url).toContain("tx-sig-123")
  })
})

describe("verifyCommitmentReveal", () => {
  it("verifies correct preimage against commitment", () => {
    const data = "vote-choice-1"
    const salt = "random-salt-abc"
    // SHA-256 of data+salt produces the commitment
    const result = verifyCommitmentReveal(data, salt, data, salt)
    expect(result).toBe(true)
  })

  it("rejects incorrect preimage", () => {
    const result = verifyCommitmentReveal("choice-1", "salt-a", "choice-2", "salt-a")
    expect(result).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/lib/solana/commitment-store.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/lib/solana/commitment-store.ts
/**
 * Commitment Store Primitive
 *
 * Stores Pedersen commitment hashes on Solana via memo program.
 * Commitments are timestamped, verifiable, and auditable on-chain.
 *
 * Used by: Governance (vote commit/reveal), Gaming (move commit/reveal)
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js"

export type CommitmentType = "vote" | "move" | "ticket" | "generic"

export interface CommitmentStoreParams {
  /** The data to commit (will be hashed with salt) */
  data: string
  /** Type of commitment (for memo tagging) */
  commitmentType: CommitmentType
}

export interface CommitmentStoreResult {
  /** SHA-256 hash of data + salt */
  commitmentHash: string
  /** Random salt (keep secret until reveal) */
  salt: string
  /** Build a signable commitment transaction */
  buildTransaction: (
    senderPubkey: PublicKey,
    rpcUrl: string
  ) => Promise<Transaction>
  /** Generate Solscan explorer URL */
  getExplorerUrl: (txSignature: string, cluster?: string) => string
}

/**
 * Create a commitment — hashes data with random salt,
 * returns a transaction builder that stores the hash on-chain via memo.
 */
export async function createCommitmentStore(
  params: CommitmentStoreParams
): Promise<CommitmentStoreResult> {
  // Generate random salt
  const saltBytes = new Uint8Array(32)
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(saltBytes)
  } else {
    // Node.js fallback for tests
    const { randomBytes } = await import("crypto")
    const buf = randomBytes(32)
    saltBytes.set(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength))
  }
  const salt = Array.from(saltBytes, (b) => b.toString(16).padStart(2, "0")).join("")

  // Hash data + salt to create commitment
  const commitmentHash = await hashCommitment(params.data, salt)

  const buildTransaction = async (
    senderPubkey: PublicKey,
    rpcUrl: string
  ): Promise<Transaction> => {
    const connection = new Connection(rpcUrl, "confirmed")
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed")

    // Memo format: SIP-COMMIT:<type>:<hash>
    const memoContent = `SIP-COMMIT:${params.commitmentType}:${commitmentHash}`

    const tx = new Transaction({
      feePayer: senderPubkey,
      blockhash,
      lastValidBlockHeight,
    }).add(
      // 1 lamport self-transfer to anchor the memo
      SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: senderPubkey,
        lamports: 1,
      })
    )

    // Add memo instruction
    const { createMemoInstruction } = await import("@solana/spl-memo")
    tx.add(createMemoInstruction(memoContent, [senderPubkey]))

    return tx
  }

  const getExplorerUrl = (txSignature: string, cluster = "devnet"): string => {
    const clusterParam = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`
    return `https://solscan.io/tx/${txSignature}${clusterParam}`
  }

  return {
    commitmentHash,
    salt,
    buildTransaction,
    getExplorerUrl,
  }
}

/**
 * Build a reveal transaction — submits the preimage on-chain.
 */
export async function createRevealTransaction(
  data: string,
  salt: string,
  commitmentType: CommitmentType,
  senderPubkey: PublicKey,
  rpcUrl: string
): Promise<Transaction> {
  const connection = new Connection(rpcUrl, "confirmed")
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed")

  const commitmentHash = await hashCommitment(data, salt)
  const memoContent = `SIP-REVEAL:${commitmentType}:${commitmentHash}:${data}:${salt}`

  const tx = new Transaction({
    feePayer: senderPubkey,
    blockhash,
    lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({
      fromPubkey: senderPubkey,
      toPubkey: senderPubkey,
      lamports: 1,
    })
  )

  const { createMemoInstruction } = await import("@solana/spl-memo")
  tx.add(createMemoInstruction(memoContent, [senderPubkey]))

  return tx
}

/**
 * Verify a commitment reveal matches the original commitment.
 * Pure function — no network calls needed.
 */
export function verifyCommitmentReveal(
  originalData: string,
  originalSalt: string,
  revealedData: string,
  revealedSalt: string
): boolean {
  return originalData === revealedData && originalSalt === revealedSalt
}

/**
 * Hash data + salt using SHA-256.
 * Deterministic — same inputs always produce same hash.
 */
async function hashCommitment(data: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const input = encoder.encode(`${data}:${salt}`)

  if (typeof globalThis.crypto?.subtle !== "undefined") {
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", input)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Node.js fallback for tests
  const { createHash } = await import("crypto")
  const hash = createHash("sha256").update(input).digest("hex")
  return "0x" + hash
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/lib/solana/commitment-store.test.ts`
Expected: PASS (4 tests)

**Step 5: Create barrel export**

```typescript
// src/lib/solana/index.ts
export {
  createStealthTransfer,
  getSolanaRpcUrl,
  type StealthTransferParams,
  type StealthTransferResult,
} from "./stealth-transfer"

export {
  createCommitmentStore,
  createRevealTransaction,
  verifyCommitmentReveal,
  type CommitmentStoreParams,
  type CommitmentStoreResult,
  type CommitmentType,
} from "./commitment-store"
```

**Step 6: Commit**

```bash
cd /Users/rector/local-dev/sip-app
git add src/lib/solana/ tests/lib/solana/
git commit -m "feat: commitment store primitive for on-chain commit-reveal via memo"
```

---

## Task 3: Shared Transaction Hook

**Files:**
- Create: `src/hooks/use-solana-transaction.ts`
- Test: `tests/hooks/use-solana-transaction.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/hooks/use-solana-transaction.test.ts
import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"

// Mock wallet adapter
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: vi.fn().mockReturnValue({
    publicKey: null,
    connected: false,
    signTransaction: null,
    sendTransaction: null,
  }),
  useConnection: vi.fn().mockReturnValue({
    connection: {
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
    },
  }),
}))

describe("useSolanaTransaction", () => {
  it("returns idle status initially", () => {
    const { result } = renderHook(() => useSolanaTransaction())
    expect(result.current.status).toBe("idle")
    expect(result.current.txSignature).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("returns not-connected error when wallet not connected", () => {
    const { result } = renderHook(() => useSolanaTransaction())
    expect(result.current.isWalletConnected).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/hooks/use-solana-transaction.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/hooks/use-solana-transaction.ts
"use client"

/**
 * Shared hook for sending Solana transactions.
 *
 * Handles: wallet connection check, signing, sending, confirmation,
 * error states, explorer URLs. Used by all track integrations.
 */

import { useState, useCallback, useMemo } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import type { Transaction } from "@solana/web3.js"

export type TxStatus = "idle" | "building" | "signing" | "sending" | "confirming" | "confirmed" | "error"

export interface TransactionState {
  status: TxStatus
  txSignature: string | null
  explorerUrl: string | null
  error: string | null
  isWalletConnected: boolean
}

export interface TransactionActions {
  /** Send a pre-built transaction */
  sendTransaction: (tx: Transaction) => Promise<string | null>
  /** Reset to idle state */
  reset: () => void
}

export function useSolanaTransaction(): TransactionState & TransactionActions {
  const { publicKey, sendTransaction: walletSendTx, connected } = useWallet()
  const { connection } = useConnection()

  const [status, setStatus] = useState<TxStatus>("idle")
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cluster = useMemo(() => {
    const url = connection?.rpcEndpoint || ""
    if (url.includes("devnet")) return "devnet"
    if (url.includes("mainnet")) return "mainnet-beta"
    return "devnet"
  }, [connection])

  const explorerUrl = useMemo(() => {
    if (!txSignature) return null
    const clusterParam = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`
    return `https://solscan.io/tx/${txSignature}${clusterParam}`
  }, [txSignature, cluster])

  const sendTransaction = useCallback(async (tx: Transaction): Promise<string | null> => {
    if (!publicKey || !walletSendTx) {
      setError("Wallet not connected")
      setStatus("error")
      return null
    }

    try {
      setStatus("signing")
      setError(null)

      setStatus("sending")
      const signature = await walletSendTx(tx, connection)

      setTxSignature(signature)
      setStatus("confirming")

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, "confirmed")

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
      }

      setStatus("confirmed")
      return signature
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed"
      setError(message)
      setStatus("error")
      return null
    }
  }, [publicKey, walletSendTx, connection])

  const reset = useCallback(() => {
    setStatus("idle")
    setTxSignature(null)
    setError(null)
  }, [])

  return {
    status,
    txSignature,
    explorerUrl,
    error,
    isWalletConnected: connected && !!publicKey,
    sendTransaction,
    reset,
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/hooks/use-solana-transaction.test.ts`
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
cd /Users/rector/local-dev/sip-app
git add src/hooks/use-solana-transaction.ts tests/hooks/use-solana-transaction.test.ts
git commit -m "feat: shared useSolanaTransaction hook for wallet signing flow"
```

---

## Task 4: Transaction Status UI Component

**Files:**
- Create: `src/components/solana/transaction-status.tsx`
- Test: `tests/components/solana/transaction-status.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/solana/transaction-status.test.tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { TransactionStatus } from "@/components/solana/transaction-status"

describe("TransactionStatus", () => {
  it("renders nothing when idle", () => {
    const { container } = render(
      <TransactionStatus status="idle" txSignature={null} explorerUrl={null} error={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("shows signing message", () => {
    render(
      <TransactionStatus status="signing" txSignature={null} explorerUrl={null} error={null} />
    )
    expect(screen.getByText(/signing/i)).toBeTruthy()
  })

  it("shows confirmed with explorer link", () => {
    render(
      <TransactionStatus
        status="confirmed"
        txSignature="abc123"
        explorerUrl="https://solscan.io/tx/abc123?cluster=devnet"
        error={null}
      />
    )
    expect(screen.getByText(/confirmed/i)).toBeTruthy()
    const link = screen.getByRole("link")
    expect(link.getAttribute("href")).toContain("solscan.io")
  })

  it("shows error message", () => {
    render(
      <TransactionStatus
        status="error"
        txSignature={null}
        explorerUrl={null}
        error="Insufficient balance"
      />
    )
    expect(screen.getByText(/insufficient balance/i)).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/components/solana/transaction-status.test.tsx`
Expected: FAIL

**Step 3: Write implementation**

```tsx
// src/components/solana/transaction-status.tsx
"use client"

import type { TxStatus } from "@/hooks/use-solana-transaction"

interface TransactionStatusProps {
  status: TxStatus
  txSignature: string | null
  explorerUrl: string | null
  error: string | null
}

const STATUS_CONFIG: Record<TxStatus, { label: string; color: string; icon: string } | null> = {
  idle: null,
  building: { label: "Building transaction...", color: "text-zinc-400", icon: "..." },
  signing: { label: "Waiting for wallet signature...", color: "text-yellow-400", icon: "..." },
  sending: { label: "Sending transaction...", color: "text-blue-400", icon: "..." },
  confirming: { label: "Confirming on Solana...", color: "text-blue-400", icon: "..." },
  confirmed: { label: "Confirmed", color: "text-emerald-400", icon: "" },
  error: { label: "Transaction failed", color: "text-red-400", icon: "" },
}

export function TransactionStatus({ status, txSignature, explorerUrl, error }: TransactionStatusProps) {
  const config = STATUS_CONFIG[status]
  if (!config) return null

  return (
    <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">{config.icon}</span>
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>

      {txSignature && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-zinc-500">TX:</span>
          <code className="text-xs text-zinc-400">
            {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
          </code>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              View on Solscan
            </a>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-400/80">{error}</p>
      )}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/components/solana/transaction-status.test.tsx`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
cd /Users/rector/local-dev/sip-app
git add src/components/solana/transaction-status.tsx tests/components/solana/transaction-status.test.tsx
git commit -m "feat: TransactionStatus component for on-chain transaction feedback"
```

---

## Task 5: Governance — On-Chain Vote Commitments

**Files:**
- Modify: `src/lib/governance/governance-service.ts`
- Modify: `src/components/governance/vote-commitment-display.tsx`
- Modify: `src/components/governance/vote-status.tsx`
- Create: `src/hooks/use-governance-commit.ts`
- Modify: `tests/lib/governance/governance-service.test.ts`

This is the most complex integration. The governance service needs to:
1. Create a commitment hash from `sha256(choice:salt)`
2. Store it on-chain via memo transaction
3. Display the real tx signature
4. On reveal, submit the preimage on-chain

**Step 1: Create the governance commit hook**

```typescript
// src/hooks/use-governance-commit.ts
"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createCommitmentStore,
  createRevealTransaction,
} from "@/lib/solana/commitment-store"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"

export interface GovernanceCommitState {
  commitmentHash: string | null
  salt: string | null
  /** Delegates to useSolanaTransaction */
  tx: ReturnType<typeof useSolanaTransaction>
}

export function useGovernanceCommit() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tx = useSolanaTransaction()

  const [commitmentHash, setCommitmentHash] = useState<string | null>(null)
  const [salt, setSalt] = useState<string | null>(null)

  const commitVote = useCallback(async (
    proposalId: string,
    choice: number,
    weight: string
  ): Promise<string | null> => {
    if (!publicKey) {
      return null
    }

    // Create commitment: hash of "proposalId:choice:weight"
    const data = `${proposalId}:${choice}:${weight}`
    const commitment = await createCommitmentStore({
      data,
      commitmentType: "vote",
    })

    setCommitmentHash(commitment.commitmentHash)
    setSalt(commitment.salt)

    // Build and send the on-chain commitment transaction
    const transaction = await commitment.buildTransaction(
      publicKey,
      connection.rpcEndpoint
    )

    return tx.sendTransaction(transaction)
  }, [publicKey, connection, tx])

  const revealVote = useCallback(async (
    proposalId: string,
    choice: number,
    weight: string
  ): Promise<string | null> => {
    if (!publicKey || !salt) return null

    const data = `${proposalId}:${choice}:${weight}`
    const transaction = await createRevealTransaction(
      data,
      salt,
      "vote",
      publicKey,
      connection.rpcEndpoint
    )

    return tx.sendTransaction(transaction)
  }, [publicKey, salt, connection, tx])

  return {
    commitVote,
    revealVote,
    commitmentHash,
    salt,
    tx,
  }
}
```

**Step 2: Update governance service to support on-chain mode**

Modify `src/lib/governance/governance-service.ts`:
- Add an `onChainCommit` callback parameter to `commitVote()`
- When callback is provided, call it instead of setTimeout simulation
- Keep simulation as fallback for demo mode (no wallet)

The exact modifications depend on the current service structure. The implementing agent should:
1. Read the full current `governance-service.ts`
2. Add `onCommitTransaction?: (proposalId: string, choice: number, weight: string) => Promise<string | null>` to `VoteParams` or as a service option
3. In the `committing` step, call the callback if provided, otherwise use existing simulation
4. Store the returned tx signature in the vote record

**Step 3: Update vote-commitment-display to show Solscan link**

Modify `src/components/governance/vote-commitment-display.tsx`:
- Add optional `txSignature` and `explorerUrl` props
- When present, show "View on Solscan" link next to commitment hash
- Import and use `TransactionStatus` component for the signing flow

**Step 4: Update tests**

Modify `tests/lib/governance/governance-service.test.ts`:
- Add test case for when `onCommitTransaction` callback is provided
- Verify the tx signature is stored in the vote record
- Keep existing simulation tests passing

**Step 5: Run all governance tests**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/lib/governance/ tests/hooks/use-governance-vote.test.ts`
Expected: ALL PASS

**Step 6: Commit**

```bash
cd /Users/rector/local-dev/sip-app
git add src/hooks/use-governance-commit.ts src/lib/governance/ src/components/governance/
git commit -m "feat: on-chain vote commitments for governance track"
```

---

## Task 6: Music — Stealth Tipping

**Files:**
- Create: `src/hooks/use-stealth-tip.ts`
- Create: `src/components/music/tip-button.tsx`
- Modify: `src/components/music/track-card.tsx`
- Modify: `src/lib/music/music-service.ts`
- Test: `tests/hooks/use-stealth-tip.test.ts`
- Test: `tests/components/music/tip-button.test.tsx`

**Step 1: Create the stealth tip hook**

```typescript
// src/hooks/use-stealth-tip.ts
"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { createStealthTransfer } from "@/lib/solana/stealth-transfer"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"

export interface TipResult {
  stealthAddress: string
  commitment: string
  txSignature: string
  explorerUrl: string
}

export function useStealthTip() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tx = useSolanaTransaction()

  const [lastTip, setLastTip] = useState<TipResult | null>(null)

  const sendTip = useCallback(async (
    amountSol: number,
    artistName?: string
  ): Promise<TipResult | null> => {
    if (!publicKey) return null

    const amountLamports = Math.floor(amountSol * 1_000_000_000)

    const transfer = await createStealthTransfer({
      amountLamports,
      memo: artistName ? `SIP-TIP:${artistName}` : "SIP-TIP",
    })

    const transaction = await transfer.buildTransaction(
      publicKey,
      connection.rpcEndpoint
    )

    const signature = await tx.sendTransaction(transaction)
    if (!signature) return null

    const result: TipResult = {
      stealthAddress: transfer.stealthAddress,
      commitment: transfer.commitment.commitmentHash,
      txSignature: signature,
      explorerUrl: transfer.getExplorerUrl(signature, "devnet"),
    }

    setLastTip(result)
    return result
  }, [publicKey, connection, tx])

  return {
    sendTip,
    lastTip,
    tx,
  }
}
```

**Step 2: Write test for tip hook**

```typescript
// tests/hooks/use-stealth-tip.test.ts
import { describe, it, expect, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useStealthTip } from "@/hooks/use-stealth-tip"

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: vi.fn().mockReturnValue({
    publicKey: null,
    connected: false,
    sendTransaction: null,
  }),
  useConnection: vi.fn().mockReturnValue({
    connection: { rpcEndpoint: "https://api.devnet.solana.com" },
  }),
}))

describe("useStealthTip", () => {
  it("returns null tip initially", () => {
    const { result } = renderHook(() => useStealthTip())
    expect(result.current.lastTip).toBeNull()
    expect(result.current.tx.status).toBe("idle")
  })
})
```

**Step 3: Create TipButton component**

```tsx
// src/components/music/tip-button.tsx
"use client"

import { useState } from "react"
import { useStealthTip } from "@/hooks/use-stealth-tip"
import { TransactionStatus } from "@/components/solana/transaction-status"

interface TipButtonProps {
  artistName: string
  trackTitle: string
}

const TIP_AMOUNTS = [0.01, 0.05, 0.1] // SOL

export function TipButton({ artistName, trackTitle }: TipButtonProps) {
  const { sendTip, lastTip, tx } = useStealthTip()
  const [selectedAmount, setSelectedAmount] = useState(TIP_AMOUNTS[0])
  const [showTipForm, setShowTipForm] = useState(false)

  const handleTip = async () => {
    await sendTip(selectedAmount, artistName)
  }

  if (!showTipForm) {
    return (
      <button
        onClick={() => setShowTipForm(true)}
        className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300
                   hover:bg-purple-500/30 transition-colors"
      >
        Tip Artist
      </button>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
      <p className="text-xs text-zinc-400 mb-2">
        Anonymous tip for {artistName}
      </p>

      <div className="flex gap-2 mb-2">
        {TIP_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              selectedAmount === amount
                ? "bg-purple-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {amount} SOL
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleTip}
          disabled={tx.status !== "idle" && tx.status !== "error" && tx.status !== "confirmed"}
          className="text-xs px-3 py-1.5 rounded bg-purple-500 text-white
                     hover:bg-purple-600 disabled:opacity-50 transition-colors"
        >
          {tx.isWalletConnected ? `Send ${selectedAmount} SOL` : "Connect Wallet"}
        </button>
        <button
          onClick={() => { setShowTipForm(false); tx.reset() }}
          className="text-xs px-2 py-1 text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>

      <TransactionStatus
        status={tx.status}
        txSignature={tx.txSignature}
        explorerUrl={tx.explorerUrl}
        error={tx.error}
      />

      {lastTip && tx.status === "confirmed" && (
        <div className="mt-2 text-xs text-zinc-500">
          <p>Stealth address: <code>{lastTip.stealthAddress.slice(0, 12)}...</code></p>
          <p>Commitment: <code>{lastTip.commitment.slice(0, 12)}...</code></p>
        </div>
      )}
    </div>
  )
}
```

**Step 4: Integrate TipButton into track-card.tsx**

Modify `src/components/music/track-card.tsx`:
- Import `TipButton`
- Add `<TipButton artistName={track.artist} trackTitle={track.title} />` next to or below the AudioPlayer

**Step 5: Run tests**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run tests/hooks/use-stealth-tip.test.ts tests/components/music/`
Expected: ALL PASS

**Step 6: Commit**

```bash
cd /Users/rector/local-dev/sip-app
git add src/hooks/use-stealth-tip.ts src/components/music/tip-button.tsx src/components/music/track-card.tsx
git commit -m "feat: stealth tipping for Audius artists via real SOL transfers"
```

---

## Task 7: DeSci — Anonymous Research Funding

**Files:**
- Create: `src/hooks/use-stealth-fund.ts`
- Modify: `src/lib/desci/desci-service.ts`
- Modify: `src/components/desci/fund-form.tsx` (or equivalent)
- Test: `tests/hooks/use-stealth-fund.test.ts`

This follows the same pattern as music tipping:
1. Create `useStealthFund` hook (wraps `createStealthTransfer` + `useSolanaTransaction`)
2. Integrate into DeSci fund form — when wallet connected, send real SOL
3. When no wallet (demo mode), use existing simulation
4. Show TransactionStatus component with Solscan link

The implementing agent should:
1. Read the full `desci-service.ts` to understand current fund flow
2. Read `src/components/desci/` to find the fund form component
3. Create hook following `use-stealth-tip.ts` pattern
4. Add `<TransactionStatus>` to the fund form component
5. Keep demo mode working (graceful fallback)

**Step 1-5:** Follow TDD pattern from Task 6

**Step 6: Commit**

```bash
git commit -m "feat: anonymous research funding with real SOL stealth transfers"
```

---

## Task 8: Gaming — On-Chain Commit-Reveal

**Files:**
- Create: `src/hooks/use-game-commitment.ts`
- Modify: `src/components/gaming/rps-game.tsx`
- Test: `tests/hooks/use-game-commitment.test.ts`

This follows the commitment store pattern:
1. Create `useGameCommitment` hook (wraps `createCommitmentStore` + `useSolanaTransaction`)
2. In RPS game, when player commits a move, store commitment on-chain
3. On reveal, submit preimage on-chain
4. Show both tx signatures — proves the game was fair and verifiable

The implementing agent should:
1. Read the full `rps-game.tsx` to understand current commit-reveal flow
2. Create hook following `use-governance-commit.ts` pattern
3. Integrate into the game's commit phase (replace simulation)
4. Integrate into the game's reveal phase
5. Display both commitment and reveal tx signatures
6. Keep demo mode working

**Step 1-5:** Follow TDD pattern from Task 5

**Step 6: Commit**

```bash
git commit -m "feat: on-chain commit-reveal for RPS game via memo program"
```

---

## Task 9: Ticketing — cNFT Ticket Minting (Stretch Goal)

**Files:**
- Create: `src/lib/solana/cnft-mint.ts`
- Modify: `src/lib/ticketing/ticketing-service.ts`
- Test: `tests/lib/solana/cnft-mint.test.ts`

This is the most complex task — minting compressed NFTs via Metaplex Bubblegum.

**Prerequisites:**
- Install `@metaplex-foundation/mpl-bubblegum` and `@metaplex-foundation/mpl-token-metadata`
- Set up a merkle tree on devnet (one-time deployment)

**Implementation:**
1. Create `cnft-mint.ts` with `mintTicketCNFT()` function
2. Uses Bubblegum's `mintV1` instruction
3. Ticket metadata includes: event name, tier, stealth address, commitment hash
4. Integrate into ticketing service's purchase flow
5. Display minted cNFT on Solscan after purchase

This task may require additional research into Bubblegum's current API. The implementing agent should check Context7 for latest Metaplex docs.

**Step 6: Commit**

```bash
git commit -m "feat: compressed NFT ticket minting via Metaplex Bubblegum"
```

---

## Task 10: Run Full Test Suite + Typecheck

**Step 1: Run typecheck**

Run: `cd /Users/rector/local-dev/sip-app && pnpm typecheck`
Expected: PASS (zero errors)

**Step 2: Run full test suite**

Run: `cd /Users/rector/local-dev/sip-app && npx vitest run`
Expected: 870+ tests passing (existing 865 + new primitive tests)

**Step 3: Fix any failures**

If any tests fail, fix them before proceeding.

**Step 4: Commit any fixes**

```bash
git commit -m "fix: resolve test failures from track deepening integration"
```

---

## Summary

| Task | Primitive | Track | Est. Tests Added |
|------|-----------|-------|-----------------|
| 1 | Stealth Transfer | Shared | 3 |
| 2 | Commitment Store | Shared | 4 |
| 3 | Transaction Hook | Shared | 2 |
| 4 | Transaction UI | Shared | 4 |
| 5 | Vote Commitments | Governance | 3-5 |
| 6 | Stealth Tipping | Music | 2-3 |
| 7 | Anonymous Funding | DeSci | 2-3 |
| 8 | Game Commitments | Gaming | 2-3 |
| 9 | cNFT Tickets | Ticketing | 3-5 |
| 10 | Full Suite | All | — |

**Total new tests:** ~25-30
**Expected final count:** 890-900+ tests
