<!-- Satellite context file — extends the global hub (~/.claude/CLAUDE.md | ~/.pi/agent/AGENTS.md). Host-neutral; project-specific only. Do not duplicate hub standards here. -->

# SIP App

> Enterprise-grade privacy interface — "Privacy Command Center for Web3". Live at https://app.sip-protocol.org.

**Ecosystem hub:** See [sip-protocol/sip-protocol/AGENTS.md](https://github.com/sip-protocol/sip-protocol/blob/main/AGENTS.md) for full ecosystem context.

## Product Positioning (Jupiter Model)

- **`@sip-protocol/sdk`** — THE PRIVACY STANDARD ("any app can add privacy with one line of code")
- **app.sip-protocol.org** (this repo) — "Privacy Command Center": power users / enterprise; complex visualizations, compliance dashboards, audit reports, SDK showcase
- **sip-mobile** — "Privacy in Your Pocket": consumers; quick payments/swaps, native key management, biometric, on-the-go

Companion products — same brand, platform-optimized experiences (like jup.ag + Jupiter Mobile), NOT 1:1 clones. BOTH are real products with real users showcasing SDK capabilities.

**Quality benchmark:** "Would this be acceptable on jup.ag?" — if no, raise the bar. **This is not a demo. This is the product. The app is the pitch.**

## Quick Reference

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Zustand 5, Vitest
**Deployment:** app.sip-protocol.org (Docker + GHCR → VPS port 5004 blue / 5005 green)
**Tests:** 131 test suites, 1,282 unit tests + 27 demo E2E + 25 mainnet E2E (Playwright)

```bash
pnpm install
pnpm dev                        # localhost:3000
pnpm test -- --run              # unit tests
pnpm test:e2e --project=demo    # demo E2E (no wallet required)
pnpm test:e2e --project=mainnet # mainnet E2E (requires E2E_WALLET_SECRET, real on-chain)
pnpm build
pnpm typecheck
```

**E2E Phase 1 (demo):** 27 Playwright tests covering all 13 Graveyard hackathon tracks + showcase. Project: `demo`.
**E2E Phase 2 (mainnet):** 25 Playwright tests sending real `SIP-COMMIT` Pedersen commitment transactions to Solana mainnet. 8 tracks produce on-chain tx signatures. Requires `E2E_WALLET_SECRET` (base58). Skips automatically when unset. TestWalletAdapter injected via `window.__SIP_TEST_WALLET`.

## App Routes (44 page routes across 18 route groups + 2 API routes)

18 route groups (Graveyard hackathon tracks): `(art)`, `(bridge)`, `(channel)`, `(desci)`, `(dex)`, `(enterprise)`, `(gaming)`, `(governance)`, `(loyalty)`, `(metaverse)`, `(migrations)`, `(music)`, `(payments)`, `(settings)`, `(social)`, `(ticketing)`, `(tools)`, `(wallet)`, plus `showcase/` and `api/` (`/api/advisor`, `/api/privacy-score`).

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | App hub / dashboard | ✅ Live |
| `/payments` · `/send` · `/receive` · `/scan` · `/history` · `/disclose` | Private payments | ✅ Live |
| `/privacy-score` | Wallet surveillance analyzer (under `(tools)`) | ✅ Live |
| `/dex` · `/dex/jupiter` | Private DEX + Jupiter swap UI | ✅ Live |
| `/wallet` · `/wallet/keys` · `/wallet/sip-stealth` | Wallet interface | 🔲/✅ |
| `/enterprise/compliance` | Compliance dashboard (audit trail, viewing keys) | ✅ Live |
| `/art` `/bridge` `/channel` `/desci` `/gaming` `/governance` `/loyalty` `/metaverse` `/migrations` `/music` `/social` `/ticketing` (+ sub-routes) | Graveyard track demos | ✅ Live |
| `/showcase/graveyard-2026` · `/showcase/solana-privacy-2026` | Showcase pages | ✅ Live |

## Architecture

- `sip-protocol.org` = "What is SIP?" (marketing)
- `app.sip-protocol.org` = "Use SIP now" (THE product)

```
src/app/
├── layout.tsx              # Root layout (shared nav/footer)
├── page.tsx                # Hub: links to all apps
├── (payments)/payments/{page,send,receive,scan,history,disclose}.tsx + layout.tsx
├── (wallet)/wallet/{page,keys,sip-stealth}.tsx
├── (dex)/dex/{page,jupiter/page}.tsx
├── (enterprise)/enterprise/{page,compliance}/
├── (tools)/  # privacy-score
├── (art) (bridge) (channel) (desci) (gaming) (governance) (loyalty) (metaverse) (migrations) (music) (social) (ticketing) (settings)/  # Graveyard track demos
├── showcase/  # graveyard-2026, solana-privacy-2026
└── api/       # advisor, privacy-score (route.ts handlers)
```

## Dependencies

**Core:** `@sip-protocol/sdk` v0.11.0 · `@sip-protocol/types` · `@sip-protocol/react` (useSIP, useStealthAddress, etc.)
**Solana:** `@solana/web3.js` · `@solana/wallet-adapter-{react,wallets}` (Phantom, Solflare)
**Integrations:** Helius SDK (DAS API for stealth scanning), Helius Webhooks (real-time payment notifications)

## Key Components

**Payments:** `SendShieldedForm` · `StealthAddressGenerator` · `PaymentScanner` · `ClaimPayment` · `ViewingKeyDisclosure`
**Shared:** `WalletConnect` · `PrivacyToggle` · `TransactionStatus`

## Feature Parity with sip-mobile

Shared (must be identical): core privacy primitives (stealth, commitments, viewing keys), privacy levels, payment protocol (send/receive/scan/claim/disclose), viewing key disclosure.

| Feature | sip-app (Web) | sip-mobile |
|---------|---------------|------------|
| Payments (send/receive/scan/claim/history/disclose) | ✅ Full | ✅ Full |
| Jupiter DEX | ✅ Full | ✅ Full |
| Privacy Score | ✅ Full (D3 viz) | ✅ Basic |
| Compliance Dashboard | ✅ Full | ✅ Basic |
| Audit Reports | 🔲 Planned | ✅ Basic |
| Native Key Mgmt / Biometric | ❌ N/A | ✅ Full (mobile-only) |
| SDK Playground | 🔲 Planned | ❌ N/A |

## Migration from sip-website

Deprecated pages (301-redirected from sip-website): `/demo`→`/dex`, `/claim`→`/payments/receive`, `/phantom-poc`→`/wallet`, `/jupiter-poc`→`/dex/jupiter`, `/compliance-dashboard`→`/enterprise/compliance`.

## Design Inspirations

jup.ag (swap UX, token selection, tx flow) · phantom.app (wallet UX, onboarding, mobile) · uniswap.org (clean design, professional feel) · stripe.com (form design, error handling, trust signals) · linear.app (speed, keyboard shortcuts, polish).

**Principles:** clarity over cleverness · speed is a feature · progressive disclosure · trust through transparency.

## Repo-Specific Guidelines

**DO:** design first, code second; mobile-first; test on real devices; use Helius DAS API for stealth scanning; optimistic UI; animations with purpose; keyboard accessible; helpful error messages.
**DON'T:** ship "good enough" (iterate until great); skip loading states; ignore edge cases (empty/error/slow); hard-code addresses/amounts/network endpoints; forget accessibility; rush for deadlines (quality > speed, hackathon is bonus).

### Quality Checklist (before every PR)
- [ ] Works on mobile (real device)
- [ ] Loading states for all async ops
- [ ] Error states with helpful messages
- [ ] Empty states that guide users
- [ ] Keyboard navigation works
- [ ] No console errors/warnings
- [ ] Performance: no jank, instant feedback
- [ ] Accessibility: screen-reader navigable

## VPS Deployment

```yaml
name: sip-app  # CRITICAL: isolate from other projects
services:
  app-blue:  { image: ghcr.io/sip-protocol/sip-app:latest, ports: ["5004:3000"], restart: unless-stopped }
  app-green: { image: ghcr.io/sip-protocol/sip-app:green,   ports: ["5005:3000"], restart: unless-stopped }
```

Ports: 5004 (blue) · 5005 (green).