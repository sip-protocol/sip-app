# Design: Tech Debt Cleanup + Production Stealth Payments E2E

**Date:** 2026-02-22
**Status:** Approved
**Author:** CIPHER + RECTOR

---

## Overview

Two-phase improvement to sip-app before Graveyard Hackathon submission:
- **Phase A:** Clean all lint warnings (88 → 0) + merge dependabot PR (32 vulns resolved)
- **Phase B:** Production stealth payment E2E flow — send → scan → claim on devnet and mainnet

## Phase A: Tech Debt Cleanup

### A1. Lint Warnings (88 → 0)

| Category | Count | Fix |
|----------|-------|-----|
| `privacyMap` in useCallback deps | ~14 | Extract to useMemo or eslint-disable with explanation |
| Unused variables | ~15 | Remove or prefix `_` for required callback signatures |
| useEffect missing deps | ~3 | Add deps or restructure |
| `<img>` vs next/Image | 1 | Switch to next/image |

### A2. Dependabot PR

- Review failing PR (24 dep updates)
- Fix breaking changes
- Merge to main

### Commits

1. `chore: fix all lint warnings`
2. `chore: merge dependency updates`

---

## Phase B: Production Stealth Payments E2E

### Architecture

```
SendShieldedForm → stealth-transfer.ts → Anchor program (devnet/mainnet)
PaymentScanner  → Helius DAS + commitment-store → real scanned payments
ClaimButton     → claim-transfer.ts → Anchor program (devnet/mainnet)
```

**Program ID:** `S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at` (deployed devnet + mainnet)

### B1. Send Flow

- Wire `createStealthTransfer()` to Anchor program
- Generate stealth address + Pedersen commitment
- Real wallet signing via wallet adapter
- Transaction confirmation polling (processed → confirmed → finalized)

### B2. Scan Flow

- `useScanPayments` → Helius RPC (`createProvider('helius')`)
- Scan for transactions to stealth addresses derived from viewing key
- Decrypt amounts with XChaCha20-Poly1305
- Display real incoming payments in PaymentScanner UI

### B3. Claim Flow

- Wire `claimStealthPayment()` to Anchor instruction
- On-chain Pedersen commitment verification before claiming
- Handle: already claimed, insufficient lamports, expired

### B4. Production Hardening

- Gas estimation via `getRecentPrioritizationFees`
- Retry logic with exponential backoff for RPC failures
- Error states: network errors, wallet disconnected, insufficient balance
- Loading states per step: generating address → building tx → signing → confirming
- Mainnet toggle with explicit warning ("Real SOL — proceed with caution")

### B5. Network Toggle

- Settings page: devnet/mainnet/custom RPC dropdown
- Persist in Zustand store
- Network badge in nav (purple = devnet, green = mainnet)

### Testing

- Unit tests: stealth-transfer and claim-transfer with mocked RPC
- Integration test: full send → scan → claim on devnet
- Error handling: network failure, wallet disconnect, double-claim

---

## Success Criteria

- Zero lint warnings in CI
- Zero dependabot vulnerabilities
- Judge can send a shielded payment on devnet, switch to receiver, scan, and claim
- Mainnet toggle available with safety warning
- All existing 1,136 tests still passing + new E2E tests added
