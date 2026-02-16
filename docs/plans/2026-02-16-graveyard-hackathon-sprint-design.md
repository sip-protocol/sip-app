# Graveyard Hackathon Sprint Design

> Approved: Feb 16, 2026
> Deadline: Feb 27, 2026 (11 days)
> Strategy: Max track coverage + polish

---

## Overview

Full sprint to maximize Solana Graveyard Hackathon results. Currently 11/11 sponsor tracks built and live at app.sip-protocol.org. This sprint adds the 12th track (Audius Music, $3K), simplifies navigation, upgrades the hub and showcase pages, adds wallet-less demo mode, and ensures mobile readiness.

## Priority Order

| # | Task | Days | Impact |
|---|------|------|--------|
| P0 | Build Audius Music track | 1 | +$3K sponsor coverage (12/12) |
| P1 | Simplify nav to hub-only | 0.5 | Clean UX, less clutter |
| P2 | Hub page upgrade | 1 | Strong first impression for judges |
| P3 | Showcase page stat updates | 0.5 | Accurate submission landing page |
| P4 | Demo mode (wallet-less flows) | 2 | Judges can try without Phantom |
| P5 | Mobile QA pass | 0.5 | Phone/tablet review ready |
| P6 | Video script + recording | 1 | Feb 25 (2 days before deadline) |
| | **Buffer** | 3.5 | Unexpected issues |

---

## P0: Audius Music Track

**Sponsor:** Audius ($3,000 — $2K 1st, $1K 2nd)
**Narrative:** Private music streaming — anonymous listening, stealth royalty payments, encrypted playlists

| Field | Value |
|-------|-------|
| Color | Pink (`from-pink-500 to-pink-700`) |
| Icon | music note |
| Routes | `/music`, `/music/playlist` |
| Flow 1 | Stream privately (4-step: selecting -> generating stealth listener -> streaming -> streamed) |
| Flow 2 | Create encrypted playlist (3-step: generating proof -> encrypting -> created) |

**5 sample tracks:**

| Track | Genre | SIP Primitive |
|-------|-------|---------------|
| Decentralized Beats | electronic | Stealth listener identity |
| Solana Symphony | classical | Pedersen commitment for royalty amounts |
| Privacy Anthem | hip-hop | Viewing key for rights management |
| Anonymous Groove | jazz | Anonymous streaming proof |
| Encrypted Melodies | ambient | Stealth transfer for tips |

**Architecture:** Same pattern as C1-C11:
- `src/lib/music/` — types, constants, music-service, stealth-music, audius-reader, index
- `src/stores/music-history.ts` — Zustand + persist
- `src/hooks/use-stream-track.ts`, `use-create-playlist.ts`
- `src/hooks/usePrivacyAction.ts` — add `"track_stream"` and `"playlist_create"`
- `src/hooks/useTrackEvent.ts` — add `trackMusic` callback
- `src/components/music/` — 10 components (stats, card, list, badge, privacy toggle, status, stream form, playlist form, stealth display, index)
- `src/app/(music)/music/page.tsx`, `client.tsx` — Projects view
- `src/app/(music)/music/playlist/page.tsx`, `client.tsx` — Playlist view
- `src/app/(music)/layout.tsx` — sub-nav (Tracks / Playlist)
- `src/app/page.tsx` — add music card to hub
- `tests/lib/music/music-service.test.ts` — ~12 tests
- `tests/stores/music-history.test.ts` — ~8 tests

**Files:** ~26 new + 3 edits

---

## P1: Nav Simplification

**Current:** 7 individual track links + Docs + GitHub (overwhelming, 6 tracks missing)

**New:** `SIP Protocol [logo]` ... `Home` | `Docs (ext)` | `GitHub (ext)` | `[Connect Wallet]`

- Remove all individual track links from top nav
- Hub page (/) becomes the app directory
- Every track page gets a "Back to Hub" breadcrumb link
- Sub-navs within tracks stay (e.g., Worlds / Teleport)
- Mobile hamburger simplified accordingly

**Files changed:** Header component only (~1 file)

---

## P2: Hub Page Upgrade

**Current:** Title + card grid
**New layout (top to bottom):**

1. **Hero section**
   - Headline: "Privacy for Every Dead Category on Solana"
   - Subtitle: "11 categories died because users were exposed. SIP resurrects them with one privacy layer."
   - 4 stat pills: `12 Categories` | `800+ Tests` | `Mainnet Live` | `Real Cryptography`

2. **How It Works row** — 3 cards:
   - Stealth Addresses -> "Unlinkable recipients"
   - Cryptographic Commitments -> "Hidden amounts"
   - Viewing Keys -> "Compliance without surveillance"

3. **Track grid** — existing cards + Audius (14 live + 3 coming soon)
   - Filter tabs: `All` | `Hackathon Tracks` | `Core Apps` | `Coming Soon`
   - Hackathon track cards get subtle sponsor name badge

4. **Footer banner** — "Built with @sip-protocol/sdk v0.7.3 — Anchor program live on mainnet"

**Files changed:** `src/app/page.tsx` (major rewrite)

---

## P3: Showcase Page Updates

**Page:** `/showcase/solana-privacy-2026`

- Update stat numbers (12 tracks, 807+ tests, 12 sponsors)
- Add Audius to sponsor alignment section
- Verify all demo video embeds still work
- This URL goes in every submission description

**Files changed:** `src/app/showcase/solana-privacy-2026/page.tsx`

---

## P4: Demo Mode

**Problem:** Judges without Solana wallets hit "Connect Wallet" dead-ends on every track.

**Solution:** Add "Try Demo" button next to "Connect Wallet" on every track form.

**Behavior:**
- Clicking "Try Demo" runs the full step animation with simulated data
- Stealth address generated (real SDK), commitment hash displayed, success state shown
- Small banner: "Demo Mode — connect wallet for real transactions"
- No wallet connection required

**Implementation:**
- Services already have `mode: "simulation"` — just need a UI trigger
- Add `isDemoMode` state to each flow hook
- "Try Demo" button calls the same flow with simulation mode
- Applies to all 12 track forms + payments

**Files changed:** ~12 form components (one per track) + shared demo banner component

---

## P5: Mobile QA

- Test all 12 tracks at 375px viewport width
- Fix overflow, truncation, touch target issues
- App already uses Tailwind responsive classes — expecting minor fixes only

---

## P6: Video (Feb 25)

- 3-min combined video showing all 12 tracks
- ~15s per track demo
- Script written day before recording
- Upload to YouTube/Loom
- Same video submitted to all tracks with different descriptions

---

## Execution Order

1. P0 Audius (day 1)
2. P1 Nav simplification (day 2 morning)
3. P2 Hub upgrade (day 2-3)
4. P3 Showcase updates (day 3)
5. P4 Demo mode (day 4-5)
6. P5 Mobile QA (day 6)
7. Buffer (day 7-9)
8. P6 Video (day 10 = Feb 25)
9. Submit (Feb 26-27)

## Commit Strategy

One commit per priority item (P0, P1, P2, etc.) — clean git history.
