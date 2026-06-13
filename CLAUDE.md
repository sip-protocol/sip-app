# CLAUDE.md - SIP App

> **Ecosystem Hub:** See [sip-protocol/CLAUDE.md](https://github.com/sip-protocol/sip-protocol/blob/main/CLAUDE.md) for full ecosystem context

**Repository:** https://github.com/sip-protocol/sip-app
**Live URL:** https://app.sip-protocol.org
**Tagline:** "Privacy Command Center for Web3"
**Purpose:** Enterprise-grade privacy interface — compliance, analytics, power user workflows

---

## 🎯 PRODUCT POSITIONING

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIP PRODUCT FAMILY (Jupiter Model)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  @sip-protocol/sdk — THE PRIVACY STANDARD                                   │
│  "Any app can add privacy with one line of code"                           │
│                                                                             │
│  ┌─────────────────────────────┐   ┌─────────────────────────────┐         │
│  │  app.sip-protocol.org      │   │  SIP Privacy (Mobile)       │         │
│  │  ───────────────────────   │   │  ────────────────────────   │         │
│  │  "Privacy Command Center"  │   │  "Privacy in Your Pocket"   │         │
│  │                            │   │                             │         │
│  │  • Power users/Enterprise  │   │  • Consumers                │         │
│  │  • Complex visualizations  │   │  • Quick payments/swaps     │         │
│  │  • Compliance dashboards   │   │  • Native key management    │         │
│  │  • Audit trails/Reports    │   │  • Biometric security       │         │
│  │  • SDK showcase            │   │  • On-the-go privacy        │         │
│  │                            │   │                             │         │
│  │  ← YOU ARE HERE            │   │  → sip-mobile repo          │         │
│  └─────────────────────────────┘   └─────────────────────────────┘         │
│                                                                             │
│  COMPANION PRODUCTS — Same brand, platform-optimized experiences            │
│  Like jup.ag (web) + Jupiter Mobile (app) — NOT 1:1 clones                 │
│                                                                             │
│  BOTH are real products with real users — NOT demos                        │
│  BOTH showcase SDK capabilities → drive developer adoption                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### sip-app Differentiators (Web Strengths)

| Capability | Why Web Excels |
|------------|----------------|
| **D3 Visualizations** | Privacy Score heatmaps, network graphs — complex rendering |
| **Compliance Dashboards** | Multi-monitor workflows for auditors, accountants |
| **Audit Report Generation** | PDF exports, detailed transaction analysis |
| **Enterprise Batch Ops** | Multi-transaction batching, power user tools |
| **SDK Playground** | Interactive code examples, API explorer |
| **Deep Research** | Transaction deep-dives, surveillance analysis |

### Shared with sip-mobile (Must Be Identical)

- Core privacy primitives (stealth addresses, commitments, viewing keys)
- Privacy levels (transparent / shielded / compliant)
- Payment protocol (send / receive / scan / claim / disclose)
- Viewing key disclosure for compliance

### Feature Parity Matrix

| Feature | sip-app (Web) | sip-mobile | Notes |
|---------|---------------|------------|-------|
| Send Payments | ✅ Full | ✅ Full | Same core |
| Receive (Stealth) | ✅ Full | ✅ Full | Same core |
| Scan Payments | ✅ Full | ✅ Full | Mobile has native camera |
| Claim Payments | ✅ Full | ✅ Full | Same core |
| View History | ✅ Full | ✅ Full | Different viz |
| Viewing Key Disclosure | ✅ Full | ✅ Full | Compliance-critical |
| Jupiter DEX | ✅ Full | ✅ Full | `/dex/jupiter` swap UI |
| Privacy Score | ✅ Full (D3) | ✅ Basic | Web excels at viz |
| Compliance Dashboard | ✅ Full | ✅ Basic | `/enterprise/compliance` |
| Audit Reports | 🔲 Planned | ✅ Basic | Web for accountants |
| Native Key Mgmt | ❌ N/A | ✅ Full | Mobile-only |
| Biometric Auth | ❌ N/A | ✅ Full | Mobile-only |
| SDK Playground | 🔲 Planned | ❌ N/A | Web-only |

---

## 🎯 QUALITY PHILOSOPHY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THIS IS NOT A DEMO. THIS IS THE PRODUCT.                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   THE APP IS THE PITCH.                                                     │
│   Developers see the app → impressed → want to use the SDK.                 │
│                                                                             │
│   Quality benchmark: "Would this be acceptable on jup.ag?"                  │
│   If no, raise the bar.                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Quality Standards (Non-Negotiable)

| Aspect | Standard | Why |
|--------|----------|-----|
| **UX** | Delightful, intuitive, zero friction | User satisfaction = adoption |
| **Performance** | Sub-second interactions, optimistic UI | Users don't wait |
| **Design** | Clean, modern, professional | First impressions matter |
| **Reliability** | 99.9% uptime, graceful error handling | Trust requires reliability |
| **Accessibility** | WCAG 2.1 AA compliant | Privacy is for everyone |
| **Mobile** | Mobile-first responsive design | Most users are on mobile |

### Build Triggers (Ask These Every Time)

Before building ANY feature, ask:

1. **"Would this be acceptable on jup.ag?"** — If no, raise the bar
2. **"Is this production-ready or prototype-quality?"** — Ship production only
3. **"Would a user be delighted or just satisfied?"** — Aim for delight
4. **"Does this showcase SIP's capabilities impressively?"** — The app sells the SDK
5. **"Am I cutting corners because of deadline?"** — Quality over deadlines

> **⚠️ REMINDER:** Hackathon is a BONUS. We're building for users, not judges. If the app is world-class, prizes will follow. If we rush for prizes, we get neither.

---

## Current Focus

**Status:** Live | World-class privacy app deployed
**Context:** M17 Complete — building toward M18 (Ethereum Same-Chain)

### Live Routes (/payments)
- [x] `/payments` - Dashboard for private payments
- [x] `/payments/send` - Send shielded payments
- [x] `/payments/receive` - Generate stealth addresses
- [x] `/payments/scan` - Scan for incoming payments
- [x] `/payments/history` - Transaction history
- [x] `/payments/disclose` - Viewing key disclosure

### New Feature
- [x] `/privacy-score` - Wallet surveillance analyzer

**Target UX:** As smooth as Venmo, as private as cash.

---

## Architecture

**Philosophy:**
- `sip-protocol.org` = "What is SIP?" (marketing)
- `app.sip-protocol.org` = "Use SIP now" (THE product)

### App Routes (44 page routes across 18 route groups + 2 API routes)

The app spans 18 route groups (Graveyard hackathon tracks): `(art)`, `(bridge)`, `(channel)`, `(desci)`, `(dex)`, `(enterprise)`, `(gaming)`, `(governance)`, `(loyalty)`, `(metaverse)`, `(migrations)`, `(music)`, `(payments)`, `(settings)`, `(social)`, `(ticketing)`, `(tools)`, `(wallet)`, plus `showcase/` pages and `api/` routes (`/api/advisor`, `/api/privacy-score`). Core privacy routes:

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | App hub / dashboard | ✅ Live |
| `/payments` | Private Payments dashboard | ✅ Live |
| `/payments/send` | Send shielded payment | ✅ Live |
| `/payments/receive` | Generate stealth address | ✅ Live |
| `/payments/scan` | Scan for incoming | ✅ Live |
| `/payments/history` | Transaction history | ✅ Live |
| `/payments/disclose` | Viewing key disclosure | ✅ Live |
| `/privacy-score` | Wallet surveillance analyzer (under `(tools)`) | ✅ Live |
| `/dex`, `/dex/jupiter` | Private DEX + Jupiter swap UI | ✅ Live |
| `/wallet`, `/wallet/keys` | Wallet interface | 🔲 Coming Soon |
| `/wallet/sip-stealth` | SIP stealth wallet | ✅ Live |
| `/enterprise/compliance` | Compliance dashboard (audit trail, viewing keys) | ✅ Live |
| `/enterprise` | Enterprise landing | 🔲 Coming Soon |
| `/art`, `/bridge`, `/channel`, `/desci`, `/gaming`, `/governance`, `/loyalty`, `/metaverse`, `/migrations`, `/music`, `/social`, `/ticketing` (+ sub-routes) | Graveyard track demos | ✅ Live |
| `/settings` | App settings | ✅ Live |
| `/showcase/graveyard-2026`, `/showcase/solana-privacy-2026` | Showcase pages | ✅ Live |

### Route Groups Structure

```
src/app/
├── layout.tsx              # Root layout (shared nav/footer)
├── page.tsx                # Hub: links to all apps
│
├── (payments)/             # Route group: Private Payments
│   ├── payments/
│   │   ├── page.tsx        # Main payments interface
│   │   ├── send/page.tsx   # Send shielded payment
│   │   ├── receive/page.tsx# Generate stealth address
│   │   ├── scan/page.tsx   # Scan for incoming
│   │   ├── history/page.tsx# Transaction history
│   │   └── disclose/page.tsx # Viewing key disclosure
│   └── layout.tsx          # Payments-specific layout
│
├── (wallet)/               # Route group: Wallet
│   └── wallet/
│       ├── page.tsx        # Wallet overview
│       ├── keys/page.tsx   # Viewing key management
│       └── sip-stealth/page.tsx # SIP stealth wallet
│
├── (dex)/                  # Route group: DEX
│   └── dex/
│       ├── page.tsx        # Private swap interface
│       └── jupiter/page.tsx# Jupiter integration
│
├── (enterprise)/           # Route group: Enterprise
│   └── enterprise/
│       ├── page.tsx        # Dashboard
│       └── compliance/     # Compliance tools
│
├── (tools)/                # privacy-score
├── (art)/ (bridge)/ (channel)/ (desci)/ (gaming)/ (governance)/
├── (loyalty)/ (metaverse)/ (migrations)/ (music)/ (social)/
├── (ticketing)/ (settings)/   # Graveyard hackathon track demos
│
├── showcase/               # graveyard-2026, solana-privacy-2026
└── api/                    # advisor, privacy-score (route.ts handlers)
```

---

## Quick Reference

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Zustand 5, Vitest
**Deployment:** app.sip-protocol.org (Docker + GHCR → VPS port 5004 blue / 5005 green)
**Tests:** 131 test suites, 1,282 unit tests + 27 demo E2E + 25 mainnet E2E (Playwright)

**Key Commands:**
```bash
pnpm install              # Install dependencies
pnpm dev                  # Dev server (localhost:3000)
pnpm test -- --run        # Run unit tests
pnpm test:e2e --project=demo      # Demo E2E tests (no wallet required)
pnpm test:e2e --project=mainnet   # Mainnet E2E (requires E2E_WALLET_SECRET)
E2E_BASE_URL=https://app.sip-protocol.org pnpm test:e2e --project=demo  # Against live
E2E_WALLET_SECRET=<base58> E2E_BASE_URL=https://app.sip-protocol.org pnpm test:e2e --project=mainnet  # Real on-chain
pnpm build                # Build for production
pnpm typecheck            # Type check
```

**E2E Suite (Phase 1 — Demo):** 27 Playwright tests covering all 13 Graveyard hackathon tracks + showcase page. Tests run in demo mode (no wallet/SOL required). Project: `demo`.

**E2E Suite (Phase 2 — Mainnet):** 25 Playwright tests sending real `SIP-COMMIT` Pedersen commitment transactions to Solana mainnet. 8 tracks produce on-chain tx signatures. Requires `E2E_WALLET_SECRET` (base58-encoded secret key). Skips automatically when not set. Project: `mainnet`. TestWalletAdapter injected via `window.__SIP_TEST_WALLET`.

---

## Dependencies

**Core:**
- `@sip-protocol/sdk` v0.11.0 - Core privacy SDK
- `@sip-protocol/types` - TypeScript types
- `@sip-protocol/react` - React hooks (useSIP, useStealthAddress, etc.)

**Solana:**
- `@solana/web3.js` - Solana client
- `@solana/wallet-adapter-react` - Wallet connection
- `@solana/wallet-adapter-wallets` - Wallet adapters (Phantom, Solflare)

**Integrations:**
- Helius SDK - DAS API for stealth scanning
- Helius Webhooks - Real-time payment notifications

---

## Key Components

### Payments App

| Component | Purpose |
|-----------|---------|
| `SendShieldedForm` | Form for sending private payments |
| `StealthAddressGenerator` | Generate + display stealth meta-address |
| `PaymentScanner` | Scan blockchain for incoming payments |
| `ClaimPayment` | Claim received stealth payments |
| `ViewingKeyDisclosure` | Reveal transaction to auditor |

### Shared

| Component | Purpose |
|-----------|---------|
| `WalletConnect` | Solana wallet connection |
| `PrivacyToggle` | Privacy level selector |
| `TransactionStatus` | Transaction progress display |

---

## Migration from sip-website

The following pages are **deprecated** in sip-website and replaced here:

| Old (sip-website) | New (sip-app) | Status |
|-------------------|---------------|--------|
| `/demo` | `/dex` | Planned |
| `/claim` | `/payments/receive` | Planned |
| `/phantom-poc` | `/wallet` | Planned |
| `/jupiter-poc` | `/dex/jupiter` | Planned |
| `/compliance-dashboard` | `/enterprise/compliance` | Planned |

---

## Deployment

### VPS Configuration

```yaml
# docker-compose.yml
name: sip-app  # CRITICAL: Isolate from other projects

services:
  app-blue:
    image: ghcr.io/sip-protocol/sip-app:latest
    container_name: sip-app-blue
    ports:
      - "5004:3000"
    restart: unless-stopped

  app-green:
    image: ghcr.io/sip-protocol/sip-app:green
    container_name: sip-app-green
    ports:
      - "5005:3000"
    restart: unless-stopped
```

### Port Allocation

| Port | Service |
|------|---------|
| 5004 | sip-app (blue) |
| 5005 | sip-app (green) |

---

## Design Inspirations (World-Class References)

Study these for quality benchmarks:

| App | What to Learn |
|-----|---------------|
| **jup.ag** | Swap UX, token selection, transaction flow |
| **phantom.app** | Wallet UX, onboarding, mobile experience |
| **uniswap.org** | Clean design, professional feel |
| **stripe.com** | Form design, error handling, trust signals |
| **linear.app** | Speed, keyboard shortcuts, polish |

**Design Principles:**
1. **Clarity over cleverness** — Users should never be confused
2. **Speed is a feature** — Every interaction should feel instant
3. **Progressive disclosure** — Simple by default, powerful when needed
4. **Trust through transparency** — Show what's happening, explain why

---

## Repo-Specific Guidelines

### DO (World-Class Standards):
- **Design first, code second** — Sketch the UX before implementation
- **Mobile-first** — Design for mobile, enhance for desktop
- **Test on real devices** — Not just browser DevTools
- **Use Helius DAS API** — For efficient stealth address scanning
- **Optimistic UI** — Show success immediately, handle errors gracefully
- **Animations with purpose** — Micro-interactions that delight
- **Keyboard accessible** — Power users love keyboard shortcuts
- **Error messages that help** — Not just "Something went wrong"

### DON'T (Quality Killers):
- **Ship "good enough"** — If it's not great, iterate
- **Skip loading states** — Users need feedback
- **Ignore edge cases** — Empty states, errors, slow connections
- **Hard-code anything** — Addresses, amounts, network endpoints
- **Forget accessibility** — Screen readers, color contrast, focus states
- **Rush for deadlines** — Quality > speed (hackathon is bonus)

### Quality Checklist (Before Every PR)

- [ ] Works on mobile (tested on real device)
- [ ] Loading states for all async operations
- [ ] Error states with helpful messages
- [ ] Empty states that guide users
- [ ] Keyboard navigation works
- [ ] No console errors or warnings
- [ ] Performance: no jank, instant feedback
- [ ] Accessibility: can navigate with screen reader

---

## Related Repositories

| Repo | Purpose | Relationship |
|------|---------|--------------|
| [sip-protocol](https://github.com/sip-protocol/sip-protocol) | Core SDK | Imports SDK |
| [sip-mobile](https://github.com/sip-protocol/sip-mobile) | **Companion mobile app** | Same product family |
| [sip-website](https://github.com/sip-protocol/sip-website) | Marketing site | Replaces /demo |
| [docs-sip](https://github.com/sip-protocol/docs-sip) | Documentation | Documents usage |

---

**Last Updated:** 2026-06-12
**Status:** Live at app.sip-protocol.org | 44 page routes (18 groups) | 131 test suites, 1,282 tests + 52 E2E | SDK v0.11.0
**Positioning:** Privacy Command Center — enterprise, compliance, power users
**Companion:** sip-mobile ("Privacy in Your Pocket" — consumers, daily use)
