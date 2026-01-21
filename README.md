# SIP App

> THE world-class privacy application for Web3 — powered by SIP Protocol

**Live URL:** https://app.sip-protocol.org

## Overview

SIP App is the flagship privacy application built on the SIP Protocol SDK. Like jup.ag is to Jupiter SDK, app.sip-protocol.org is to @sip-protocol/sdk — a world-class consumer application that showcases the full capabilities of cryptographic privacy.

## Features

- **Private Payments** — Send and receive shielded payments with stealth addresses
- **Wallet** — Manage your viewing keys and stealth addresses
- **Private DEX** — Swap tokens with cryptographic privacy (coming soon)
- **Enterprise** — Compliance dashboard and audit tools (coming soon)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test:run

# Type check
pnpm typecheck

# Build for production
pnpm build
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (payments)/         # Private Payments route group
│   ├── (wallet)/           # Wallet route group
│   ├── (dex)/              # DEX route group
│   └── (enterprise)/       # Enterprise route group
├── components/
│   ├── ui/                 # Base UI components
│   ├── payments/           # Payments-specific components
│   └── shared/             # Shared components
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── lib/                    # Utilities
└── types/                  # TypeScript types
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **State:** Zustand 5
- **Testing:** Vitest + Testing Library
- **SDK:** @sip-protocol/sdk, @sip-protocol/react
- **Wallet:** @solana/wallet-adapter-react

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm typecheck` | Type check with TypeScript |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm validate` | Run all validation checks |

## Deployment

Deployed via Docker to app.sip-protocol.org (port 5004).

```bash
# Build Docker image
docker build -t sip-app .

# Run locally
docker run -p 3000:3000 sip-app
```

## Related

- [SIP Protocol](https://github.com/sip-protocol/sip-protocol) — Core SDK
- [SIP Website](https://github.com/sip-protocol/sip-website) — Marketing site
- [SIP Docs](https://github.com/sip-protocol/docs-sip) — Documentation

## License

MIT
