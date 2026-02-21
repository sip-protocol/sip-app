# Graveyard Hackathon: E2E Excellence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship all 11 hackathon tracks with real mainnet E2E — real API reads, real on-chain writes via wallet adapter, real crypto. Zero simulation shortcuts.

**Architecture:** Each track follows a three-layer pattern: Reader (real sponsor API/RPC) → Service (crypto + state machine with `onCommitTransaction` callback) → Component (UI + `useOnChainCommit` hook for wallet signing). The `useOnChainCommit` hook builds a real `verify_commitment` transaction via the SIP Privacy program on mainnet. Some tracks add sponsor-specific writes (SPL Governance castVote, Bubblegum cNFT mint, SIP shielded_transfer).

**Tech Stack:** Next.js 16, @solana/web3.js, @solana/spl-governance, @metaplex-foundation/mpl-bubblegum, @sip-protocol/sdk, Vitest

**Network:** Solana mainnet-beta (`S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at`)

---

## Current State Audit

### What's Already Real

| Layer | Status | Details |
|-------|--------|---------|
| **Crypto** | ✅ ALL REAL | All 11 services use genuine @sip-protocol/sdk — Pedersen commitments, stealth addresses, XChaCha20-Poly1305, viewing keys |
| **On-chain commits** | ✅ 10/11 WIRED | `useOnChainCommit` wired in all tracks except Music. Sends real `verify_commitment` tx when wallet connected |
| **Demo mode** | ✅ DEFAULTS OFF | `isDemoMode: false` — real transactions by default |

### Components Already Wiring `useOnChainCommit`

| Component | File | Type |
|-----------|------|------|
| VoteForm | `src/components/governance/vote-form.tsx` | "vote" |
| CreatePostForm | `src/components/social/create-post-form.tsx` | "post" |
| ClaimRewardForm | `src/components/loyalty/claim-reward-form.tsx` | "reward" |
| PlayForm + RPSGame | `src/components/gaming/play-form.tsx` | "move" |
| PurchaseForm | `src/components/ticketing/purchase-form.tsx` | "ticket" |
| CreateDropForm | `src/components/channel/create-drop-form.tsx` | "drop" |
| TeleportForm | `src/components/metaverse/teleport-form.tsx` | "teleport" |
| useGenerateArt hook | `src/hooks/use-generate-art.ts` | "art" |
| useMigrationExecute hook | `src/hooks/use-migration-execute.ts` | "migrate" |
| useFundProject hook | `src/hooks/use-fund-project.ts` | "fund" |
| **Music** | **NOT WIRED** | — |

### Reader Status

| Track | Sponsor | Read Status | Gap |
|-------|---------|-------------|-----|
| Governance | Realms | ✅ Real SPL Governance RPC | — |
| Music | Audius | ✅ Real Audius REST API | `getListeners()` simulated |
| Migration | Sunrise | ✅ Real Solana RPC (gSOL) | Deposit returns simulated hash |
| Social | Tapestry | ✅ Real socialfi SDK | Needs `TAPESTRY_API_KEY` |
| Loyalty | Torque | ⚠️ Partial | Campaigns real, progress/rewards simulated |
| Art | Exchange Art | ✅ Real Helius DAS | — |
| Channel | DRiP | ✅ Real Helius DAS | — |
| Ticketing | KYD | ⚠️ Curated fallback | Fix API or Helius DAS fallback |
| Gaming | MagicBlock | ❌ Curated only | No public API exists |
| Metaverse | Portals | ⚠️ Curated fallback | Fix API or Helius DAS |
| DeSci | BIO Protocol | ⚠️ Curated fallback | Fix API or curated BioDAO data |

---

## Wave 1: Medium Tracks (5)

Clear APIs, documented SDKs, straightforward write paths.

### Task 1: Governance — Wire SPL Governance `castVote`

**Files:**
- Create: `src/lib/governance/realms-vote-builder.ts`
- Modify: `src/hooks/use-governance-vote.ts`
- Modify: `src/components/governance/vote-form.tsx`
- Test: `tests/lib/governance/realms-vote-builder.test.ts`

**Context:** Governance already has real reads (SPL Governance RPC to 5 mainnet DAOs) and `useOnChainCommit("vote")` sending real verify_commitment transactions. Add a second real write: SPL Governance `castVote` instruction that records the private vote on-chain.

**Step 1: Write the vote builder module**

Create `src/lib/governance/realms-vote-builder.ts`:

```typescript
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  Connection,
  ComputeBudgetProgram,
} from "@solana/web3.js"
import {
  getGovernanceProgramVersion,
  withCastVote,
  Vote,
  VoteChoice,
  VoteKind,
  VoteType,
} from "@solana/spl-governance"

const REALMS_PROGRAM_ID = new PublicKey(
  "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw"
)

export interface CastVoteParams {
  realmPubkey: PublicKey
  governancePubkey: PublicKey
  proposalPubkey: PublicKey
  tokenOwnerRecordPubkey: PublicKey
  voterPubkey: PublicKey
  voterWeightRecordPubkey?: PublicKey
  choice: number
}

export async function buildCastVoteTransaction(
  connection: Connection,
  params: CastVoteParams
): Promise<Transaction> {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed")

  const tx = new Transaction({ feePayer: params.voterPubkey, blockhash, lastValidBlockHeight })

  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }))
  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }))

  const programVersion = await getGovernanceProgramVersion(
    connection,
    REALMS_PROGRAM_ID
  )

  const vote = new Vote({
    voteType: VoteKind.Approve,
    approveChoices: [new VoteChoice({ rank: 0, weightPercentage: 100 })],
    deny: undefined,
    veto: undefined,
  })

  await withCastVote(
    tx.instructions as TransactionInstruction[],
    REALMS_PROGRAM_ID,
    programVersion,
    params.realmPubkey,
    params.governancePubkey,
    params.proposalPubkey,
    params.tokenOwnerRecordPubkey,
    params.tokenOwnerRecordPubkey,
    params.voterPubkey,
    params.voterPubkey,
    vote,
    params.voterWeightRecordPubkey
      ? params.voterWeightRecordPubkey
      : undefined
  )

  return tx
}
```

**Step 2: Write failing test**

Create `tests/lib/governance/realms-vote-builder.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { PublicKey, Connection } from "@solana/web3.js"

vi.mock("@solana/spl-governance", () => ({
  getGovernanceProgramVersion: vi.fn().mockResolvedValue(3),
  withCastVote: vi.fn(),
  Vote: vi.fn(),
  VoteChoice: vi.fn(),
  VoteKind: { Approve: 0 },
  VoteType: { SingleChoice: 0 },
}))

describe("realms-vote-builder", () => {
  const mockConnection = {
    getLatestBlockhash: vi.fn().mockResolvedValue({
      blockhash: "mock-blockhash",
      lastValidBlockHeight: 100,
    }),
  } as unknown as Connection

  it("builds a castVote transaction with correct accounts", async () => {
    const { buildCastVoteTransaction } = await import(
      "@/lib/governance/realms-vote-builder"
    )
    const { withCastVote } = await import("@solana/spl-governance")

    const params = {
      realmPubkey: PublicKey.unique(),
      governancePubkey: PublicKey.unique(),
      proposalPubkey: PublicKey.unique(),
      tokenOwnerRecordPubkey: PublicKey.unique(),
      voterPubkey: PublicKey.unique(),
      choice: 0,
    }

    const tx = await buildCastVoteTransaction(mockConnection, params)

    expect(tx).toBeDefined()
    expect(tx.feePayer).toEqual(params.voterPubkey)
    expect(withCastVote).toHaveBeenCalled()
  })
})
```

**Step 3: Run test to verify it passes**

```bash
pnpm test -- tests/lib/governance/realms-vote-builder.test.ts --run
```

**Step 4: Update use-governance-vote hook to optionally send castVote**

Modify `src/hooks/use-governance-vote.ts` — add `realmsVote` flag to options:

```typescript
// In UseGovernanceVoteOptions, add:
sendRealmsVote?: boolean  // When true, also sends SPL Governance castVote tx
```

In the `commitVote` callback, after the existing `service.commitVote()`, if `sendRealmsVote` is true and proposal has `realmPubkey`, build and send the castVote transaction.

**Step 5: Run all governance tests**

```bash
pnpm test -- tests/lib/governance --run && pnpm test -- tests/hooks/use-governance --run
```

**Step 6: Commit**

```bash
git add src/lib/governance/realms-vote-builder.ts tests/lib/governance/realms-vote-builder.test.ts src/hooks/use-governance-vote.ts
git commit -m "feat(governance): add real SPL Governance castVote transaction builder"
```

---

### Task 2: Music — Wire `useOnChainCommit` for playlist actions

**Files:**
- Modify: `src/lib/music/music-service.ts` — add `onCommitTransaction` callback
- Create: `src/hooks/use-music-commit.ts` — wrapper hook
- Modify: `src/components/music/playlist-form.tsx` (or equivalent) — wire callback
- Test: `tests/lib/music/music-service.test.ts` — update

**Context:** Music is the ONLY track without `useOnChainCommit` wired. The service has NO `onCommitTransaction` callback. The reader (Audius API) is already real.

**Step 1: Add `onCommitTransaction` to MusicService**

Modify `src/lib/music/music-service.ts`:

```typescript
// In MusicServiceOptions interface, add:
onCommitTransaction?: (trackId: string, action: string) => Promise<string | null>

// In the constructor, store it:
this.onCommitTransaction = options.onCommitTransaction

// In createPlaylist() or addToPlaylist(), call it during the "committing" step:
if (this.onCommitTransaction) {
  const signature = await this.onCommitTransaction(trackId, "playlist")
  if (signature) {
    result.txSignature = signature
  }
} else if (this.mode === "simulation") {
  await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.committing))
}
```

**Step 2: Find and update the music component that triggers writes**

Search for the component that calls `createPlaylist()` or the equivalent write operation. Wire `useOnChainCommit("playlist")` callback into it following the same pattern as `vote-form.tsx`.

Note: `CommitmentType` in `commitment-store.ts` may need a new `"playlist"` type. Add it if not present.

**Step 3: Update existing music service tests**

Ensure existing tests still pass with the new optional callback.

**Step 4: Run tests**

```bash
pnpm test -- tests/lib/music --run
```

**Step 5: Commit**

```bash
git commit -m "feat(music): wire useOnChainCommit for playlist actions"
```

---

### Task 3: Migration — Wire real Sunrise gSOL deposit

**Files:**
- Modify: `src/lib/migrations/sunrise-client.ts` — real deposit transaction
- Modify: `src/lib/migrations/migration-service.ts` — use real deposit when wallet available
- Test: `tests/lib/migrations/sunrise-client.test.ts`

**Context:** Sunrise reads are already real (gSOL supply, holding balance via Solana RPC). The deposit operation currently returns a simulated tx hash. Wire a real SOL → gSOL deposit via SIP's `shielded_transfer` to a stealth address (Sunrise doesn't have a public SDK for deposits).

**Step 1: Update sunrise-client.ts deposit to build a real shielded_transfer**

Instead of returning a fake hash, build a real `shielded_transfer` instruction that sends SOL to a stealth address with a "gSOL migration" commitment. This uses the existing `buildShieldedTransferInstruction` from program-client.ts.

**Step 2: Update migration-service.ts to use the real deposit path**

In the "migrating" step, if `onCommitTransaction` callback exists, call it. If the Sunrise deposit also succeeds, include both tx signatures.

**Step 3: Test the updated flow**

```bash
pnpm test -- tests/lib/migrations --run
```

**Step 4: Commit**

```bash
git commit -m "feat(migrations): wire real shielded_transfer for gSOL deposit"
```

---

### Task 4: Social — Wire `onCommitTransaction` for profile + follow

**Files:**
- Modify: `src/components/social/create-profile-form.tsx` (or equivalent) — wire callback
- Modify: `src/components/social/follow-button.tsx` (or equivalent) — wire callback
- Modify: `src/hooks/use-create-profile.ts` (or equivalent)
- Modify: `src/hooks/use-follow-profile.ts` (or equivalent)

**Context:** `CreatePostForm` already wires `useOnChainCommit("post")`. But `createProfile()` and `followProfile()` in the SocialService do NOT call `onCommitTransaction`. Find the components/hooks that trigger these operations and wire the callback.

**Step 1: Find the profile creation component**

```bash
grep -r "createProfile" src/components/social/ src/hooks/
```

**Step 2: Wire `useOnChainCommit("post")` into the profile creation flow**

Follow the exact pattern from `create-post-form.tsx`:
```typescript
const { commit } = useOnChainCommit("post")
// Pass commit as onCommitTransaction to the hook/service
```

**Step 3: Wire follow operation similarly**

**Step 4: Run tests**

```bash
pnpm test -- tests/lib/social --run && pnpm test -- tests/hooks/use-social --run
```

**Step 5: Commit**

```bash
git commit -m "feat(social): wire onCommitTransaction for profile and follow operations"
```

---

### Task 5: Loyalty — Wire `onCommitTransaction` for campaign join + action

**Files:**
- Modify: `src/components/loyalty/join-campaign-form.tsx` (or equivalent) — wire callback
- Modify: `src/hooks/use-join-campaign.ts` (or equivalent)
- Modify: `src/hooks/use-complete-action.ts` (or equivalent)

**Context:** `ClaimRewardForm` wires `useOnChainCommit("reward")`. But `joinCampaign()` and `completeAction()` in LoyaltyService do NOT call `onCommitTransaction`. Wire them.

**Step 1: Find campaign join component/hook**

```bash
grep -r "joinCampaign\|completeAction" src/components/loyalty/ src/hooks/
```

**Step 2: Wire `useOnChainCommit("reward")` into join + action flows**

Same pattern as claim-reward-form.tsx.

**Step 3: Run tests**

```bash
pnpm test -- tests/lib/loyalty --run
```

**Step 4: Commit**

```bash
git commit -m "feat(loyalty): wire onCommitTransaction for campaign join and action"
```

---

## Wave 2: Hard Tracks — cNFT Group (3)

Share Metaplex Bubblegum infrastructure for on-chain minting.

### Task 6: Shared Bubblegum Infrastructure

**Files:**
- Create: `src/lib/solana/bubblegum-client.ts` — shared cNFT minting utilities
- Test: `tests/lib/solana/bubblegum-client.test.ts`

**Context:** Tracks 7-9 all need Metaplex Bubblegum for compressed NFT minting to stealth addresses. Create a shared module that all three can use.

**Dependencies:** `@metaplex-foundation/mpl-bubblegum` already in package.json. May need `@metaplex-foundation/umi` and `@metaplex-foundation/umi-bundle-defaults`.

**Step 1: Install missing UMI dependencies**

```bash
pnpm add @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/umi-web3js-adapters
```

**Step 2: Create bubblegum-client.ts**

```typescript
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { mintToCollectionV1 } from "@metaplex-foundation/mpl-bubblegum"
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi"
import { PublicKey, Transaction, Connection } from "@solana/web3.js"
import { toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters"

export interface MintCNFTParams {
  connection: Connection
  payer: PublicKey
  /** Stealth address as recipient (unlinkable) */
  recipient: PublicKey
  /** Merkle tree address for cNFT storage */
  merkleTree: PublicKey
  /** Collection mint address */
  collectionMint: PublicKey
  /** NFT metadata */
  metadata: {
    name: string
    uri: string
    symbol?: string
  }
}

export async function buildMintCNFTTransaction(
  params: MintCNFTParams
): Promise<Transaction> {
  // Implementation using Bubblegum + UMI
  // Convert to web3.js Transaction for wallet adapter compatibility
}
```

**Step 3: Write tests**

Test that the transaction builder produces valid instructions with correct accounts.

**Step 4: Commit**

```bash
git commit -m "feat(solana): add shared Bubblegum cNFT minting infrastructure"
```

---

### Task 7: Art — Bubblegum cNFT mint to stealth address

**Files:**
- Modify: `src/lib/art/art-service.ts` — replace fake mint with real Bubblegum
- Modify: `src/hooks/use-generate-art.ts` — wire cNFT mint
- Test: `tests/lib/art/art-service.test.ts`

**Context:** Art service generates fake mint addresses (`SIP${generateId("nft")}`). Replace with real Bubblegum `mintToCollectionV1` to a stealth recipient address.

**Step 1: Update art-service.ts `mintNFT()` method**

Replace fake address generation with a call to the shared `buildMintCNFTTransaction()`. Use the existing stealth address from the art generation step as the cNFT recipient.

**Step 2: Update use-generate-art.ts hook**

After the existing commitment tx, send the cNFT mint tx via `useSolanaTransaction()`.

**Step 3: Test**

```bash
pnpm test -- tests/lib/art --run
```

**Step 4: Commit**

```bash
git commit -m "feat(art): real Bubblegum cNFT mint to stealth address"
```

---

### Task 8: Channel — Bubblegum cNFT drop creation

**Files:**
- Modify: `src/lib/channel/channel-service.ts` — replace simulated drop with cNFT
- Modify: `src/hooks/use-publish-drop.ts`
- Test: `tests/lib/channel/channel-service.test.ts`

**Context:** Channel (DRiP) reads are real (Helius DAS). Drop creation simulated. Replace with Bubblegum cNFT mint for the drop content.

**Step 1: Update channel-service.ts `publishDrop()` method**

In the "publishing" step, build a cNFT mint transaction using the shared Bubblegum client. The cNFT metadata includes the encrypted drop content URI.

**Step 2: Update hook to send the mint tx**

**Step 3: Test and commit**

```bash
pnpm test -- tests/lib/channel --run
git commit -m "feat(channel): real Bubblegum cNFT for drop creation"
```

---

### Task 9: Ticketing — Bubblegum cNFT ticket with anti-scalp

**Files:**
- Modify: `src/lib/ticketing/ticketing-service.ts` — replace simulated ticket with cNFT
- Modify: `src/hooks/use-purchase-ticket.ts`
- Test: `tests/lib/ticketing/ticketing-service.test.ts`

**Context:** Ticketing reads may need Helius DAS fallback. Ticket purchase is simulated. Replace with Bubblegum cNFT mint to stealth address (anti-scalping: ticket is non-transferable to stealth).

**Step 1: Fix reader if needed**

Check if KYD API works. If not, use Helius DAS to read NFT collections as event tickets.

**Step 2: Update ticketing-service.ts `purchaseTicket()` method**

Build cNFT mint for the ticket, using stealth recipient for anti-scalp privacy.

**Step 3: Test and commit**

```bash
pnpm test -- tests/lib/ticketing --run
git commit -m "feat(ticketing): real Bubblegum cNFT ticket with stealth anti-scalp"
```

---

## Wave 3: Hard Tracks — Creative Solutions (3)

Sponsors lack public write APIs. Use SIP program for on-chain commitments.

### Task 10: Gaming — Enhanced commit-reveal via SIP program

**Files:**
- Modify: `src/lib/gaming/gaming-service.ts` — enhance game commitment
- Modify: `src/hooks/use-play-game.ts`
- Test: `tests/lib/gaming/gaming-service.test.ts`

**Context:** Gaming already uses `useOnChainCommit("move")` which sends a real `verify_commitment` transaction. The game uses Pedersen commitments to hide the player's RPS move. This is ALREADY a real on-chain write. Enhance by also committing the reveal phase on-chain.

**Step 1: Add reveal-phase commit**

After the opponent reveals, build a `createRevealTransaction()` (from commitment-store.ts) that proves the original move matches. This creates a complete on-chain commit-reveal game.

**Step 2: Test**

```bash
pnpm test -- tests/lib/gaming --run
```

**Step 3: Commit**

```bash
git commit -m "feat(gaming): add on-chain reveal transaction for complete commit-reveal RPS"
```

---

### Task 11: Metaverse — SIP shielded_transfer for avatar

**Files:**
- Modify: `src/lib/metaverse/metaverse-service.ts` — add shielded_transfer for teleport
- Modify: `src/hooks/use-teleport.ts`
- Test: `tests/lib/metaverse/metaverse-service.test.ts`

**Context:** Metaverse reads use curated data (no Portals API). `useOnChainCommit("teleport")` already wired. ADD: A real `shielded_transfer` that sends a tiny SOL amount to a stealth address representing the avatar metadata commitment.

**Step 1: Update metaverse-service.ts teleport()**

In the "teleporting" step, after the existing commitment, build a `shielded_transfer` instruction that sends 0.001 SOL to a stealth address with the room metadata as the commitment.

**Step 2: Test**

```bash
pnpm test -- tests/lib/metaverse --run
```

**Step 3: Commit**

```bash
git commit -m "feat(metaverse): add shielded_transfer for avatar teleportation"
```

---

### Task 12: DeSci — SIP shielded_transfer for anonymous funding

**Files:**
- Modify: `src/lib/desci/desci-service.ts` — add shielded_transfer for funding
- Modify: `src/hooks/use-fund-project.ts`
- Test: `tests/lib/desci/desci-service.test.ts`

**Context:** DeSci reads use curated BioDAO data. `useOnChainCommit("fund")` already wired. ADD: A real `shielded_transfer` that anonymously funds a research project by sending SOL to a stealth address with a viewing key for the grant auditor.

**Step 1: Update desci-service.ts fundProject()**

Build a `shielded_transfer` instruction that:
- Sends configurable SOL amount to a stealth address
- Includes viewing key hash for the auditor
- Encrypted amount reveals actual funding to authorized auditors only

**Step 2: Test**

```bash
pnpm test -- tests/lib/desci --run
```

**Step 3: Commit**

```bash
git commit -m "feat(desci): add shielded_transfer for anonymous research funding"
```

---

## Wave 4: UX & Showcase

### Task 13: Update showcase integration badges

**Files:**
- Modify: `src/app/showcase/graveyard-2026/page.tsx`

**Context:** Update integration level badges to reflect real E2E:
- `enhanced-sim` → `on-chain` for Gaming, Metaverse, DeSci (after Wave 3)
- Verify all `live-api` and `on-chain` badges are accurate
- Update metrics (test counts, endpoint counts)

**Step 1: Update track integration levels**

```typescript
// Gaming: enhanced-sim → on-chain (commit-reveal RPS)
// Metaverse: enhanced-sim → on-chain (shielded_transfer)
// DeSci: enhanced-sim → on-chain (shielded_transfer)
```

**Step 2: Update traction metrics**

Update test count, add "mainnet transactions" metric.

**Step 3: Commit**

```bash
git commit -m "feat(showcase): update integration badges to reflect real E2E"
```

---

### Task 14: Close Phase 1 crypto issues

**Files:** GitHub issues only

**Context:** Issues #206-#209 were about fake crypto. All 11 services now use real @sip-protocol/sdk crypto.

**Step 1: Verify with grep**

```bash
# Ensure no SAMPLE_ or fake crypto patterns remain
grep -r "SAMPLE_\|fakeCrypto\|mockCommitment\|simulatedHash" src/lib/*/
```

**Step 2: Close issues**

```bash
gh issue close 206 -c "Verified: all 11 services use real @sip-protocol/sdk crypto"
gh issue close 207 -c "Verified: real Pedersen commitments via createRealCommitment()"
gh issue close 208 -c "Verified: real stealth addresses via SDK generateStealthAddress()"
gh issue close 209 -c "Verified: real XChaCha20-Poly1305 via encryptForViewingKey()"
```

---

### Task 15: Run full test suite and verify

**Step 1: Type check**

```bash
pnpm typecheck
```

**Step 2: Run all tests**

```bash
pnpm test -- --run 2>&1 | tail -20
```

Expected: All 979+ tests passing.

**Step 3: Verify on mainnet**

Manual verification (requires wallet with SOL):
1. Connect Phantom wallet
2. Navigate to `/governance` → cast a vote → verify Solscan link
3. Navigate to `/gaming` → play RPS → verify commitment tx
4. Navigate to `/art` → generate art → verify cNFT mint tx

---

## Environment Variables

| Variable | Tracks | Required | Status |
|----------|--------|----------|--------|
| `NEXT_PUBLIC_RPC_URL` | All | Already set | ✅ mainnet |
| `NEXT_PUBLIC_HELIUS_API_KEY` | Art, DRiP, Ticketing, Metaverse | Needed for DAS | ⚠️ Add |
| `TAPESTRY_API_KEY` | Social | Needed for writes | ⚠️ Add |
| `NEXT_PUBLIC_SIP_PROGRAM_ID` | Gaming, DeSci, Metaverse | Already set | ✅ |

---

## Success Criteria

Per track:
1. Reader returns real data from sponsor API/RPC (no SAMPLE_ fallback in normal operation)
2. Write operations submit real transactions to mainnet via wallet adapter
3. Transaction confirmation shown with Solscan link
4. Error states handled (wallet rejection, insufficient funds, RPC timeout)
5. All existing tests still pass

Overall:
- All 11 tracks fully E2E on mainnet
- Showcase page reflects real integration levels
- Demo video captures real mainnet transactions

---

## Dependency Map

```
Task 6 (Bubblegum infra) ──┬── Task 7 (Art cNFT)
                            ├── Task 8 (Channel cNFT)
                            └── Task 9 (Ticketing cNFT)

Tasks 1-5 (Wave 1) ── independent, can parallelize
Tasks 10-12 (Wave 3) ── independent, can parallelize
Task 13 (Showcase) ── depends on Tasks 1-12
Task 14 (Close issues) ── independent
Task 15 (Verification) ── depends on all
```

---

## File Summary

| File | Action | Wave | Priority |
|------|--------|------|----------|
| `src/lib/governance/realms-vote-builder.ts` | CREATE | 1 | P0 |
| `src/hooks/use-governance-vote.ts` | MODIFY | 1 | P0 |
| `src/lib/music/music-service.ts` | MODIFY | 1 | P0 |
| `src/lib/migrations/sunrise-client.ts` | MODIFY | 1 | P0 |
| `src/lib/migrations/migration-service.ts` | MODIFY | 1 | P0 |
| `src/components/social/*` | MODIFY | 1 | P1 |
| `src/components/loyalty/*` | MODIFY | 1 | P1 |
| `src/lib/solana/bubblegum-client.ts` | CREATE | 2 | P0 |
| `src/lib/art/art-service.ts` | MODIFY | 2 | P1 |
| `src/lib/channel/channel-service.ts` | MODIFY | 2 | P1 |
| `src/lib/ticketing/ticketing-service.ts` | MODIFY | 2 | P1 |
| `src/lib/gaming/gaming-service.ts` | MODIFY | 3 | P1 |
| `src/lib/metaverse/metaverse-service.ts` | MODIFY | 3 | P1 |
| `src/lib/desci/desci-service.ts` | MODIFY | 3 | P1 |
| `src/app/showcase/graveyard-2026/page.tsx` | MODIFY | 4 | P2 |
