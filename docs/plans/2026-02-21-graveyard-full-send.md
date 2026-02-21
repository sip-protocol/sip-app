# Graveyard Hackathon — Full Send Sprint

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Close all 17 open Graveyard Hackathon issues and prepare for submission by Feb 27, 2026.

**Architecture:** Triage-first approach — audit existing code against open issues, close what's done, then polish UX and fill gaps. Parallel subagents for independent track work.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, framer-motion, @sip-protocol/sdk, Vitest

---

## Current State (Feb 21, 2026)

- **1108 tests** passing across 110 files
- **6/11 tracks** have real API integration (Governance, Art, Social, Channel, Music, Loyalty)
- **4/11 tracks** have curated real data with API fallback (Gaming, DeSci, Ticketing, Metaverse)
- **1/11 tracks** has only sample data (Migration)
- **Phase 1** complete: Real Pedersen, viewing keys, content encryption, no more "not yet implemented"
- **Recent commits**: Bubblegum cNFT wiring (art, channel, ticketing), on-chain reveal (gaming), stealth transfers (metaverse, desci), showcase badges

## Open Issues (17)

### Phase 2: Sponsor Integration (11 issues)
| # | Track | Issue | Likely Status |
|---|-------|-------|---------------|
| 210 | Realms | Real SPL Governance queries | DONE — realms-reader.ts has @solana/spl-governance |
| 211 | Torque | Real campaign SDK integration | PARTIAL — REST API wired, rewards need auth |
| 212 | Tapestry | Real profile/connection APIs | DONE — tapestry-reader.ts has socialfi SDK |
| 213 | Audius | Install SDK + real track search/playback | DONE — audius-reader.ts has Discovery Provider API |
| 214 | BIO Protocol | Fetch real BioDAO data | PARTIAL — curated data, API fallback |
| 215 | DRiP | REST API for channels/drops | DONE — drip-reader.ts has Helius DAS |
| 216 | Exchange Art | Real cNFT minting (Bubblegum) | DONE — Bubblegum wired in recent commits |
| 217 | MagicBlock | Playable RPS + commit-reveal | DONE — BOLT SDK + animations just committed |
| 218 | Portals | Room embed + stealth avatar | PARTIAL — portals-reader.ts has curated worlds |
| 219 | KYD Labs | cNFT ticket minting | PARTIAL — curated events, Bubblegum wired |
| 220 | Sunrise | Real staking + wallet scanner | TODO — needs Sunrise SDK or stake account queries |

### Phase 3: UX Polish (3 issues)
| # | Issue | Status |
|---|-------|--------|
| 221 | Showcase page upgrade | TODO |
| 222 | Death/Revival narrative cards (all tracks) | TODO — highest ROI (30% weight) |
| 226 | Animation polish + error states | TODO |

### Phase 4: Submission (2 issues)
| # | Issue | Status |
|---|-------|--------|
| 225 | Record 3-minute demo video | TODO (RECTOR) |
| 224 | Submit all 11 tracks | TODO (RECTOR + CIPHER) |

---

## Phase A: Issue Triage (Tasks 1-11)

Audit each Phase 2 issue against current code. Close DONE issues, document gaps for PARTIAL/TODO.

### Task 1: Triage Realms (#210)
**Files:** `src/lib/governance/realms-reader.ts`
**Action:** Verify real SPL Governance SDK usage, close if done.

### Task 2: Triage Torque (#211)
**Files:** `src/lib/loyalty/torque-reader.ts`
**Action:** Verify REST API integration, document auth gap for rewards.

### Task 3: Triage Tapestry (#212)
**Files:** `src/lib/social/tapestry-reader.ts`
**Action:** Verify socialfi SDK usage, close if done.

### Task 4: Triage Audius (#213)
**Files:** `src/lib/music/audius-reader.ts`
**Action:** Verify Discovery Provider API, close if done.

### Task 5: Triage BIO (#214)
**Files:** `src/lib/desci/bio-reader.ts`
**Action:** Verify bio.xyz API calls, document any gaps.

### Task 6: Triage DRiP (#215)
**Files:** `src/lib/channel/drip-reader.ts`, `src/components/channel/drop-list.tsx`
**Action:** Verify Helius DAS + live mode wiring, close if done.

### Task 7: Triage Exchange Art (#216)
**Files:** `src/lib/art/art-service.ts`, `src/hooks/use-mint-nft.ts`
**Action:** Verify Bubblegum cNFT minting, close if done.

### Task 8: Triage MagicBlock (#217)
**Files:** `src/lib/gaming/magicblock-reader.ts`, `src/components/gaming/rps-game.tsx`
**Action:** Verify BOLT SDK + playable RPS, close if done.

### Task 9: Triage Portals (#218)
**Files:** `src/lib/metaverse/portals-reader.ts`
**Action:** Verify Portals API integration, document room embed gap.

### Task 10: Triage KYD (#219)
**Files:** `src/lib/ticketing/kyd-reader.ts`, `src/hooks/use-purchase-ticket.ts`
**Action:** Verify cNFT ticket minting integration, document gaps.

### Task 11: Triage Sunrise (#220)
**Files:** `src/lib/` (check for sunrise-related files)
**Action:** Assess what exists, plan minimal integration.

---

## Phase B: UX + Narrative (Tasks 12-14)

### Task 12: Death/Revival Narrative Cards (#222)
**Files:**
- Create: `src/lib/showcase/track-narratives.ts`
- Modify: `src/app/showcase/graveyard-2026/page.tsx`
- Create: `src/components/showcase/narrative-card.tsx`

Per-track content:
- **Death diagnosis**: Why this category died on Solana (2-3 sentences)
- **Revival approach**: How SIP + sponsor revives it (2-3 sentences)
- **Key proof**: The cryptographic primitive that makes it work
- **Before/After**: What existed vs what SIP enables

All 11 tracks need narrative content. This directly addresses the #1 judging criteria (Category Resurrection, 30% weight).

### Task 13: Showcase Page Upgrade (#221)
**Files:**
- Modify: `src/app/showcase/graveyard-2026/page.tsx`
- Create: `src/components/showcase/track-score-card.tsx`

Improvements:
- Visual hierarchy (hero section, track grid)
- Integration status badges (live API, curated, simulation)
- Score preview per track
- "Powered by" sponsor logos
- Responsive grid layout

### Task 14: Animation Polish + Error States (#226)
**Files:** Multiple components across all tracks

Improvements:
- Consistent loading skeletons across all track pages
- Error boundary components with retry
- Page transition animations (AnimatePresence)
- Form submission feedback (success/error toasts)

---

## Phase C: Gap Fill (Tasks 15-17)

Based on triage results. Expected gaps:

### Task 15: Sunrise Staking Integration (#220)
**Files:**
- Modify or create: `src/lib/sustainability/sunrise-reader.ts`
- Modify: `src/hooks/use-green-stake.ts`

Minimal integration: Query stake accounts via Solana RPC, show real validator data, add Sunrise program ID references.

### Task 16: Deepen Partial Tracks
Address remaining PARTIAL issues from triage (Torque rewards, BIO API, Portals embed, KYD minting).

### Task 17: Test Coverage for New Code
Add tests for any new components/services created in Phase B and C. Target: maintain 1100+ test count.

---

## Phase D: Submission Prep (Tasks 18-19)

### Task 18: Prepare Track Submission Metadata
**Files:**
- Create: `docs/submissions/` directory with per-track submission text

For each of 11 tracks:
- Track name + sponsor
- Project description (250 words max)
- Key features list
- Tech stack
- Demo video link placeholder
- GitHub repo link

### Task 19: Demo Video + Submit (RECTOR)
Non-code tasks:
- Record 3-minute demo using `docs/demos/SHOT-LISTS.md`
- Submit all 11 tracks on hackathon platform
- Deploy latest to app.sip-protocol.org

---

## Verification

```bash
# Type check
pnpm typecheck

# Full test suite
pnpm test -- --run

# Dev server — check showcase page
pnpm dev
# Visit /showcase/graveyard-2026 → all 11 tracks with narratives
# Visit each track page → verify no errors, loading states work

# Issue audit
gh issue list --state open --label "graveyard-hack"
# Should show only Phase 4 submission issues remaining
```
