# Graveyard Hackathon: Full E2E Excellence Design

**Goal:** Ship all 11 hackathon tracks with real mainnet E2E — real API reads, real on-chain writes via wallet adapter, real crypto. Zero simulation shortcuts.

**Network:** Solana mainnet-beta
**Excellence Bar:** Every track reads real sponsor data AND writes real transactions on-chain via wallet signing.

---

## Audit Findings

### Phase 1 Crypto: ALREADY DONE
All 11 services use genuine `@sip-protocol/sdk`:
- Real Pedersen commitments via `createRealCommitment()`
- Real stealth addresses via SDK `generateStealthAddress()`
- Real XChaCha20-Poly1305 via `encryptForViewingKey()`
- Real viewing keys for compliant mode

**Action:** Close #206-#209 after verification grep.

### Phase 2 Readers: Mixed
| Integration Level | Tracks |
|------------------|--------|
| **Real API/RPC** | Realms, Tapestry, Audius, Exchange Art (Helius), DRiP (Helius), Sunrise |
| **Partial** | Torque (campaigns real, progress simulated) |
| **Falls back to curated** | KYD, Portals, BIO |
| **Curated only** | MagicBlock (no public API) |

### On-Chain Writes: ALL SIMULATED
No service currently submits real transactions. `onCommitTransaction` hooks exist but aren't wired.

---

## Approach: Difficulty-Sorted (C)

### Wave 1: Medium Tracks (5)
Clear APIs, documented SDKs, straightforward write paths.

| # | Track | Sponsor | Read Strategy | Write Strategy |
|---|-------|---------|---------------|----------------|
| 1 | **Governance** | Realms | Already real (SPL Governance RPC) | `castVote` via `@solana/spl-governance` + wallet adapter |
| 2 | **Music** | Audius | Already real (public REST API) | Audius SDK playlist/favorite creation |
| 3 | **Migration** | Sunrise | Already real (Solana RPC for gSOL) | `@sunrisestake/client` deposit for real gSOL staking |
| 4 | **Social** | Tapestry | Already real (needs `TAPESTRY_API_KEY`) | Tapestry `socialfi` SDK profile + post creation |
| 5 | **Loyalty** | Torque | Partial (campaigns real) | Torque SDK campaign join + action completion |

### Wave 2: Hard Tracks — cNFT Group (3)
Share Metaplex Bubblegum infrastructure for on-chain minting.

| # | Track | Sponsor | Read Strategy | Write Strategy |
|---|-------|---------|---------------|----------------|
| 6 | **Art** | Exchange Art | Already real (Helius DAS) | Metaplex Bubblegum cNFT mint with stealth recipient |
| 7 | **Channel** | DRiP | Already real (Helius DAS) | Bubblegum cNFT drop creation with encrypted content |
| 8 | **Ticketing** | KYD | Fix API or Helius DAS fallback | Bubblegum cNFT ticket with stealth + anti-scalp |

### Wave 3: Hard Tracks — Creative Solutions (3)
Sponsors lack public write APIs. Use SIP program for on-chain commitments.

| # | Track | Sponsor | Read Strategy | Write Strategy |
|---|-------|---------|---------------|----------------|
| 9 | **Gaming** | MagicBlock | Curated (no API) | Commit-reveal RPS via SIP `shielded_transfer` program — Pedersen commitment hides move, reveal phase proves correctness |
| 10 | **Metaverse** | Portals | Fix API or curated + Helius | Stealth avatar as cNFT mint + room metadata commitment via SIP program |
| 11 | **DeSci** | BIO Protocol | Fix API or curated BioDAO data | Anonymous research funding via SIP `shielded_transfer` with viewing key for grant auditor |

### Wave 4: UX & Showcase (#221, #222, #225, #226)
- Showcase page upgrade with real integration badges
- Death/Revival narrative cards
- Animation polish + error states
- Demo video recording

---

## Shared Infrastructure Needs

### Bubblegum (Waves 2-3)
Tracks 6-8 (and partially 10) need Metaplex Bubblegum for cNFT minting:
- Merkle tree creation (one tree can serve all tracks)
- `mintToCollectionV1` with stealth recipient
- Helius DAS for reading minted cNFTs back

### Wallet Adapter Wiring
All write operations need:
- `useWallet()` for `publicKey` + `sendTransaction`
- `useConnection()` for RPC
- Transaction building + signing flow
- Error handling (rejected, timeout, insufficient funds)

### Environment Variables
| Variable | Tracks | Required |
|----------|--------|----------|
| `NEXT_PUBLIC_RPC_URL` | All | Already set (mainnet) |
| `NEXT_PUBLIC_HELIUS_API_KEY` | Art, DRiP, Ticketing, Metaverse | Needed for DAS reads |
| `TAPESTRY_API_KEY` | Social | Needed for Tapestry SDK |
| `NEXT_PUBLIC_SIP_PROGRAM_ID` | Gaming, DeSci, Metaverse | Already set |

---

## Success Criteria

Per track:
1. Reader returns real data from sponsor API/RPC (no SAMPLE_ fallback in normal operation)
2. Write operations submit real transactions to mainnet via wallet adapter
3. Transaction confirmation shown with Solscan link
4. Error states handled (wallet rejection, insufficient funds, RPC timeout)
5. All existing tests still pass (979/979)

Overall:
- All 11 tracks fully E2E on mainnet
- Showcase page reflects real integration levels
- Demo video captures real mainnet transactions
