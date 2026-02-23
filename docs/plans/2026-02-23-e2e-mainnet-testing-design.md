# E2E Mainnet Testing — Design Doc

**Date:** 2026-02-23
**Purpose:** Automated Playwright E2E suite verifying all 13 Graveyard hackathon flows on mainnet
**Deadline:** Feb 27 (Graveyard submission)

---

## Context

All 11 Graveyard tracks + Payments + DEX are already wired for real mainnet transactions via `useOnChainCommit()`. Every form component calls this hook, which builds a 1-lamport self-transfer with `SIP-COMMIT:{type}:{hash}` memo when a wallet is connected (skips in demo mode).

No wiring work needed. This design covers the Playwright E2E test suite only.

## Architecture

```
Playwright Browser (headless Chromium)
    ↓
app.sip-protocol.org (live deployed)
    ↓
Demo Mode (simulation) — all tracks
    ↓
Optional: Injected Test Wallet → Solana Mainnet (real tx)
```

## Test Strategy

### Phase 1: Demo Mode E2E (all 13 flows)

Verify every track's UI flow completes without errors in demo mode. No wallet or SOL required.

Each test:
1. Navigate to track page
2. Activate demo mode
3. Execute the primary action (purchase, vote, mint, etc.)
4. Assert: steps progress to completion, stealth address generated, no console errors

### Phase 2: Real TX E2E (wallet connected)

Same flows but with a connected test wallet (fresh keypair, ~0.1 SOL).
Verifies `useOnChainCommit` sends real transactions when wallet is connected.

Each test:
1. Inject test wallet via `window.solana` mock
2. Navigate to track page (demo mode OFF)
3. Execute the primary action
4. Assert: transaction signature returned, memo contains `SIP-COMMIT:{type}`

## Track Coverage

| # | Track | Route | Primary Action | Commitment Type |
|---|-------|-------|---------------|-----------------|
| 1 | Payments | `/payments/send` | Send shielded payment | `transfer` |
| 2 | DEX | `/dex` | Jupiter swap | `swap` |
| 3 | Migrations | `/migrations` | Green migration | `migration` |
| 4 | Governance | `/governance/vote` | Commit-reveal vote | `vote` |
| 5 | Art | `/art/mint` | Mint generative art | `art` |
| 6 | Social | `/social/profile` | Create anonymous profile | `post` |
| 7 | Ticketing | `/ticketing` | Purchase stealth ticket | `ticket` |
| 8 | Gaming | `/gaming/play` | Play RPS game | `move` |
| 9 | Music | `/music/playlist` | Create private playlist | `playlist` |
| 10 | NFTs | `/channel/create` | Publish encrypted drop | `drop` |
| 11 | Loyalty | `/loyalty/rewards` | Claim reward | `reward` |
| 12 | DeSci | `/desci/review` | Fund research | `fund` |
| 13 | Metaverse | `/metaverse/teleport` | Teleport to destination | `teleport` |

## File Structure

```
e2e/
├── playwright.config.ts          — Config: baseURL, timeouts, projects
├── helpers/
│   ├── demo-mode.ts              — Enable demo mode via localStorage
│   ├── assertions.ts             — Shared assertions (no console errors, etc.)
│   └── wallet-mock.ts            — Programmatic Solana wallet injection
├── tracks/
│   ├── payments.spec.ts          — Shielded payment flow
│   ├── dex.spec.ts               — Jupiter swap flow
│   ├── migrations.spec.ts        — Sunrise migration flow
│   ├── governance.spec.ts        — Commit-reveal vote flow
│   ├── art.spec.ts               — Generative art mint flow
│   ├── social.spec.ts            — Anonymous profile + post flow
│   ├── ticketing.spec.ts         — Stealth ticket purchase + verify
│   ├── gaming.spec.ts            — RPS game flow
│   ├── music.spec.ts             — Private playlist flow
│   ├── channel.spec.ts           — Encrypted drop publish flow
│   ├── loyalty.spec.ts           — Campaign enrollment + reward claim
│   ├── desci.spec.ts             — Research review + funding flow
│   └── metaverse.spec.ts         — Privacy teleport flow
└── showcase.spec.ts              — Graveyard showcase page loads all cards
```

## Wallet Mock Strategy

For real TX tests, inject a programmatic wallet before page load:

```typescript
// e2e/helpers/wallet-mock.ts
// Injects window.__SIP_TEST_WALLET with:
// - publicKey: test wallet address
// - signTransaction: signs with test keypair
// - signAllTransactions: batch signing
// The app's wallet adapter detects this via Standard Wallet interface
```

## Docs Updates

After E2E suite is complete:
- Update `CLAUDE.md` test counts (add E2E count)
- Update `sip-app/CLAUDE.md` with E2E section
- Add `test:e2e` command documentation

## Estimated Effort

| Task | Time |
|------|------|
| Playwright config + helpers | 30 min |
| 13 demo-mode track tests | 2-3 hours |
| Wallet mock + real TX tests | 1-2 hours |
| Docs updates | 30 min |
| **Total** | **~4-5 hours** |
