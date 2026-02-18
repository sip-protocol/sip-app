# Graveyard Hackathon 2026 — Video Script

> **Duration:** 3:00 (target)
> **Format:** Screen recording with voiceover
> **Tool:** Loom or OBS
> **Resolution:** 1920x1080 desktop, show app.sip-protocol.org
> **Upload:** YouTube (unlisted) + embed in all 11 track submissions
> **Recording date:** Feb 25, 2026

---

## Pre-Recording Checklist

- [ ] Open app.sip-protocol.org in Chrome (clean profile, no extensions visible)
- [ ] Enable Demo Mode on one track beforehand so you can show the flow
- [ ] Have a second tab open on `/showcase/graveyard-2026` for the showcase page
- [ ] Pre-navigate to `/gaming` and play one round of RPS to warm up the demo
- [ ] Verify DRiP channel card shows on `/channel` page
- [ ] Close all other tabs, notifications off, Do Not Disturb on
- [ ] Browser zoom at 100%, dark mode (default)
- [ ] Practice the full run once before recording

---

## Script

### INTRO — Hub Page (0:00–0:25)

**[SCREEN: app.sip-protocol.org — Hub page with track cards visible]**

> "SIP Protocol — the privacy standard for Web3."
>
> "Every category that died on Solana — governance, social, gaming, art, DeFi — died because users were exposed. Their wallets were tracked, their activity was surveilled, their identities were linked."
>
> "SIP fixes this with one privacy layer: stealth addresses for unlinkable identities, Pedersen commitments for hidden amounts, and viewing keys for compliance."
>
> "We built 11 dedicated privacy applications — one for every sponsor track — with real sponsor API integrations, real cryptography, and a playable commit-reveal game. All powered by the same production SDK deployed on mainnet."

**[ACTION: Slowly scroll down the hub page showing all cards]**

---

### CRYPTO PRIMITIVES — Quick Visual (0:25–0:40)

**[SCREEN: Click into any track (e.g., /payments/send), scroll to privacy toggle]**

> "Every track uses real cryptographic primitives — not mocks."
>
> "Stealth addresses via our SDK's EIP-5564 implementation. Real Pedersen commitments — not random hex strings. And viewing keys with XChaCha20-Poly1305 encryption for compliance."

**[ACTION: Click through the three privacy levels: Shielded → Compliant → Transparent to show the toggle. Point out the commitment hash is real.]**

---

### DEMO MODE (0:40–0:55)

**[SCREEN: Still on /payments/send, wallet not connected]**

> "Judges don't need a Phantom wallet to try this. Every track has a 'Try Demo' button."

**[ACTION: Click "Try Demo" — show the Demo Mode banner appear, form becomes active]**

> "Demo mode runs the full simulation pipeline — stealth address generation, commitment creation, the entire flow — just without a real wallet signature."

**[ACTION: Fill in an amount, select Shielded, click Send — show the step-by-step status animation (scanning → generating → confirming → confirmed)]**

---

### TRACK SPEEDRUN — 11 Tracks in 90 Seconds (0:55–2:20)

**~8 seconds per track. Show the main page, highlight the key feature, move on.**

#### 1. Private Governance — Realms (0:55–1:03)
**[SCREEN: /governance — show "Why DAOs Died / How We Revive Them" card]**
> "Private Governance with Realms. We query real SPL Governance proposals from Marinade, Jupiter, and Mango DAOs. Votes use real Pedersen commitment-based ballot encryption."

#### 2. Anonymous Social — Tapestry (1:03–1:11)
**[SCREEN: /social — show Tapestry integration badge]**
> "Anonymous Social with Tapestry — real profile lookups via the SocialFi SDK. Stealth social identities that can't be linked to your wallet."

#### 3. Privacy Loyalty — Torque (1:11–1:19)
**[SCREEN: /loyalty — show campaign list]**
> "Privacy Loyalty with Torque — real campaign data from the Torque SDK. Complete privacy campaigns, claim rewards to stealth addresses."

#### 4. Privacy Art — Exchange Art (1:19–1:27)
**[SCREEN: /art — show generative art + mint]**
> "Privacy Art with Exchange Art — generative art from stealth address entropy, using real Metaplex Bubblegum for compressed NFT minting."

#### 5. Green Migration — Sunrise (1:27–1:35)
**[SCREEN: /migrations — show wallet scanner]**
> "Green Migration with Sunrise — real wallet scanning via Solana RPC. Detects stranded tokens and migrates to green staking via stealth address."

#### 6. Privacy NFTs — DRiP (1:35–1:43)
**[SCREEN: /channel — show DRiP channel card and drop list]**
> "Privacy NFTs with DRiP — our SIP Privacy channel distributes free compressed NFTs about on-chain privacy. Encrypted content with viewing key-gated access across three tiers."

**[ACTION: Show the DRiP channel card, click "View on DRiP" button]**

#### 7. Privacy Arena — MagicBlock (1:43–1:55)
**[SCREEN: /gaming — click into Rock-Paper-Scissors game]**
> "Privacy Arena with MagicBlock — and this is playable. Watch."

**[ACTION: Select Rock, click Commit Rock, watch the commit-reveal pipeline animate, see the result with crypto details]**

> "Real Pedersen commitment for the move. Deterministic opponent from the commitment hash. Fully cryptographic game resolution."

#### 8. Privacy Ticketing — KYD Labs (1:55–2:03)
**[SCREEN: /ticketing — show cNFT ticket minting]**
> "Privacy Ticketing with KYD Labs — real compressed NFT tickets via Helius DAS. Ticket IDs are Pedersen commitments. Prove you have a ticket without revealing which one."

#### 9. Privacy Metaverse — Portals (2:03–2:09)
**[SCREEN: /metaverse — show world list and stealth avatar]**
> "Privacy Metaverse with Portals — stealth avatars with real cryptographic identity proofs. Explore worlds anonymously."

#### 10. Privacy DeSci — BIO (2:09–2:15)
**[SCREEN: /desci — show real BioDAO data]**
> "Privacy DeSci with BIO Protocol — real BioDAO projects fetched from BIO's API. Anonymous research funding via stealth addresses."

#### 11. Privacy Music — Audius (2:15–2:23)
**[SCREEN: /music — show real Audius tracks]**
> "Privacy Music with Audius — real tracks from Audius' million-song catalog. Stealth listener identity and encrypted playlists."

---

### TECH STACK & TRACTION (2:23–2:48)

**[SCREEN: /showcase/graveyard-2026 — scroll to ResurrectionSection and stats]**

> "All 11 tracks are built on the same production stack — with real sponsor API integrations."
>
> "The core SDK has over 7,500 tests. The app has 865+ tests across 93 test suites. Every track has a 'Why It Died / How We Revive It' narrative powered by real data from sponsor APIs — SPL Governance, Tapestry SocialFi, Torque campaigns, Audius tracks, Helius DAS, and more."
>
> "This isn't a hackathon prototype. SIP won the Zypherpunk Hackathon in December 2025 — $6,500 across three tracks. We have a $10K Superteam grant approved. The Anchor program is deployed on Solana mainnet."

**[ACTION: Scroll through the ResurrectionSection showing Problem → Solution → Result flow, then show integration badges per track]**

---

### CLOSING (2:48–3:00)

**[SCREEN: Hub page, zoomed out to show all cards]**

> "11 sponsor tracks. One privacy layer. Real cryptography, real APIs, a playable game."
>
> "Every dead category on Solana died because users were exposed. SIP resurrects them all."
>
> "Try it now at app.sip-protocol.org — no wallet required."

**[END]**

---

## Per-Track Submission Descriptions

Each track submission gets the same video but a tailored description. Template:

```
SIP Protocol brings privacy to [CATEGORY] using [SPONSOR]'s infrastructure.

[1-2 sentences specific to this track's privacy application]

Built with real cryptography:
- Stealth addresses for unlinkable identities
- Pedersen commitments for hidden amounts
- Viewing keys for compliance

Try it: https://app.sip-protocol.org[ROUTE]
Showcase: https://app.sip-protocol.org/showcase/graveyard-2026
Source: https://github.com/sip-protocol/sip-app

SDK: 7,500+ tests | App: 865+ tests | Mainnet program live
Previous winner: Zypherpunk Hackathon 2025 ($6,500, #9/93, 3 tracks)
```

### Track-Specific Descriptions

**1. Realms — Private Governance**
> SIP Protocol brings privacy to DAO governance using Realms. We query real SPL Governance proposals from Marinade, Jupiter, and Mango DAOs on-chain. Votes use real Pedersen commitment-based ballot encryption — no one can see how you voted until the round ends.

**2. Tapestry — Anonymous Social**
> SIP Protocol brings privacy to social interaction using Tapestry's SocialFi SDK. Real profile lookups and social graph queries. Users create stealth social identities — post, follow, and interact without linking activity to their wallet.

**3. Torque — Privacy Loyalty**
> SIP Protocol brings privacy to loyalty programs using Torque's SDK. Real campaign data integration. Users complete privacy campaigns and claim rewards to stealth addresses — participation is tracked off-chain with zero on-chain footprint.

**4. Exchange Art — Privacy Art**
> SIP Protocol brings privacy to digital art using Exchange Art / Metaplex. Real compressed NFT minting via Bubblegum on devnet. Generative art is deterministically derived from stealth address entropy.

**5. Sunrise — Green Migration**
> SIP Protocol brings privacy to dead protocol migration using Sunrise. Real wallet scanning via Solana RPC detects stranded tokens across deprecated protocols (Saber, Solend v1, Port Finance). Migrate to green staking via stealth address.

**6. DRiP — Privacy NFTs**
> SIP Protocol brings privacy to NFT distribution using DRiP. We created the SIP Privacy channel on DRiP with free compressed NFT drops about on-chain privacy. Content is encrypted with viewing key-gated access — free, subscriber, and premium tiers. Real DRiP NFT data fetched via Helius DAS API.

**7. MagicBlock — Privacy Arena**
> SIP Protocol brings privacy to on-chain gaming using MagicBlock's framework. Features a playable Rock-Paper-Scissors game with real Pedersen commit-reveal — both players commit hashed moves, then reveal simultaneously. Deterministic resolution from commitment hash. Viewing keys for fog-of-war and stealth addresses for private reward claims.

**8. KYD Labs — Privacy Ticketing**
> SIP Protocol brings privacy to event ticketing using KYD Labs. Real compressed NFT ticket minting via Helius DAS API. Ticket IDs are Pedersen commitments — prove you have a valid ticket without revealing which one.

**9. Portals — Privacy Metaverse**
> SIP Protocol brings privacy to virtual worlds using Portals. Curated world data with enhanced spatial metadata. Stealth avatars with real cryptographic identity proofs let users explore worlds anonymously.

**10. BIO — Privacy DeSci**
> SIP Protocol brings privacy to decentralized science using BIO Protocol. Real BioDAO project data fetched from BIO's API — VitaDAO, HairDAO, PsyDAO, and more. Anonymous research funding via stealth addresses.

**11. Audius — Privacy Music**
> SIP Protocol brings privacy to music streaming using Audius' public REST API. Real track search and metadata from Audius' million-song catalog. Stealth listener identities and encrypted playlists keep your music taste private.

---

## Recording Tips

1. **Pace:** Speak slightly slower than natural — viewers need time to process the visuals
2. **Mouse movement:** Smooth, deliberate cursor movements. Don't jitter.
3. **Pauses:** 1-second pause between tracks during the speedrun
4. **Energy:** Confident but not hype-y. Let the product speak.
5. **Mistakes:** If you stumble, pause and re-say the line — you can cut in post if needed, but Loom recordings are usually fine with a clean re-take
6. **Background:** The app's dark theme reads well on video. No need for custom background.
