# Graveyard Hackathon 2026 — Video Script

> **Duration:** 3:00 (target)
> **Format:** Screen recording with voiceover
> **Tool:** Loom or OBS
> **Resolution:** 1920x1080 desktop, show app.sip-protocol.org
> **Upload:** YouTube (unlisted) + embed in all 12 track submissions
> **Recording date:** Feb 25, 2026

---

## Pre-Recording Checklist

- [ ] Open app.sip-protocol.org in Chrome (clean profile, no extensions visible)
- [ ] Enable Demo Mode on one track beforehand so you can show the flow
- [ ] Have a second tab open on `/showcase/graveyard-2026` for the showcase page
- [ ] Close all other tabs, notifications off, Do Not Disturb on
- [ ] Browser zoom at 100%, dark mode (default)
- [ ] Practice the full run once before recording

---

## Script

### INTRO — Hub Page (0:00–0:25)

**[SCREEN: app.sip-protocol.org — Hub page with all 12 track cards visible]**

> "SIP Protocol — the privacy standard for Web3."
>
> "We believe every category that died on Solana — bridges, governance, social, gaming, DeFi — died because users were exposed. Their wallets were tracked, their activity was surveilled, their identities were linked."
>
> "SIP fixes this with one privacy layer: stealth addresses for unlinkable identities, Pedersen commitments for hidden amounts, and viewing keys for compliance."
>
> "We built 12 dedicated privacy applications — one for every sponsor track — all powered by the same production SDK deployed on mainnet."

**[ACTION: Slowly scroll down the hub page showing all 12 cards]**

---

### CRYPTO PRIMITIVES — Quick Visual (0:25–0:40)

**[SCREEN: Click into any track (e.g., /payments/send), scroll to privacy toggle]**

> "Every track uses the same three cryptographic primitives."
>
> "Stealth addresses — one-time recipient addresses that prevent linkability. Pedersen commitments — hiding amounts while keeping them mathematically verifiable. And viewing keys — selective disclosure so auditors can verify without exposing data to the public."

**[ACTION: Click through the three privacy levels: Shielded → Compliant → Transparent to show the toggle]**

---

### DEMO MODE (0:40–0:55)

**[SCREEN: Still on /payments/send, wallet not connected]**

> "Judges don't need a Phantom wallet to try this. Every track has a 'Try Demo' button."

**[ACTION: Click "Try Demo" — show the Demo Mode banner appear, form becomes active]**

> "Demo mode runs the full simulation pipeline — stealth address generation, commitment creation, the entire flow — just without a real wallet signature."

**[ACTION: Fill in an amount, select Shielded, click Send — show the step-by-step status animation (scanning → generating → confirming → confirmed)]**

---

### TRACK SPEEDRUN — 12 Tracks in 90 Seconds (0:55–2:25)

**~7-8 seconds per track. Show the main page, highlight the key feature, move on.**

#### 1. Private Bridge — Wormhole (0:55–1:03)
**[SCREEN: /bridge]**
> "Private Bridge with Wormhole — stealth cross-chain transfers. Select source chain, destination chain, amount hidden via Pedersen commitment."

#### 2. Private Governance — Realms (1:03–1:10)
**[SCREEN: /governance]**
> "Private Governance with Realms — commit-reveal voting. Your vote is cryptographically committed before reveal. No one knows how you voted until the round ends."

#### 3. Anonymous Social — Tapestry (1:10–1:17)
**[SCREEN: /social]**
> "Anonymous Social with Tapestry — stealth social identities. Post, follow, and interact without linking your wallet to your profile."

#### 4. Privacy Loyalty — Torque (1:17–1:24)
**[SCREEN: /loyalty]**
> "Privacy Loyalty with Torque — anonymous reward claims. Complete campaigns, earn rewards, claim to stealth addresses."

#### 5. Privacy Art — Metaplex (1:24–1:31)
**[SCREEN: /art]**
> "Privacy Art with Metaplex — generative art from stealth address entropy. Each privacy transaction creates unique visual art. Mint as compressed NFTs."

#### 6. Green Migration — Sunrise Stake (1:31–1:38)
**[SCREEN: /migrations]**
> "Green Migration with Sunrise Stake — leave dead protocols privately. Migrate stranded SOL to green staking via stealth address."

#### 7. Privacy Channel — DRiP (1:38–1:45)
**[SCREEN: /channel]**
> "Privacy Channel with DRiP — encrypted content drops. Viewing key-gated access tiers — free, subscriber, premium."

#### 8. Privacy Arena — MagicBlock (1:45–1:52)
**[SCREEN: /gaming]**
> "Privacy Arena with MagicBlock — commit-reveal gameplay. Hidden moves, sealed bids, fog of war — all cryptographically enforced."

#### 9. Privacy Ticketing — KYD Labs (1:52–1:59)
**[SCREEN: /ticketing]**
> "Privacy Ticketing with KYD Labs — stealth tickets prevent scalping and attendance tracking. Prove you have a ticket without revealing which one."

#### 10. Privacy Metaverse — Portals (1:59–2:06)
**[SCREEN: /metaverse]**
> "Privacy Metaverse with Portals — stealth avatars. Explore worlds anonymously, teleport between destinations with private identity proofs."

#### 11. Privacy DeSci — BIO Protocol (2:06–2:13)
**[SCREEN: /desci]**
> "Privacy DeSci with BIO Protocol — anonymous research funding and peer review. Fund controversial science without retaliation risk."

#### 12. Privacy Music — Audius (2:13–2:20)
**[SCREEN: /music]**
> "Privacy Music with Audius — stealth listener identity. Stream privately, create encrypted playlists, pay royalties via stealth transfer."

---

### TECH STACK & TRACTION (2:20–2:45)

**[SCREEN: /showcase/graveyard-2026 — scroll to stats and links section]**

> "All 12 tracks are built on the same production stack."
>
> "The core SDK — @sip-protocol/sdk version 0.7.3 — has over 7,500 tests. The app has 820+ tests across 90 test suites. The Anchor program is deployed on Solana mainnet."
>
> "This isn't a hackathon prototype. SIP won the Zypherpunk Hackathon in December 2025 — $6,500 across three tracks, ranked number 9 out of 93 teams. We have a $10K Superteam grant approved. The SDK is published on npm. The program is on mainnet."

**[ACTION: Show the GitHub repo link, npm link, mainnet program link on showcase page]**

---

### CLOSING (2:45–3:00)

**[SCREEN: Hub page, zoomed out to show all 12 cards]**

> "12 sponsor tracks. One privacy layer. Real cryptography — not mocks."
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

SDK: 7,500+ tests | App: 820+ tests | Mainnet program live
Previous winner: Zypherpunk Hackathon 2025 ($6,500, #9/93, 3 tracks)
```

### Track-Specific Descriptions

**1. Wormhole — Private Bridge**
> SIP Protocol brings privacy to cross-chain bridging using Wormhole's infrastructure. Users bridge assets between chains with stealth addresses — the destination wallet is a one-time address, preventing cross-chain tracking and wallet correlation.

**2. Realms — Private Governance**
> SIP Protocol brings privacy to DAO governance using Realms. Votes are cryptographically committed before reveal using Pedersen commitments — no one can see how you voted until the round ends, preventing vote manipulation and social pressure.

**3. Tapestry — Anonymous Social**
> SIP Protocol brings privacy to social interaction using Tapestry's protocol. Users create stealth social identities — post, follow, and interact without linking activity to their wallet. Social graphs remain private.

**4. Torque — Privacy Loyalty**
> SIP Protocol brings privacy to loyalty programs using Torque's campaign infrastructure. Users complete privacy campaigns and claim rewards to stealth addresses — participation is tracked off-chain with zero on-chain footprint.

**5. Metaplex — Privacy Art**
> SIP Protocol brings privacy to digital art using Metaplex. Generative art is deterministically derived from stealth address entropy — each privacy transaction creates unique visual art. Mint as compressed NFTs for ~$0.001 each.

**6. Sunrise Stake — Green Migration**
> SIP Protocol brings privacy to dead protocol migration using Sunrise Stake. Users migrate stranded SOL from deprecated protocols (Saber, Solend v1, Port Finance) to green staking via stealth address — the destination deposit is unlinkable to the source wallet.

**7. DRiP — Privacy Channel**
> SIP Protocol brings privacy to content distribution using DRiP's protocol. Privacy education content is encrypted with viewing key-gated access — free, subscriber, and premium tiers. Drops are distributed as compressed NFTs.

**8. MagicBlock — Privacy Arena**
> SIP Protocol brings privacy to on-chain gaming using MagicBlock's engine. Games use cryptographic commitments for hidden moves, viewing keys for fog-of-war, and stealth addresses for private reward claims. Commit-reveal, sealed bids, and tournaments.

**9. KYD Labs — Privacy Ticketing**
> SIP Protocol brings privacy to event ticketing using KYD Labs' platform. Ticket IDs are Pedersen commitments — prove you have a valid ticket without revealing which one. Stealth addresses prevent scalper bots and attendance tracking.

**10. Portals — Privacy Metaverse**
> SIP Protocol brings privacy to virtual worlds using Portals' platform. Stealth avatars let users explore worlds anonymously. Teleportation uses private identity proofs — your origin and destination remain unlinkable.

**11. BIO Protocol — Privacy DeSci**
> SIP Protocol brings privacy to decentralized science using BIO Protocol. Anonymous research funding via stealth addresses lets scientists fund controversial research without retaliation risk. Peer review uses anonymous identity proofs.

**12. Audius — Privacy Music**
> SIP Protocol brings privacy to music streaming using Audius' decentralized platform. Stealth listener identities prevent listening habit surveillance. Encrypted playlists and stealth royalty transfers keep your music taste private.

---

## Recording Tips

1. **Pace:** Speak slightly slower than natural — viewers need time to process the visuals
2. **Mouse movement:** Smooth, deliberate cursor movements. Don't jitter.
3. **Pauses:** 1-second pause between tracks during the speedrun
4. **Energy:** Confident but not hype-y. Let the product speak.
5. **Mistakes:** If you stumble, pause and re-say the line — you can cut in post if needed, but Loom recordings are usually fine with a clean re-take
6. **Background:** The app's dark theme reads well on video. No need for custom background.
