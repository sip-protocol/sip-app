# Track Deepening Design: Real SIP Primitives

**Date:** 2026-02-18
**Status:** Approved
**Goal:** Replace simulated writes with real on-chain operations across top 5 tracks

## Philosophy

The hackathon tracks are **showcases**, not the product. We build production-grade SIP primitives that demonstrate privacy resurrecting dead Solana categories. Excellence first, accolades second.

## Three Reusable Primitives

All tracks consume shared infrastructure from `src/lib/solana/`:

### Primitive 1: Stealth Transfer (`stealth-transfer.ts`)

Real SOL transfers via stealth addresses. Sender hidden, amount committed via Pedersen, recipient address is one-time-use.

**Interface:**
```typescript
interface StealthTransferParams {
  recipientMetaAddress: string // stealth meta-address (spending + viewing pubkeys)
  amountLamports: number
  privacyLevel: 'shielded' | 'compliant' | 'transparent'
  memo?: string // optional memo (e.g., "tip", "fund", "purchase")
  viewingKeyData?: Record<string, unknown> // encrypted metadata for compliant mode
}

interface StealthTransferResult {
  txSignature: string
  stealthAddress: string // one-time recipient address
  commitment: string // Pedersen commitment of amount
  ephemeralPublicKey: string // for recipient to derive private key
  explorerUrl: string // solscan link
}
```

**Used by:** Music (tipping), DeSci (funding), Ticketing (purchase)

### Primitive 2: Commitment Store (`commitment-store.ts`)

Store Pedersen commitment hashes on Solana. Uses memo program for lightweight on-chain proofs, or SIP program PDAs for structured storage.

**Interface:**
```typescript
interface CommitmentStoreParams {
  commitmentHash: string // sha256 of committed data
  commitmentType: 'vote' | 'move' | 'ticket' | 'generic'
  metadata?: string // encrypted metadata blob
}

interface CommitmentStoreResult {
  txSignature: string
  slot: number
  explorerUrl: string
}

interface CommitmentRevealParams {
  originalTxSignature: string
  preimage: string // the data that was committed
  salt: string
}
```

**Used by:** Governance (vote commit/reveal), Gaming (move commit/reveal)

### Primitive 3: Viewing Key Disclosure (`viewing-key-reveal.ts`)

Selective reveal of encrypted data to authorized parties. Already exists in SDK — this wraps it with on-chain anchoring.

**Interface:**
```typescript
interface ViewingKeyDisclosure {
  encryptedPayload: string
  nonce: string
  viewingKeyHash: string
  anchorTxSignature?: string // optional on-chain proof of disclosure
}
```

**Used by:** Governance (compliance), DeSci (regulatory audit), Ticketing (organizer verification)

## Track Integration Plan

### 1. Governance/Realms — Private Voting (Priority: Highest)

**Current:** Encrypted votes stored in browser Zustand store only.
**Target:** Vote commitments on-chain, reveal verification, real tx signatures.

**Changes:**
- `governance-service.ts`: Replace setTimeout simulation with `commitmentStore.store()` call
- `vote-commitment-display.tsx`: Show real Solscan link to commitment tx
- `reveal-form.tsx`: Submit reveal tx with preimage verification
- `vote-status.tsx`: Track real tx confirmation states (pending → confirmed → finalized)
- Wallet adapter integration for signing

**Roadmap value:** Direct M18 DAO tooling. Private voting becomes a real SIP product.

### 2. Music/Audius — Stealth Tipping (Priority: High)

**Current:** Stream simulation with real audio playback.
**Target:** Real SOL tips to artists via stealth addresses.

**Changes:**
- New `tip-form.tsx` component (amount input + privacy toggle)
- `music-service.ts`: Add `tipArtist()` method using `stealthTransfer.send()`
- `track-card.tsx` or `audio-player.tsx`: Add tip button
- `stream-form.tsx`: Optional tip field during stream action
- Show tx signature + Solscan link post-tip

**Roadmap value:** Core stealth payments primitive. Reusable for any "anonymous donation" use case.

### 3. DeSci/BIO — Anonymous Research Funding (Priority: High)

**Current:** Funding simulation with real BioDAO references.
**Target:** Real SOL transfers to project stealth addresses.

**Changes:**
- `desci-service.ts`: Replace simulation with `stealthTransfer.send()` in `fundProject()`
- Show real tx signature + commitment hash on Solscan
- Viewing key disclosure for compliance mode (regulator can see amount, not funder)

**Roadmap value:** Compliant anonymous funding. Reusable for DAOs, grants, donations.

### 4. Gaming/MagicBlock — On-Chain Commit-Reveal (Priority: Medium)

**Current:** RPS game with client-side Pedersen commitments, simulated opponent.
**Target:** Move commitments stored on-chain, verifiable reveal.

**Changes:**
- `gaming-service.ts`: Store commitment via `commitmentStore.store()` at commit phase
- `rps-game.tsx`: Display commitment tx signature during game
- Reveal phase submits preimage on-chain via `commitmentStore.reveal()`
- Anyone can verify the game was fair by checking both txs on Solscan

**Roadmap value:** Commit-reveal protocol showcase. Demonstrates Pedersen commitments in action.

### 5. Ticketing/KYD — cNFT Ticket Minting (Priority: Lower)

**Current:** Ticket purchase simulation with real Pedersen commitment IDs.
**Target:** Real compressed NFT minted to stealth address on devnet.

**Changes:**
- New `cnft-mint.ts` utility wrapping Metaplex Bubblegum
- `ticketing-service.ts`: Call cNFT mint in `purchaseTicket()`
- Merkle tree setup (one-time devnet deployment)
- Display real cNFT on Solscan/XRAY after purchase

**Roadmap value:** NFT + privacy primitive. Useful for any "private NFT ownership" scenario.

## Shared Infrastructure

### Wallet Integration

All primitives require wallet signing. sip-app already has Solana wallet adapter configured. The primitives accept a `wallet: WalletContextState` parameter.

### Network Configuration

- **Devnet** by default for new features (safe for testing)
- **Mainnet** toggle via environment variable
- SIP program deployed on both (`S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at`)

### Error Handling

- Wallet not connected → prompt connection
- Insufficient balance → show required amount
- Tx failed → show error with retry option
- Tx pending → show spinner with Solscan link
- Tx confirmed → show success with explorer link

### Testing

- Unit tests for each primitive (mock RPC)
- Integration tests with devnet (optional, slower)
- Existing track tests must not break (865+ passing)

## Implementation Order

1. Stealth Transfer primitive + tests
2. Commitment Store primitive + tests
3. Governance integration (highest roadmap value)
4. Music integration (best demo — audio + tipping)
5. DeSci integration (strongest narrative)
6. Gaming integration (playable proof)
7. Ticketing integration (if time — cNFT complexity)

## Success Criteria

- [ ] Real Solana transactions visible on Solscan/explorer
- [ ] Wallet signing flow works (connect → sign → confirm)
- [ ] All existing tests still pass (865+)
- [ ] Typecheck clean
- [ ] Each primitive has its own test suite
- [ ] Demo mode still works (graceful fallback when no wallet)
