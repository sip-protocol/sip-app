# Solana Graveyard Hackathon 2026 — Track Submissions

> **Submission-ready metadata for all 11 sponsor tracks.**
> Copy-paste into the hackathon platform per track. Fill in demo video links before submitting.

---

## Project Overview

**Project:** SIP Protocol — Privacy Resurrects Dead Categories on Solana
**Showcase:** https://app.sip-protocol.org/showcase/graveyard-2026
**Source:** https://github.com/sip-protocol/sip-app
**SDK:** https://www.npmjs.com/package/@sip-protocol/sdk (v0.7.3)
**Anchor Program:** `S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at` (mainnet-beta)

### Stats

| Metric | Value |
|--------|-------|
| Tests | 1,108+ across 110 files |
| Tracks | 11 sponsor tracks, all live |
| On-chain | Anchor program on mainnet-beta |
| Crypto | Real Pedersen commitments, stealth addresses, viewing keys |
| Prior wins | Zypherpunk Hackathon 2025 Winner ($6,500, #9/93, 3 tracks) |
| Grant | $10K Superteam Indonesia (approved Jan 2026) |

### Key Message

One privacy layer resurrects 11 dead categories. Same three primitives — stealth addresses, Pedersen commitments, and viewing keys — applied to governance, social, art, gaming, music, science, ticketing, loyalty, metaverse, sustainability, and NFTs. Every category died because users were exposed. SIP brings them back with real cryptography, not mixing pools.

---

## 1. Private Governance — Realms Track

**Project:** SIP Protocol — Privacy for On-Chain Governance

**One-liner:** Commit-reveal voting with Pedersen commitments so whales can never front-run your ballot.

**Description (250 words max):**

On-chain governance died on Solana because every vote was public the instant it was cast. Whales watched pending votes, adjusted positions, and intimidated smaller holders into silence. DAOs bled participation — who votes honestly when everyone is watching?

SIP Protocol resurrects private governance by integrating Realms' SPL Governance program with cryptographic commit-reveal voting. When a user casts a vote, SIP generates a Pedersen commitment that hides the vote choice behind a blinding factor. The commitment is stored on-chain, proving the vote exists without revealing its content. Only after the voting period closes does the reveal phase allow verification — the preimage is published, and anyone can confirm the commitment matches. No one sees how you voted until it no longer matters.

For compliance-sensitive DAOs, viewing keys enable authorized auditors to verify vote integrity without exposing individual choices to the public. This is compliant privacy — not anonymity for its own sake, but protection that satisfies both voters and regulators.

**Key Features:**
- Commit-reveal ballots using Pedersen commitments via `@sip-protocol/sdk` — vote choice hidden until reveal phase
- Real SPL Governance queries via `@solana/spl-governance` — live proposals from Realms DAOs
- Three privacy levels: transparent, shielded, and compliant with viewing key disclosure
- On-chain commitment storage with Solscan-verifiable transaction signatures

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, @solana/spl-governance, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/governance
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 2. Anonymous Social — Tapestry Track

**Project:** SIP Protocol — Privacy for Social Identity

**One-liner:** Stealth social profiles where your wallet address is never your identity.

**Description (250 words max):**

Social on Solana died because your wallet was your identity. Every post, follow, and interaction was permanently linked to an address that held your tokens, your NFTs, your entire financial life. Doxxing was trivial — one on-chain lookup and a stranger knew everything about you. People stopped posting.

SIP Protocol resurrects anonymous social by pairing Tapestry's socialfi protocol with stealth address identities. When a user creates a profile, SIP generates a one-time stealth address using elliptic curve Diffie-Hellman. This address becomes the social identity — unlinkable to the original wallet. Posts are committed with Pedersen hashes, proving authorship without revealing the author's real address. The social graph exists, but the nodes are pseudonymous.

Viewing keys allow selective disclosure. A user can prove they authored a post to a specific party — a platform moderator, a collaborator — without revealing their identity to the entire network. This is reputation without surveillance: you build social capital on a stealth identity, and you choose who gets to see behind the mask.

**Key Features:**
- Stealth social profiles via SDK `generateStealthAddress()` — wallet address never exposed
- Real Tapestry socialfi SDK integration for profile creation and social graph queries
- Post commitment hashing with Pedersen — proves authorship without identity linkage
- Selective identity disclosure through viewing keys for moderation and trust

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, Tapestry socialfi SDK, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/social
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 3. Private Loyalty — Torque Track

**Project:** SIP Protocol — Privacy for Loyalty Rewards

**One-liner:** Anonymous reward claims with stealth addresses so loyalty programs stop being surveillance programs.

**Description (250 words max):**

Loyalty programs on Solana died because transparent rewards turned every user into a data point. Brands tracked claim patterns, competitors scraped reward activity, and users realized that earning points meant giving up all privacy about their purchasing behavior. The value exchange was broken — rewards were not worth the exposure.

SIP Protocol resurrects private loyalty by wrapping Torque's campaign infrastructure with stealth address claims. When a user claims a reward, the payout goes to a one-time stealth address generated from the user's meta-address. The brand knows a reward was claimed (the campaign metrics stay accurate), but cannot link the claim to a specific wallet's transaction history. Pedersen commitments hide reward amounts — the program proves the correct value was distributed without revealing it publicly.

For brands that need aggregate analytics without individual tracking, compliant mode with viewing keys provides exactly that. An authorized analytics service can see claim volumes and reward distributions, but individual user behavior stays private. This is the loyalty model users actually want: real rewards, zero surveillance.

**Key Features:**
- Stealth reward claims via SDK stealth address generation — claim activity unlinkable to wallet
- Torque campaign SDK integration for real campaign data and reward distribution
- Pedersen commitment-hidden reward amounts — correct distribution proven, not exposed
- Compliant mode with viewing keys for brand analytics without individual tracking

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, @torque-labs/torque-ts-sdk, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/loyalty
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 4. Stealth Art — Exchange Art Track

**Project:** SIP Protocol — Privacy for NFT Art

**One-liner:** Stealth-minted compressed NFTs where collectors own art without doxxing their wallets.

**Description (250 words max):**

NFT art on Solana died because minting was public theater. Every collector's wallet was exposed the moment they minted — speculators tracked whale wallets, copied their moves, and front-ran drops. Artists lost control of their audience, and collectors lost the ability to collect privately. The gallery became a fishbowl.

SIP Protocol resurrects private art by integrating Metaplex Bubblegum compressed NFTs with stealth address minting. When a collector mints, the cNFT is sent to a stealth address derived from their meta-address — a one-time address that cannot be linked back to their main wallet. The minting transaction is real and verifiable on Solana, but the ownership chain is broken at the privacy layer. Pedersen commitments record the mint event, and viewing keys allow the artist to verify collector authenticity for allowlists or editions without exposing the collector's identity publicly.

This is not just theoretical privacy — it is compressed NFT infrastructure (Bubblegum) combined with real elliptic curve cryptography (stealth addresses via secp256k1). The art exists on-chain, the ownership is hidden, and the math is verifiable.

**Key Features:**
- Stealth cNFT minting via Metaplex Bubblegum — collector wallet never linked to mint
- Real Helius DAS integration for NFT metadata and collection queries
- Pedersen commitment proofs for mint events — verifiable without revealing collector
- Viewing key disclosure for artist-to-collector verification on allowlists

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, @metaplex-foundation/mpl-bubblegum, Helius DAS, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/art
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 5. Green Migration — Sunrise Track

**Project:** SIP Protocol — Privacy for Sustainable Staking

**One-liner:** Private green staking with Pedersen-committed stake amounts so climate action does not mean financial exposure.

**Description (250 words max):**

Sustainable staking on Solana died because every green commitment was public. Users who staked with climate-positive validators exposed their entire balance, inviting scrutiny from competitors and bad actors. Protocol migrations — moving tokens from one validator to another — were front-run because the consolidation was visible on-chain before it settled. Green action required financial transparency that most users were not willing to accept.

SIP Protocol resurrects private sustainability by integrating Solana's native staking infrastructure with privacy primitives. When a user stakes with a green validator, the stake amount is hidden behind a Pedersen commitment — the network can verify that a valid stake was placed, but the amount stays private. Migration paths between validators use stealth addresses for each intermediate hop, preventing consolidation front-running. A gSOL scanner identifies existing green positions without exposing balances publicly.

For sustainability reporting and carbon credit verification, compliant mode with viewing keys allows auditors to confirm green staking participation without revealing individual stake sizes. This enables institutional ESG compliance while preserving user privacy — the proof that you staked green without the proof of how much.

**Key Features:**
- Pedersen-committed stake amounts — stake verified without balance exposure
- Stealth address migration paths — each validator hop uses a fresh unlinkable address
- Real Solana RPC integration for validator data and gSOL balance scanning
- Viewing key disclosure for ESG auditors and sustainability reporting

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, @solana/web3.js, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/migrations
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 6. Encrypted Drops — DRiP Track

**Project:** SIP Protocol — Privacy for NFT Distribution

**One-liner:** Encrypted drops delivered to stealth addresses so subscriber lists stay invisible.

**Description (250 words max):**

NFT drops on Solana died because subscriber lists became public honeypots. Every address that subscribed to a channel was visible, turning engaged communities into spam targets. Creators lost subscribers to phishing, and users learned that engaging with drops meant painting a target on their wallet.

SIP Protocol resurrects private distribution by combining Helius DAS (Digital Asset Standard) with stealth address delivery and viewing key encryption. When a user subscribes to a channel, their delivery address is a one-time stealth address — the creator can send drops to it, but no one can link the subscription back to the subscriber's main wallet. The drop content itself is encrypted with XChaCha20-Poly1305, viewable only by holders of the correct viewing key. The subscriber list is invisible, the content is encrypted, and the delivery is unlinkable.

For creators who need to verify subscriber counts for sponsorship or analytics, viewing keys provide aggregate visibility without individual deanonymization. A sponsor can confirm a channel has 10,000 subscribers without learning who any of them are. This is distribution privacy that serves both creators and collectors.

**Key Features:**
- Stealth address drop delivery — subscriber wallets never exposed in channel lists
- XChaCha20-Poly1305 content encryption via viewing keys — drops readable only by intended recipients
- Real Helius DAS integration for live channel data and compressed NFT queries
- Aggregate verification via viewing keys for creator analytics and sponsor validation

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, Helius DAS API, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/channel
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 7. Privacy Arena — MagicBlock Track

**Project:** SIP Protocol — Privacy for On-Chain Gaming

**One-liner:** Commit-reveal Rock Paper Scissors where your move is a Pedersen commitment — no opponent can cheat.

**Description (250 words max):**

Gaming on Solana died because game state was public. In any competitive on-chain game, opponents could read your pending transactions and react before you finished your move. Rock Paper Scissors was literally impossible — your choice was visible before the reveal. Every game with hidden information was broken by blockchain transparency.

SIP Protocol resurrects private gaming by building a commit-reveal protocol on MagicBlock's BOLT framework with Pedersen commitments. When a player chooses a move, the choice is hashed with a random salt and committed as a Pedersen commitment on-chain. The opponent commits their move the same way. Neither player can see the other's choice. After both commitments land, the reveal phase begins — each player publishes their preimage, and the smart contract verifies both commitments match. The winner is determined fairly, and the cryptographic proof is permanent.

This is not just a game — it is a demonstration of commit-reveal as a reusable privacy primitive. Any game with hidden information (poker hands, fog of war, sealed-bid auctions) can use the same Pedersen commitment scheme. MagicBlock BOLT provides the on-chain game framework, and SIP provides the cryptographic hiding.

**Key Features:**
- Pedersen commitment-based commit-reveal — move choice cryptographically hidden until reveal
- Playable Rock Paper Scissors with animated UI, countdown reveal, and score tracking
- MagicBlock BOLT SDK integration for on-chain game state management
- Verifiable fairness — both commitment and reveal transactions visible on Solscan

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, @magicblock-labs/bolt-sdk, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/gaming
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 8. Stealth Tickets — KYD Labs Track

**Project:** SIP Protocol — Privacy for Event Ticketing

**One-liner:** Anti-scalp compressed NFT tickets minted to stealth addresses so ownership stays hidden until the door.

**Description (250 words max):**

Ticketing on Solana died because visible ticket ownership enabled industrial scalping. Bots watched minting transactions, identified popular events, and bought up tickets the moment they appeared. Secondary markets thrived because ownership was public — scalpers could prove they held tickets and set arbitrary markups. Fans paid more, artists earned less, and the entire experience was worse for everyone.

SIP Protocol resurrects private ticketing by minting compressed NFT tickets via Metaplex Bubblegum to stealth addresses. When a fan purchases a ticket, the cNFT is minted to a one-time stealth address derived from their meta-address. The ticket exists on-chain, but the owner's wallet is invisible. Scalpers cannot target holders because they cannot identify them. At the venue, the fan proves ownership by deriving the stealth address private key — a zero-knowledge proof of possession without revealing their main wallet.

For event organizers who need to verify ticket authenticity and prevent counterfeits, viewing keys allow selective verification. The organizer can confirm a ticket is genuine without learning anything about the holder's other on-chain activity. This is anti-scalping by design — not by policy, but by cryptography.

**Key Features:**
- Stealth cNFT ticket minting via Bubblegum — ticket ownership invisible to scalpers
- Anti-scalp by cryptographic design — holders cannot be identified or targeted
- Viewing key verification for organizers — ticket authenticity without holder deanonymization
- Real event data integration with compressed NFT infrastructure on Solana

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, @metaplex-foundation/mpl-bubblegum, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/ticketing
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 9. Stealth Metaverse — Portals Track

**Project:** SIP Protocol — Privacy for Metaverse Identity

**One-liner:** Stealth avatars with unlinkable identities so your metaverse presence never doxxes your wallet.

**Description (250 words max):**

Metaverse on Solana died because wallet-linked avatars killed anonymity. Every virtual world required a wallet connection, and that wallet was your identity — visible to every other player in the room. Your NFT collection, your token balances, your entire financial profile was one lookup away from anyone standing next to your avatar. People stopped showing up.

SIP Protocol resurrects metaverse privacy by generating stealth avatar identities for Portals virtual worlds. When a user enters a world, SIP creates a stealth address that serves as their in-world identity. The avatar exists and interacts normally, but the underlying wallet is cryptographically unlinkable. Teleporting between worlds generates a fresh stealth address each time — no movement tracking across spaces. Pedersen commitments anchor each session, and viewing keys allow selective identity revelation to trusted parties (friends, world owners).

This transforms the metaverse from a surveillance space into a privacy-respecting environment. You can attend events, explore worlds, and interact with others without your financial identity following you. World owners can verify that visitors are unique humans (via commitment proofs) without knowing who they are.

**Key Features:**
- Stealth avatar identities via SDK stealth address generation — wallet never linked to presence
- Fresh stealth address per world teleport — no cross-world movement tracking
- Portals iframe integration for real virtual world embedding and room data
- Viewing key revelation for trusted identity disclosure to friends and world owners

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, Portals iframe API, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/metaverse
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 10. Anonymous DeSci — BIO Protocol Track

**Project:** SIP Protocol — Privacy for Research Funding

**One-liner:** Anonymous research funding with stealth transfers and viewing keys so science is judged by merit, not money.

**Description (250 words max):**

Decentralized science funding died because public donations biased peer review. When a prominent wallet funded a research project, the entire community knew — and that knowledge corrupted the evaluation process. Reviewers favored well-funded projects, critics were silenced by social pressure from visible backers, and researchers tailored proposals to attract whale wallets rather than pursuing the best science. Funding transparency killed funding objectivity.

SIP Protocol resurrects anonymous research funding by routing contributions through stealth transfers to BioDAO project addresses. When a funder supports a research project, the SOL transfer goes to a stealth address derived from the project's meta-address. The researcher receives the funds, but cannot see who sent them. The funding amount is hidden behind a Pedersen commitment — the project can prove it received sufficient funding without revealing the exact amount or the source.

For regulatory compliance (a real concern in DeSci, where funding sources may need disclosure to institutions), viewing keys provide selective audit capability. A regulator or institutional review board can verify funding sources and amounts without that information being public. This is the compliance layer that makes anonymous DeSci viable for serious research — privacy by default, disclosure by choice.

**Key Features:**
- Stealth transfer funding via SDK — funder identity cryptographically hidden from researchers
- Pedersen-committed funding amounts — sufficiency proven without exact values exposed
- Real BioDAO project data integration via bio.xyz API references
- Viewing key audit trail for regulatory compliance and institutional review boards

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, bio.xyz API, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/desci
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## 11. Stealth Music — Audius Track

**Project:** SIP Protocol — Privacy for Music Streaming

**One-liner:** Stealth listener identities with anonymous streaming so your music taste is yours alone.

**Description (250 words max):**

Music streaming on Solana died because listening data was public by default. Every stream, every favorite, every playlist was linked to a wallet address — and that data was monetized without consent. Listeners had no control over who saw their music habits, and artists had no way to receive anonymous tips from fans who wanted to support without being tracked. The open ledger turned every listener into a product.

SIP Protocol resurrects private music by wrapping Audius' Discovery Provider API with stealth listener identities. When a user streams a track, their listening session is attributed to a stealth address — a one-time identity that cannot be linked to their wallet. The stream counts for the artist's metrics (Audius sees a valid listener), but the listener's real identity is hidden. Stealth addresses also enable anonymous tipping — a fan can send SOL to an artist's stealth address, and the artist receives the funds without knowing which wallet sent them.

For rights management and royalty distribution, viewing keys allow authorized parties (labels, distributors) to verify streaming data for specific listening sessions without accessing the full history. This is the music privacy model that respects both listeners and the industry — anonymous by default, auditable by permission.

**Key Features:**
- Stealth listener identity via SDK stealth address generation — streaming activity unlinkable to wallet
- Real Audius Discovery Provider API integration for live track search and metadata
- Anonymous artist tipping through stealth SOL transfers — fans support without exposure
- Viewing key disclosure for rights management and authorized royalty auditing

**Tech Stack:** Next.js 16, React 19, @sip-protocol/sdk v0.7.3, @audius/sdk, Anchor (mainnet), Vitest

**Links:**
- App: https://app.sip-protocol.org/music
- Source: https://github.com/sip-protocol/sip-app
- Demo: [RECTOR to fill]
- SDK: https://www.npmjs.com/package/@sip-protocol/sdk

---

## Submission Checklist

- [ ] Fill in demo video links for all 11 tracks
- [ ] Deploy latest build to app.sip-protocol.org
- [ ] Verify all track pages load without errors
- [ ] Confirm showcase page stats are current
- [ ] Submit each track on the hackathon platform
- [ ] Double-check tech stack mentions match actual dependencies
