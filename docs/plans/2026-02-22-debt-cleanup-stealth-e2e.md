# Tech Debt Cleanup + Production Stealth Payment Hardening

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clean all lint warnings, merge dependency updates, then harden the already-real stealth payment flow with network toggle, retry logic, gas estimation, and production UX.

**Architecture:** The send → scan → claim flow is already wired to the live SIP Anchor program (`S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at`) on mainnet-beta via Helius RPC. Phase B adds a devnet/mainnet toggle, retry with backoff, priority fee estimation, and polished loading/error states.

**Tech Stack:** Next.js 16, React 19, @solana/web3.js, @solana/wallet-adapter-react, Zustand 5, @sip-protocol/sdk 0.7.3, Vitest, Tailwind 4

---

## Phase A: Tech Debt Cleanup

### Task 1: Fix all lint warnings

**Files:**
- Modify: `src/hooks/use-*.ts` (14 files with privacyMap warnings)
- Modify: `src/lib/privacy/backends/*.ts` (unused params)
- Modify: `src/lib/solana/*.ts` (unused vars)
- Modify: `src/lib/social/stealth-social.ts`
- Modify: `src/lib/wallet-deposit.ts`
- Modify: `src/lib/zcash-validation.ts`
- Modify: `src/lib/sip-client.ts`
- Modify: `src/stores/wallet.ts`
- Modify: `tests/**/*.ts` (unused imports/vars)
- Modify: `src/components/dao/dao-badge.tsx` (img → next/image)

**Step 1: Run lint and categorize all 88 warnings**

Run: `cd /Users/rector/local-dev/sip-app && pnpm lint 2>&1 | grep "warning" | sort`
Expected: 88 warnings across ~25 files

**Step 2: Fix privacyMap useCallback dependency warnings (~14 files)**

These are in hooks like `use-governance-vote.ts`, `use-mint-nft.ts`, etc. The `privacyMap` object is recreated each render but used in a useCallback. Fix by wrapping `privacyMap` in `useMemo`:

```typescript
// Before (in each affected hook):
const privacyMap = {
  transparent: () => "public",
  shielded: () => "private",
  compliant: () => "compliant",
}

// After:
const privacyMap = useMemo(() => ({
  transparent: () => "public",
  shielded: () => "private",
  compliant: () => "compliant",
}), [])
```

**Step 3: Fix unused variables (~15 files)**

- Privacy backends (`arcium.ts`, `inco.ts`, `mock.ts`, `privacycash.ts`): Prefix unused callback params with `_` (e.g., `_fromBlock`, `_address`, `_viewingKey`)
- `sip-client.ts:129` — remove unused `sdk` variable
- `stealth-social.ts:43,71` — remove unused `_viewingKeyHex`
- `stealth-transfer.ts:92` — remove unused `_blindingHex`
- `wallet-deposit.ts:236-238` — remove unused destructured vars
- `zcash-validation.ts:31` — remove unused `BASE58_REGEX`
- `wallet.ts:2` — remove unused `ChainId` import

**Step 4: Fix test file warnings (~5 files)**

- `tests/components/shared/shared-components.test.tsx:9` — remove unused `initial`, `animate`, `exit`, `transition` destructuring
- `tests/hooks/use-stealth-keys.test.ts:20` — remove unused `str` param
- `tests/lib/bridge/stealth-bridge.test.ts:1` — remove unused `vi` import
- `tests/lib/governance/governance-service.test.ts:8,27` — remove unused `callCount`, `_key`
- `tests/lib/solana/*.test.ts` — prefix mock params with `_`
- `tests/components/privacy-dashboard/RiskHeatmap.test.tsx:2` — remove unused `screen`

**Step 5: Fix img → next/image**

- `src/components/dao/dao-badge.tsx` — replace `<img>` with `<Image>` from `next/image`

**Step 6: Run lint and verify 0 warnings**

Run: `cd /Users/rector/local-dev/sip-app && pnpm lint 2>&1 | tail -5`
Expected: `0 problems (0 errors, 0 warnings)` or warnings-only from external deps

**Step 7: Run tests to confirm nothing broke**

Run: `cd /Users/rector/local-dev/sip-app && pnpm test -- --run 2>&1 | tail -5`
Expected: `112 passed (1136)` or similar all-pass

**Step 8: Commit**

```bash
git add -A
git commit -m "chore: fix all 88 lint warnings (privacyMap deps, unused vars, img→Image)"
```

---

### Task 2: Merge dependabot PR

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Step 1: Check the dependabot PR status**

Run: `cd /Users/rector/local-dev/sip-app && gh pr list --state open --author dependabot`
Expected: One PR with 24 dep updates

**Step 2: Checkout the dependabot branch locally**

Run: `cd /Users/rector/local-dev/sip-app && gh pr checkout <PR_NUMBER>`

**Step 3: Check what's failing**

Run: `cd /Users/rector/local-dev/sip-app && pnpm install && pnpm lint 2>&1 | tail -10`
Run: `cd /Users/rector/local-dev/sip-app && pnpm typecheck 2>&1 | tail -10`
Run: `cd /Users/rector/local-dev/sip-app && pnpm test -- --run 2>&1 | tail -10`

**Step 4: Fix whatever breaks**

Common issues with dep bumps: type changes, API changes, peer dep conflicts. Fix and commit on the branch.

**Step 5: Push fixes and merge**

Run: `cd /Users/rector/local-dev/sip-app && git push && gh pr merge <PR_NUMBER> --merge`

**Step 6: Return to main and pull**

Run: `cd /Users/rector/local-dev/sip-app && git checkout main && git pull`

**Step 7: Verify CI passes**

Run: `cd /Users/rector/local-dev/sip-app && gh run list --limit 3`
Expected: CI `completed` `success`

---

## Phase B: Production Stealth Payment Hardening

### Task 3: Add network configuration store

**Files:**
- Create: `src/stores/network.ts`
- Test: `tests/stores/network.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/stores/network.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { useNetworkStore } from "@/stores/network"

describe("NetworkStore", () => {
  beforeEach(() => {
    useNetworkStore.getState().reset()
  })

  it("defaults to devnet", () => {
    const { cluster } = useNetworkStore.getState()
    expect(cluster).toBe("devnet")
  })

  it("switches to mainnet-beta", () => {
    useNetworkStore.getState().setCluster("mainnet-beta")
    const { cluster, rpcUrl } = useNetworkStore.getState()
    expect(cluster).toBe("mainnet-beta")
    expect(rpcUrl).toContain("mainnet")
  })

  it("uses custom RPC when set", () => {
    useNetworkStore.getState().setCustomRpc("https://my-rpc.com")
    const { rpcUrl } = useNetworkStore.getState()
    expect(rpcUrl).toBe("https://my-rpc.com")
  })

  it("returns correct explorer URL", () => {
    useNetworkStore.getState().setCluster("devnet")
    const { getExplorerUrl } = useNetworkStore.getState()
    expect(getExplorerUrl("abc123")).toContain("?cluster=devnet")
  })

  it("persists cluster selection", () => {
    useNetworkStore.getState().setCluster("mainnet-beta")
    // Zustand persist middleware handles this
    const { cluster } = useNetworkStore.getState()
    expect(cluster).toBe("mainnet-beta")
  })

  it("returns isMainnet flag", () => {
    useNetworkStore.getState().setCluster("devnet")
    expect(useNetworkStore.getState().isMainnet).toBe(false)
    useNetworkStore.getState().setCluster("mainnet-beta")
    expect(useNetworkStore.getState().isMainnet).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/stores/network.test.ts`
Expected: FAIL — module not found

**Step 3: Implement network store**

```typescript
// src/stores/network.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { clusterApiUrl } from "@solana/web3.js"

type Cluster = "devnet" | "mainnet-beta"

interface NetworkState {
  cluster: Cluster
  customRpc: string | null
  rpcUrl: string
  isMainnet: boolean
  setCluster: (cluster: Cluster) => void
  setCustomRpc: (url: string | null) => void
  getExplorerUrl: (txOrAddress: string) => string
  reset: () => void
}

const HELIUS_MAINNET = process.env.NEXT_PUBLIC_RPC_URL
  || (process.env.NEXT_PUBLIC_SIP_APP_HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_SIP_APP_HELIUS_API_KEY}`
    : "https://api.mainnet-beta.solana.com")

function getRpcUrl(cluster: Cluster, customRpc: string | null): string {
  if (customRpc) return customRpc
  if (cluster === "mainnet-beta") return HELIUS_MAINNET
  return clusterApiUrl("devnet")
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      cluster: "devnet" as Cluster,
      customRpc: null,
      rpcUrl: clusterApiUrl("devnet"),
      isMainnet: false,

      setCluster: (cluster) =>
        set({
          cluster,
          rpcUrl: getRpcUrl(cluster, get().customRpc),
          isMainnet: cluster === "mainnet-beta",
        }),

      setCustomRpc: (url) =>
        set({
          customRpc: url,
          rpcUrl: url || getRpcUrl(get().cluster, null),
        }),

      getExplorerUrl: (txOrAddress) => {
        const base = `https://solscan.io/tx/${txOrAddress}`
        return get().cluster === "devnet" ? `${base}?cluster=devnet` : base
      },

      reset: () =>
        set({
          cluster: "devnet",
          customRpc: null,
          rpcUrl: clusterApiUrl("devnet"),
          isMainnet: false,
        }),
    }),
    { name: "sip-network" }
  )
)
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/stores/network.test.ts`
Expected: 6 tests PASS

**Step 5: Commit**

```bash
git add src/stores/network.ts tests/stores/network.test.ts
git commit -m "feat: add network configuration store with devnet/mainnet toggle"
```

---

### Task 4: Wire network store to wallet provider

**Files:**
- Modify: `src/providers/wallet-provider.tsx`
- Test: manual verification (provider is a wrapper component)

**Step 1: Read current wallet-provider.tsx**

Understand the current hardcoded endpoint at line 26-28.

**Step 2: Replace hardcoded endpoint with network store**

```typescript
// src/providers/wallet-provider.tsx
// Replace:
const endpoint = useMemo(
  () => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("mainnet-beta"),
  []
)

// With:
import { useNetworkStore } from "@/stores/network"

// Inside component:
const rpcUrl = useNetworkStore((s) => s.rpcUrl)
const endpoint = useMemo(() => rpcUrl, [rpcUrl])
```

**Step 3: Run typecheck**

Run: `cd /Users/rector/local-dev/sip-app && pnpm typecheck`
Expected: Clean

**Step 4: Run full test suite**

Run: `cd /Users/rector/local-dev/sip-app && pnpm test -- --run 2>&1 | tail -5`
Expected: All 1,136+ tests pass

**Step 5: Commit**

```bash
git add src/providers/wallet-provider.tsx
git commit -m "feat: wire network store to wallet provider for dynamic RPC switching"
```

---

### Task 5: Add network selector to settings page

**Files:**
- Modify: settings page (find exact path in `src/app/`)
- Create: `src/components/settings/network-selector.tsx`
- Test: `tests/components/settings/network-selector.test.tsx`

**Step 1: Find the settings page**

Run: `find src/app -path "*settings*" -name "page.tsx"` or check the tab structure.

**Step 2: Write the failing test**

```typescript
// tests/components/settings/network-selector.test.tsx
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { NetworkSelector } from "@/components/settings/network-selector"

describe("NetworkSelector", () => {
  it("renders with devnet selected by default", () => {
    render(<NetworkSelector />)
    expect(screen.getByText("Devnet")).toBeInTheDocument()
  })

  it("shows mainnet warning when switching to mainnet", () => {
    render(<NetworkSelector />)
    fireEvent.click(screen.getByText("Mainnet"))
    expect(screen.getByText(/real SOL/i)).toBeInTheDocument()
  })

  it("shows network badge color", () => {
    render(<NetworkSelector />)
    const badge = screen.getByTestId("network-badge")
    expect(badge.className).toContain("purple") // devnet = purple
  })
})
```

**Step 3: Run test to verify it fails**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/components/settings/network-selector.test.tsx`
Expected: FAIL

**Step 4: Implement NetworkSelector component**

```typescript
// src/components/settings/network-selector.tsx
"use client"

import { useNetworkStore } from "@/stores/network"
import { useState } from "react"

export function NetworkSelector() {
  const { cluster, setCluster, isMainnet } = useNetworkStore()
  const [showWarning, setShowWarning] = useState(false)

  const handleSwitch = (target: "devnet" | "mainnet-beta") => {
    if (target === "mainnet-beta" && !isMainnet) {
      setShowWarning(true)
      return
    }
    setCluster(target)
    setShowWarning(false)
  }

  const confirmMainnet = () => {
    setCluster("mainnet-beta")
    setShowWarning(false)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-zinc-400">Network</label>
      <div className="flex gap-2">
        <button
          onClick={() => handleSwitch("devnet")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            cluster === "devnet"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Devnet
        </button>
        <button
          onClick={() => handleSwitch("mainnet-beta")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            cluster === "mainnet-beta"
              ? "bg-green-500/20 text-green-400 border border-green-500/40"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Mainnet
        </button>
      </div>

      <div
        data-testid="network-badge"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isMainnet
            ? "bg-green-500/10 text-green-400"
            : "bg-purple-500/10 text-purple-400"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isMainnet ? "bg-green-400" : "bg-purple-400"}`} />
        {isMainnet ? "Mainnet-Beta" : "Devnet"}
      </div>

      {showWarning && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm text-amber-400 font-medium">
            Switching to Mainnet uses real SOL. Proceed with caution.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={confirmMainnet}
              className="px-3 py-1.5 text-xs rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowWarning(false)}
              className="px-3 py-1.5 text-xs rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 5: Add NetworkSelector to settings page**

Import and add `<NetworkSelector />` to the settings page layout.

**Step 6: Run tests**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/components/settings/network-selector.test.tsx`
Expected: 3 tests PASS

**Step 7: Commit**

```bash
git add src/components/settings/network-selector.tsx tests/components/settings/network-selector.test.tsx src/app/*settings*/page.tsx
git commit -m "feat: add network selector with devnet/mainnet toggle and mainnet warning"
```

---

### Task 6: Add network badge to navigation

**Files:**
- Modify: nav/header component (find in `src/components/` — likely `nav.tsx`, `header.tsx`, or layout)
- Test: visual verification

**Step 1: Find the nav component**

Run: `grep -rl "SIP" src/components/ --include="*.tsx" | head -10` or check layout files.

**Step 2: Add compact network badge next to logo/title**

```typescript
import { useNetworkStore } from "@/stores/network"

// Inside nav component:
const { cluster, isMainnet } = useNetworkStore()

// Render badge:
<span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
  isMainnet ? "bg-green-500/10 text-green-400" : "bg-purple-500/10 text-purple-400"
}`}>
  {isMainnet ? "mainnet" : "devnet"}
</span>
```

**Step 3: Typecheck + visual verify**

Run: `cd /Users/rector/local-dev/sip-app && pnpm typecheck`

**Step 4: Commit**

```bash
git add src/components/*nav* src/components/*header* src/app/layout.tsx
git commit -m "feat: add network badge to navigation header"
```

---

### Task 7: Add retry logic with exponential backoff

**Files:**
- Create: `src/lib/solana/retry.ts`
- Test: `tests/lib/solana/retry.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/lib/solana/retry.test.ts
import { describe, it, expect, vi } from "vitest"
import { withRetry } from "@/lib/solana/retry"

describe("withRetry", () => {
  it("returns on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok")
    const result = await withRetry(fn)
    expect(result).toBe("ok")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("retries on failure then succeeds", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("RPC timeout"))
      .mockResolvedValue("ok")
    const result = await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 })
    expect(result).toBe("ok")
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it("throws after max retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"))
    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 10 }))
      .rejects.toThrow("always fails")
    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it("does not retry non-retryable errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("User rejected"))
    await expect(withRetry(fn, { maxRetries: 3, baseDelayMs: 10 }))
      .rejects.toThrow("User rejected")
    expect(fn).toHaveBeenCalledTimes(1) // no retry
  })

  it("applies exponential backoff", async () => {
    const delays: number[] = []
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValue("ok")

    await withRetry(fn, {
      maxRetries: 3,
      baseDelayMs: 100,
      onRetry: (attempt, delay) => delays.push(delay),
    })

    expect(delays.length).toBe(2)
    expect(delays[1]).toBeGreaterThan(delays[0]) // exponential
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/lib/solana/retry.test.ts`
Expected: FAIL

**Step 3: Implement retry utility**

```typescript
// src/lib/solana/retry.ts

const NON_RETRYABLE = [
  "User rejected",
  "user rejected",
  "User cancelled",
  "Transaction cancelled",
  "Wallet not connected",
  "insufficient funds",
  "Insufficient balance",
]

interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  onRetry?: (attempt: number, delayMs: number, error: Error) => void
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, onRetry } = options
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry user-initiated cancellations or known non-transient errors
      if (NON_RETRYABLE.some((msg) => lastError!.message.includes(msg))) {
        throw lastError
      }

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5)
        onRetry?.(attempt + 1, delay, lastError)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/lib/solana/retry.test.ts`
Expected: 5 tests PASS

**Step 5: Commit**

```bash
git add src/lib/solana/retry.ts tests/lib/solana/retry.test.ts
git commit -m "feat: add retry utility with exponential backoff for RPC calls"
```

---

### Task 8: Add priority fee estimation

**Files:**
- Create: `src/lib/solana/priority-fees.ts`
- Test: `tests/lib/solana/priority-fees.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/lib/solana/priority-fees.test.ts
import { describe, it, expect, vi } from "vitest"
import { estimatePriorityFee } from "@/lib/solana/priority-fees"

// Mock connection
const mockConnection = {
  getRecentPrioritizationFees: vi.fn(),
}

describe("estimatePriorityFee", () => {
  it("returns median fee from recent samples", async () => {
    mockConnection.getRecentPrioritizationFees.mockResolvedValue([
      { prioritizationFee: 1000 },
      { prioritizationFee: 5000 },
      { prioritizationFee: 3000 },
      { prioritizationFee: 2000 },
      { prioritizationFee: 4000 },
    ])

    const fee = await estimatePriorityFee(mockConnection as never)
    expect(fee).toBe(3000) // median
  })

  it("returns minimum floor when no recent fees", async () => {
    mockConnection.getRecentPrioritizationFees.mockResolvedValue([])
    const fee = await estimatePriorityFee(mockConnection as never)
    expect(fee).toBe(50_000) // floor
  })

  it("caps at maximum", async () => {
    mockConnection.getRecentPrioritizationFees.mockResolvedValue([
      { prioritizationFee: 10_000_000 },
    ])
    const fee = await estimatePriorityFee(mockConnection as never)
    expect(fee).toBeLessThanOrEqual(500_000)
  })

  it("falls back to default on RPC error", async () => {
    mockConnection.getRecentPrioritizationFees.mockRejectedValue(
      new Error("RPC error")
    )
    const fee = await estimatePriorityFee(mockConnection as never)
    expect(fee).toBe(50_000) // default
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/lib/solana/priority-fees.test.ts`
Expected: FAIL

**Step 3: Implement priority fee estimation**

```typescript
// src/lib/solana/priority-fees.ts
import type { Connection } from "@solana/web3.js"

const MIN_FEE = 50_000    // 50K microlamports (floor)
const MAX_FEE = 500_000   // 500K microlamports (cap)

export async function estimatePriorityFee(
  connection: Connection
): Promise<number> {
  try {
    const fees = await connection.getRecentPrioritizationFees()

    if (!fees.length) return MIN_FEE

    const sorted = fees
      .map((f) => f.prioritizationFee)
      .filter((f) => f > 0)
      .sort((a, b) => a - b)

    if (!sorted.length) return MIN_FEE

    // Use p75 (75th percentile) for reliable inclusion
    const idx = Math.floor(sorted.length * 0.75)
    const estimate = sorted[idx]

    return Math.min(Math.max(estimate, MIN_FEE), MAX_FEE)
  } catch {
    return MIN_FEE
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/lib/solana/priority-fees.test.ts`
Expected: 4 tests PASS

**Step 5: Commit**

```bash
git add src/lib/solana/priority-fees.ts tests/lib/solana/priority-fees.test.ts
git commit -m "feat: add priority fee estimation with p75 median and min/max bounds"
```

---

### Task 9: Wire retry + priority fees into stealth-transfer.ts

**Files:**
- Modify: `src/lib/solana/stealth-transfer.ts`
- Modify: `src/lib/solana/claim-transfer.ts`

**Step 1: Read current files to understand injection points**

In `stealth-transfer.ts`, find the `buildTransaction` function where compute budget is set (currently hardcoded 50K microlamports).
In `claim-transfer.ts`, same pattern.

**Step 2: Add priority fee estimation to send flow**

Replace the hardcoded compute unit price in `stealth-transfer.ts` `buildTransaction()`:

```typescript
import { estimatePriorityFee } from "./priority-fees"
import { withRetry } from "./retry"

// Inside buildTransaction():
// Replace hardcoded: ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 })
// With:
const priorityFee = await withRetry(
  () => estimatePriorityFee(connection),
  { maxRetries: 2, baseDelayMs: 500 }
)
// ...
ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee })
```

**Step 3: Add priority fee estimation to claim flow**

Same pattern in `claim-transfer.ts` `buildClaimTransaction()`.

**Step 4: Run typecheck + tests**

Run: `cd /Users/rector/local-dev/sip-app && pnpm typecheck && pnpm test -- --run 2>&1 | tail -5`
Expected: Clean typecheck, all tests pass

**Step 5: Commit**

```bash
git add src/lib/solana/stealth-transfer.ts src/lib/solana/claim-transfer.ts
git commit -m "feat: wire dynamic priority fees and retry into stealth transfer and claim"
```

---

### Task 10: Add transaction status tracking to send form

**Files:**
- Modify: `src/hooks/use-send-payment.ts`
- Modify: `src/components/payments/send-shielded-form.tsx`
- Test: `tests/hooks/use-send-payment.test.ts` (add/update)

**Step 1: Add granular status tracking to useSendPayment**

Currently the hook has `status: "idle" | "pending" | "confirmed" | "error"`. Add intermediate steps:

```typescript
type TxStep =
  | "idle"
  | "generating-stealth"     // Generating stealth address
  | "building-transaction"   // Building Solana transaction
  | "awaiting-signature"     // Waiting for wallet to sign
  | "confirming"             // Transaction sent, waiting for confirmation
  | "confirmed"              // Success
  | "error"                  // Failed

interface UseSendPaymentResult {
  step: TxStep
  txHash: string | null
  error: string | null
  send: (params: SendPaymentParams) => Promise<SendPaymentResult | undefined>
  reset: () => void
}
```

Update the send function to set step at each stage.

**Step 2: Update SendShieldedForm to show step progress**

Add a step indicator below the form when `step !== "idle"`:

```tsx
{step !== "idle" && step !== "error" && (
  <div className="mt-4 space-y-2">
    <StepIndicator
      steps={[
        { key: "generating-stealth", label: "Generating stealth address" },
        { key: "building-transaction", label: "Building transaction" },
        { key: "awaiting-signature", label: "Awaiting wallet signature" },
        { key: "confirming", label: "Confirming on-chain" },
        { key: "confirmed", label: "Payment sent!" },
      ]}
      currentStep={step}
    />
  </div>
)}
```

**Step 3: Write test for step progression**

```typescript
it("progresses through steps during send", async () => {
  const steps: string[] = []
  // Mock to capture step changes
  // Verify: idle → generating-stealth → building-transaction → awaiting-signature → confirming → confirmed
})
```

**Step 4: Run tests**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/hooks/use-send-payment.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/hooks/use-send-payment.ts src/components/payments/send-shielded-form.tsx tests/hooks/use-send-payment.test.ts
git commit -m "feat: add granular step tracking to send payment flow with UI indicators"
```

---

### Task 11: Add confirmation polling with retry

**Files:**
- Modify: `src/hooks/use-send-payment.ts`
- Modify: `src/hooks/use-claim-transfer.ts`
- Create: `src/lib/solana/confirm-transaction.ts`
- Test: `tests/lib/solana/confirm-transaction.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/lib/solana/confirm-transaction.test.ts
import { describe, it, expect, vi } from "vitest"
import { confirmTransactionWithRetry } from "@/lib/solana/confirm-transaction"

describe("confirmTransactionWithRetry", () => {
  it("resolves when transaction is confirmed", async () => {
    const mockConnection = {
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
    }
    const result = await confirmTransactionWithRetry(
      mockConnection as never,
      "txSig123",
      { timeoutMs: 5000 }
    )
    expect(result.confirmed).toBe(true)
  })

  it("returns error when transaction fails on-chain", async () => {
    const mockConnection = {
      confirmTransaction: vi.fn().mockResolvedValue({
        value: { err: { InstructionError: [0, "Custom(1)"] } },
      }),
    }
    const result = await confirmTransactionWithRetry(
      mockConnection as never,
      "txSig123",
      { timeoutMs: 5000 }
    )
    expect(result.confirmed).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("times out gracefully", async () => {
    const mockConnection = {
      confirmTransaction: vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      ),
    }
    const result = await confirmTransactionWithRetry(
      mockConnection as never,
      "txSig123",
      { timeoutMs: 100 }
    )
    expect(result.confirmed).toBe(false)
    expect(result.error).toContain("timeout")
  })
})
```

**Step 2: Implement**

```typescript
// src/lib/solana/confirm-transaction.ts
import type { Connection } from "@solana/web3.js"

interface ConfirmResult {
  confirmed: boolean
  error?: string
}

export async function confirmTransactionWithRetry(
  connection: Connection,
  signature: string,
  options: { timeoutMs?: number } = {}
): Promise<ConfirmResult> {
  const { timeoutMs = 30_000 } = options

  try {
    const result = await Promise.race([
      connection.confirmTransaction(signature, "confirmed"),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Confirmation timeout")), timeoutMs)
      ),
    ])

    if (result.value.err) {
      return { confirmed: false, error: JSON.stringify(result.value.err) }
    }

    return { confirmed: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { confirmed: false, error: msg.includes("timeout") ? "timeout" : msg }
  }
}
```

**Step 3: Wire into send and claim hooks**

Replace bare `sendTransaction()` calls with send + confirm pattern.

**Step 4: Run tests**

Run: `cd /Users/rector/local-dev/sip-app && pnpm vitest --run tests/lib/solana/confirm-transaction.test.ts`
Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add src/lib/solana/confirm-transaction.ts tests/lib/solana/confirm-transaction.test.ts src/hooks/use-send-payment.ts src/hooks/use-claim-transfer.ts
git commit -m "feat: add transaction confirmation with timeout and wire into send/claim"
```

---

### Task 12: Add error boundary to payment pages

**Files:**
- Modify: `src/app/(payments)/layout.tsx`
- Uses existing: `src/components/shared/error-boundary.tsx`

**Step 1: Read the payments layout**

**Step 2: Wrap children in ErrorBoundary**

```typescript
import { ErrorBoundary } from "@/components/shared/error-boundary"

export default function PaymentsLayout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
```

**Step 3: Run typecheck**

Run: `cd /Users/rector/local-dev/sip-app && pnpm typecheck`

**Step 4: Commit**

```bash
git add src/app/\(payments\)/layout.tsx
git commit -m "feat: wrap payment pages in error boundary for graceful failure handling"
```

---

### Task 13: Final integration test + full suite

**Files:**
- Run all existing tests to verify no regressions

**Step 1: Run full test suite**

Run: `cd /Users/rector/local-dev/sip-app && pnpm test -- --run 2>&1 | tail -10`
Expected: 112+ files, 1,150+ tests, all passing

**Step 2: Run lint**

Run: `cd /Users/rector/local-dev/sip-app && pnpm lint 2>&1 | tail -5`
Expected: 0 errors, 0 warnings (or near-zero)

**Step 3: Run typecheck**

Run: `cd /Users/rector/local-dev/sip-app && pnpm typecheck`
Expected: Clean

**Step 4: Push to main**

```bash
git push
```

**Step 5: Verify CI passes**

Run: `cd /Users/rector/local-dev/sip-app && gh run list --limit 3`
Expected: CI `completed` `success`, Deploy `completed` `success`
