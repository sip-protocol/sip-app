# Graveyard Hackathon 2026 — Typeform Submission Draft

> **URL:** https://solanafoundation.typeform.com/graveyardhack
> **Deadline:** Feb 27, 2026
> **Status:** DRAFT — RECTOR to review, record video, then submit

---

## Field 1: Project Name

```
SIP Protocol
```

## Field 2: One-Line Description

```
Privacy middleware that resurrects 11 dead Solana categories — governance, social, gaming, art, music, DeSci, loyalty, ticketing, metaverse, NFTs, and migrations — with real Pedersen commitments, stealth addresses, and viewing keys on mainnet.
```

## Field 3: Presentation Video Link

```
[RECTOR: Upload 4-min max video to YouTube unlisted, paste link here]
```

> Script: `docs/plans/2026-02-25-graveyard-video-script.md`

## Field 4: Sponsor Bounties (Select All That Apply)

- [x] Sunrise (Migrations track — green staking)
- [x] Exchange Art (Art track — stealth cNFT minting)
- [x] Tapestry (Social track — anonymous social identity)
- [x] Magicblock (Gaming track — commit-reveal RPS)
- [x] KYD Labs (Ticketing track — stealth cNFT tickets)
- [x] Realms (Governance track — private voting)
- [x] Portals (Metaverse track — stealth avatars)
- [x] Drip (Channel track — encrypted NFT drops)
- [x] Torque (Loyalty track — stealth reward claims)
- [x] Bio (DeSci track — anonymous research funding)
- [x] Audius (Music track — stealth listener identity)
- [ ] OrbitFlare (not applicable)

## Field 5: Detailed Project Description

> Note: "Obvious AI-generated answers may result in disqualification" — write naturally, first person.

```
SIP Protocol is a privacy layer for Solana. I built it because every category that died
on Solana — governance, social, gaming, art — died because users were exposed. Their
wallets tracked, activity surveilled, identities linked. Privacy fixes all of it.

The core idea: three cryptographic primitives applied to every category.

1. Stealth addresses (EIP-5564 style, secp256k1/ed25519) — generate one-time addresses
   that can't be linked back to the sender. Every track uses these for identity privacy.

2. Pedersen commitments (value * G + blinding * H) — hide amounts while proving they're
   valid. Not random hex strings — real elliptic curve math from our SDK.

3. Viewing keys (XChaCha20-Poly1305 encrypted) — selective disclosure for compliance.
   Auditors can verify without the public seeing anything.

What I actually built for the hackathon:

- 11 sponsor track applications at app.sip-protocol.org, each with real API integrations
  (SPL Governance, Tapestry SocialFi SDK, Torque campaigns, Audius Discovery Provider,
  Helius DAS, Metaplex Bubblegum, and more)
- A playable Rock-Paper-Scissors game using commit-reveal with real Pedersen commitments
- An Anchor program on Solana mainnet (S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at)
  that receives real verify_commitment transactions
- 25 mainnet E2E tests (Playwright) that inject a real funded wallet and send actual
  on-chain transactions — 8 tracks produce verifiable SIP-COMMIT tx signatures on Solscan
- A "Try Demo" mode on every track so judges can experience the full flow without a wallet
- The @sip-protocol/sdk on npm (v0.8.0) with 7,500+ tests across crypto, stealth,
  privacy, multi-chain, and proof modules

The app itself has 1,184 unit tests + 25 mainnet E2E tests. Every commitment shown in the
UI is a real Pedersen commitment from the SDK — not a mock.

Previous track record: Winner at Zypherpunk Hackathon Dec 2025 ($6,500, #9/93, 3 tracks).
$10K Superteam Indonesia grant approved Jan 2026.

Tech stack: Next.js 16, React 19, Tailwind CSS 4, @sip-protocol/sdk v0.8.0, Anchor,
@solana/web3.js, Zustand 5, framer-motion, Vitest, Playwright.
```

## Field 6: Project Roadmap

```
Immediate (Q1 2026):
- Ethereum same-chain privacy (M18) — EVM stealth addresses + L2 support
- Solana audit subsidy application submitted (up to $50K)
- SIP Labs Inc. incorporation for grant compliance

Q2 2026:
- Proof composition research (Halo2 + Kimchi feasibility study)
- Multi-language SDK (Rust, Python) for non-TypeScript ecosystems
- Arcium MPC backend integration for confidential DeFi
- Mobile wallet (Expo/React Native) with native key management

Q3-Q4 2026:
- SIP-EIP standard proposal — formal privacy standard for Web3
- Industry working group with privacy-focused protocols
- Cross-chain proof composition (Zcash + Mina + Noir)
- Institutional compliance toolkit (viewing key management dashboard)

Long-term vision: SIP becomes the HTTPS of Web3 — a universal privacy layer between
applications and blockchains. Chain-agnostic, settlement-agnostic. One toggle to make
any transaction private.
```

## Field 7: Telegram Handle

```
[RECTOR: Fill in your Telegram handle]
```

## Field 8: GitHub Repository Link (Optional)

```
https://github.com/sip-protocol/sip-app
```

## Field 9: Additional Links (Optional)

```
Live app: https://app.sip-protocol.org
Showcase: https://app.sip-protocol.org/showcase/graveyard-2026
SDK: https://www.npmjs.com/package/@sip-protocol/sdk
Mainnet program: https://solscan.io/account/S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at
Docs: https://docs.sip-protocol.org
Blog: https://blog.sip-protocol.org
```

---

## Pre-Submission Checklist

- [ ] Record demo video (4 min max) using script in `docs/plans/2026-02-25-graveyard-video-script.md`
- [ ] Upload to YouTube (unlisted)
- [ ] Fill Telegram handle
- [ ] Review "Detailed Project Description" — must sound human, not AI
- [ ] Verify app.sip-protocol.org loads all 11 tracks without errors
- [ ] Verify GitHub repo is public
- [ ] Submit via https://solanafoundation.typeform.com/graveyardhack
- [ ] Screenshot submission confirmation
