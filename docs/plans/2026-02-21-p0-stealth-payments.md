# P0 Stealth Payments: History, Disclose, Wallet Switch

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the 3 P0 UX gaps for stealth payments — persist transaction history, wire disclose page to real data, fix wallet switch detection.

**Architecture:** Zustand store with `persist` middleware for history (localStorage scoped per wallet). Phantom `accountChanged` event listener for wallet switching. Disclose page wired to actual stealth keys and scanned payments.

**Tech Stack:** Zustand 5, @solana/wallet-adapter-react, localStorage, Vitest

---

### Task 1: Payment History Store

**Files:**
- Create: `src/stores/payment-history.ts`
- Test: `tests/stores/payment-history.test.ts`
- Modify: `src/hooks/use-send-payment.ts`
- Modify: `src/hooks/use-claim-transfer.ts`

**Step 1: Write the store test**

```typescript
// tests/stores/payment-history.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { usePaymentHistoryStore } from "@/stores/payment-history"

describe("usePaymentHistoryStore", () => {
  beforeEach(() => {
    usePaymentHistoryStore.getState().clear()
  })

  it("adds a sent payment", () => {
    const store = usePaymentHistoryStore.getState()
    store.addSent({
      recipient: "sip:solana:abc:def",
      amount: 0.005,
      token: "SOL",
      txSignature: "5abc123",
      stealthAddress: "CtQfp5...",
      timestamp: Date.now(),
    })
    expect(store.getAll("testWallet").length).toBe(1)
    expect(store.getAll("testWallet")[0].type).toBe("sent")
  })

  it("adds a claimed payment", () => {
    const store = usePaymentHistoryStore.getState()
    store.addClaimed({
      transferRecordPda: "636Vi...",
      amount: 0.005,
      token: "SOL",
      txSignature: "5kzYX...",
      stealthAddress: "CtQfp5...",
      timestamp: Date.now(),
    })
    expect(store.getAll("testWallet").length).toBe(1)
    expect(store.getAll("testWallet")[0].type).toBe("claimed")
  })

  it("returns payments for specific wallet only", () => {
    const store = usePaymentHistoryStore.getState()
    store.addSent({
      walletAddress: "walletA",
      recipient: "sip:solana:abc:def",
      amount: 0.005,
      token: "SOL",
      txSignature: "tx1",
      stealthAddress: "stealth1",
      timestamp: Date.now(),
    })
    store.addSent({
      walletAddress: "walletB",
      recipient: "sip:solana:ghi:jkl",
      amount: 0.01,
      token: "SOL",
      txSignature: "tx2",
      stealthAddress: "stealth2",
      timestamp: Date.now(),
    })
    expect(store.getAll("walletA").length).toBe(1)
    expect(store.getAll("walletB").length).toBe(1)
  })

  it("limits to 100 entries per wallet", () => {
    const store = usePaymentHistoryStore.getState()
    for (let i = 0; i < 110; i++) {
      store.addSent({
        walletAddress: "wallet",
        recipient: "sip:solana:abc:def",
        amount: 0.001,
        token: "SOL",
        txSignature: `tx${i}`,
        stealthAddress: `stealth${i}`,
        timestamp: Date.now() + i,
      })
    }
    expect(store.getAll("wallet").length).toBe(100)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stores/payment-history.test.ts`
Expected: FAIL — module not found

**Step 3: Write the store**

```typescript
// src/stores/payment-history.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface HistoryEntry {
  id: string
  type: "sent" | "claimed"
  walletAddress: string
  amount: number
  token: string
  txSignature: string
  stealthAddress: string
  recipient?: string           // meta-address (sent only)
  transferRecordPda?: string   // PDA (claimed only)
  timestamp: number
}

interface AddSentParams {
  walletAddress?: string
  recipient: string
  amount: number
  token: string
  txSignature: string
  stealthAddress: string
  timestamp: number
}

interface AddClaimedParams {
  walletAddress?: string
  transferRecordPda: string
  amount: number
  token: string
  txSignature: string
  stealthAddress: string
  timestamp: number
}

const MAX_ENTRIES_PER_WALLET = 100

interface PaymentHistoryState {
  entries: HistoryEntry[]
  addSent: (params: AddSentParams) => void
  addClaimed: (params: AddClaimedParams) => void
  getAll: (walletAddress: string) => HistoryEntry[]
  getSent: (walletAddress: string) => HistoryEntry[]
  getClaimed: (walletAddress: string) => HistoryEntry[]
  clear: () => void
}

export const usePaymentHistoryStore = create<PaymentHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],

      addSent: (params) => {
        const wallet = params.walletAddress ?? "unknown"
        const entry: HistoryEntry = {
          id: `sent_${params.txSignature}`,
          type: "sent",
          walletAddress: wallet,
          amount: params.amount,
          token: params.token,
          txSignature: params.txSignature,
          stealthAddress: params.stealthAddress,
          recipient: params.recipient,
          timestamp: params.timestamp,
        }
        set((state) => {
          const walletEntries = state.entries.filter(
            (e) => e.walletAddress === wallet
          )
          const otherEntries = state.entries.filter(
            (e) => e.walletAddress !== wallet
          )
          const updated = [entry, ...walletEntries].slice(
            0,
            MAX_ENTRIES_PER_WALLET
          )
          return { entries: [...updated, ...otherEntries] }
        })
      },

      addClaimed: (params) => {
        const wallet = params.walletAddress ?? "unknown"
        const entry: HistoryEntry = {
          id: `claimed_${params.txSignature}`,
          type: "claimed",
          walletAddress: wallet,
          amount: params.amount,
          token: params.token,
          txSignature: params.txSignature,
          stealthAddress: params.stealthAddress,
          transferRecordPda: params.transferRecordPda,
          timestamp: params.timestamp,
        }
        set((state) => {
          const walletEntries = state.entries.filter(
            (e) => e.walletAddress === wallet
          )
          const otherEntries = state.entries.filter(
            (e) => e.walletAddress !== wallet
          )
          const updated = [entry, ...walletEntries].slice(
            0,
            MAX_ENTRIES_PER_WALLET
          )
          return { entries: [...updated, ...otherEntries] }
        })
      },

      getAll: (walletAddress) =>
        get()
          .entries.filter((e) => e.walletAddress === walletAddress)
          .sort((a, b) => b.timestamp - a.timestamp),

      getSent: (walletAddress) =>
        get()
          .entries.filter(
            (e) => e.walletAddress === walletAddress && e.type === "sent"
          )
          .sort((a, b) => b.timestamp - a.timestamp),

      getClaimed: (walletAddress) =>
        get()
          .entries.filter(
            (e) => e.walletAddress === walletAddress && e.type === "claimed"
          )
          .sort((a, b) => b.timestamp - a.timestamp),

      clear: () => set({ entries: [] }),
    }),
    {
      name: "sip-payment-history",
    }
  )
)
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/stores/payment-history.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/stores/payment-history.ts tests/stores/payment-history.test.ts
git commit -m "feat: add payment history Zustand store with persistence"
```

---

### Task 2: Wire History Store into Send + Claim Hooks

**Files:**
- Modify: `src/hooks/use-send-payment.ts` (~line 120, after `setTxHash(signature)`)
- Modify: `src/hooks/use-claim-transfer.ts` (~line 64, after `confirmTransaction`)

**Step 1: Wire use-send-payment.ts**

After `setTxHash(signature)` at ~line 120, add:

```typescript
import { usePaymentHistoryStore } from "@/stores/payment-history"

// Inside the send callback, after setTxHash(signature):
usePaymentHistoryStore.getState().addSent({
  walletAddress: publicKey.toBase58(),
  recipient: params.recipient,
  amount: amountSol,
  token: params.token.symbol,
  txSignature: signature,
  stealthAddress: transfer.stealthAddress,
  timestamp: Date.now(),
})
```

**Step 2: Wire use-claim-transfer.ts**

After `confirmTransaction` at ~line 64, add:

```typescript
import { usePaymentHistoryStore } from "@/stores/payment-history"

// Inside the claim callback, after confirmTransaction:
usePaymentHistoryStore.getState().addClaimed({
  walletAddress: publicKey.toBase58(),
  transferRecordPda: payment.transferRecordPda,
  amount: payment.amount,
  token: payment.token,
  txSignature: signature,
  stealthAddress: payment.stealthAddress,
  timestamp: Date.now(),
})
```

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: 968+ tests pass (no existing tests broken)

**Step 4: Commit**

```bash
git add src/hooks/use-send-payment.ts src/hooks/use-claim-transfer.ts
git commit -m "feat: record sent and claimed payments in history store"
```

---

### Task 3: Update History Page to Use Real Data

**Files:**
- Modify: `src/app/(payments)/payments/history/page.tsx`

**Step 1: Replace mock data with store**

Replace the entire history page to use `usePaymentHistoryStore` + `useScanPayments` for a combined view. Key changes:

- Import `usePaymentHistoryStore` instead of mock data
- Import `useWallet` to get current wallet address
- Map `HistoryEntry` to the existing UI format
- Remove `EncryptedTransaction` / `decryptTransaction` logic (not applicable to stealth payments)
- Keep filter buttons (all, sent, received/claimed)
- Add Solscan links using `txSignature`

The page should show:
- **Sent:** From payment history store (persisted)
- **Claimed:** From payment history store (persisted)
- **Pending (unclaimed):** From scan results (live from chain)

**Step 2: Run app locally to verify**

Run: `npx next dev` and navigate to `/payments/history`
Expected: Shows real transaction history from localStorage

**Step 3: Commit**

```bash
git add src/app/\(payments\)/payments/history/page.tsx
git commit -m "feat: wire history page to real payment history store"
```

---

### Task 4: Wallet Switch Detection

**Files:**
- Create: `src/hooks/use-wallet-account-change.ts`
- Test: `tests/hooks/use-wallet-account-change.test.ts`
- Modify: `src/providers/wallet-provider.tsx`

**Step 1: Write the hook test**

```typescript
// tests/hooks/use-wallet-account-change.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

describe("useWalletAccountChange", () => {
  it("exports the hook", async () => {
    const mod = await import("@/hooks/use-wallet-account-change")
    expect(typeof mod.useWalletAccountChange).toBe("function")
  })
})
```

**Step 2: Write the hook**

```typescript
// src/hooks/use-wallet-account-change.ts
"use client"

import { useEffect, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

/**
 * Detects Phantom account switches and triggers disconnect/reconnect.
 * Solana wallet adapter doesn't always detect mid-session account changes.
 */
export function useWalletAccountChange() {
  const { disconnect, select, wallet, publicKey } = useWallet()
  const prevKeyRef = useRef<string | null>(null)

  useEffect(() => {
    const phantom = (window as any)?.phantom?.solana

    if (!phantom || !wallet) return

    const handleAccountChanged = (newPublicKey: any) => {
      const newKey = newPublicKey?.toBase58?.() ?? null
      const prevKey = prevKeyRef.current

      // Account removed (locked) or changed
      if (!newKey) {
        disconnect()
      } else if (prevKey && newKey !== prevKey) {
        // Account switched — disconnect and reconnect
        disconnect().then(() => {
          // Re-select same wallet adapter to trigger reconnect
          if (wallet.adapter.name) {
            select(wallet.adapter.name)
          }
        })
      }

      prevKeyRef.current = newKey
    }

    // Track current key
    prevKeyRef.current = publicKey?.toBase58() ?? null

    phantom.on("accountChanged", handleAccountChanged)

    return () => {
      phantom.removeListener("accountChanged", handleAccountChanged)
    }
  }, [wallet, publicKey, disconnect, select])
}
```

**Step 3: Wire into WalletProvider**

In `src/providers/wallet-provider.tsx`, add a wrapper component inside the providers that calls the hook:

```typescript
import { useWalletAccountChange } from "@/hooks/use-wallet-account-change"

function WalletAccountChangeListener() {
  useWalletAccountChange()
  return null
}

// Inside the JSX, add after WalletModalProvider opens:
<WalletModalProvider>
  <WalletAccountChangeListener />
  {children}
</WalletModalProvider>
```

**Step 4: Run tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/hooks/use-wallet-account-change.ts tests/hooks/use-wallet-account-change.test.ts src/providers/wallet-provider.tsx
git commit -m "fix: detect Phantom account switches without page refresh"
```

---

### Task 5: Wire Disclose Page to Real Stealth Data

**Files:**
- Modify: `src/app/(payments)/payments/disclose/page.tsx`

**Step 1: Check current disclose page state**

Read `src/app/(payments)/payments/disclose/page.tsx` and its sub-components in `src/components/disclosure/`. Determine what's already wired vs scaffolded.

**Step 2: Ensure Share Key tab shows stealth viewing public key**

The Share Key panel should:
- Display the wallet's viewing public key (from `useStealthKeys().keys.viewingPublicKey`)
- Generate QR code for it
- Allow copy-to-clipboard
- Show warning that sharing this key reveals all incoming payments

If the existing `ShareKeyPanel` uses `useViewingKeyDisclosure` which generates SDK-level viewing keys (different from stealth keys), add a "Stealth Viewing Key" section that shows the base58 viewing public key from `useStealthKeys`.

**Step 3: Ensure compliance report shows real scanned payments**

The Export Report panel should pull from:
- `usePaymentHistoryStore` for sent/claimed history
- `useScanPayments` for current on-chain state

Generate a JSON/CSV report with: timestamp, type, amount, token, stealthAddress, txSignature.

**Step 4: Commit**

```bash
git add src/app/\(payments\)/payments/disclose/page.tsx src/components/disclosure/
git commit -m "feat: wire disclose page to real stealth keys and payment data"
```

---

### Task 6: Final Integration Test

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass (968+ original + new tests)

**Step 2: Manual E2E verification**

1. Connect Wallet A → Send 0.002 SOL to Wallet B's meta-address
2. Check History page → should show the sent payment
3. Switch to Wallet B (no page refresh needed!) → History should be empty for this wallet
4. Go to Scan → find payment → Claim
5. Check History → should show claimed payment
6. Go to Disclose → Share Key tab shows viewing public key
7. Go to Disclose → Export Report shows both sent and claimed entries (depending on which wallet is connected)

**Step 3: Final commit**

```bash
git add -A
git commit -m "test: verify P0 stealth payment features end-to-end"
```
