<div align="center">

<pre>
███████╗ ██╗ ██████╗      █████╗ ██████╗ ██████╗
██╔════╝ ██║ ██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗
███████╗ ██║ ██████╔╝    ███████║██████╔╝██████╔╝
╚════██║ ██║ ██╔═══╝     ██╔══██║██╔═══╝ ██╔═══╝
███████║ ██║ ██║         ██║  ██║██║     ██║
╚══════╝ ╚═╝ ╚═╝         ╚═╝  ╚═╝╚═╝     ╚═╝
</pre>

# SIP App

> **Privacy is not a feature. It's a right.**

**The Privacy Command Center for Web3 — enterprise-grade compliance, analytics & power user workflows**

*Private payments • Wallet surveillance analyzer • Viewing key disclosure • Compliance dashboards*

[![CI](https://github.com/sip-protocol/sip-app/actions/workflows/ci.yml/badge.svg)](https://github.com/sip-protocol/sip-app/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Live:** [app.sip-protocol.org](https://app.sip-protocol.org) | **Companion:** [SIP Privacy Mobile](https://github.com/sip-protocol/sip-mobile)

**🏆 Winner — [Zypherpunk Hackathon](https://zypherpunk.xyz) ($6,500) | 🥇 1st Place — [Solana Graveyard Hackathon](https://solana.com/graveyard-hack) (Torque)**

</div>

---

## Table of Contents

- [What is SIP App?](#-what-is-sip-app)
- [Product Family](#-product-family)
- [Features](#-features)
- [Live Demo](#-live-demo)
- [Quick Start](#-quick-start)
- [Architecture](#%EF%B8%8F-architecture)
- [App Routes](#-app-routes)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Development](#-development)
- [Deployment](#-deployment)
- [Design Philosophy](#-design-philosophy)
- [Related Projects](#-related-projects)
- [License](#-license)

---

## 🛡️ What is SIP App?

SIP App is the **flagship privacy application** built on the SIP Protocol SDK. Like jup.ag is to Jupiter SDK, app.sip-protocol.org is to @sip-protocol/sdk — a world-class consumer application that showcases the full capabilities of cryptographic privacy.

```
SDK developers   → See SIP App → "I want this for my users" → Integrate SDK
Enterprise users → Use SIP App → Compliance dashboards, audit trails, power tools
```

**The app is the pitch. Quality sells the SDK.**

---

## 👨‍👩‍👧‍👦 Product Family

SIP has two companion products — same privacy, platform-optimized:

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│  app.sip-protocol.org           │   │  SIP Privacy (Mobile)           │
│  ─────────────────────────────  │   │  ─────────────────────────────  │
│  "Privacy Command Center"       │   │  "Privacy in Your Pocket"       │
│                                 │   │                                 │
│  • Power users / Enterprise     │   │  • Consumers                    │
│  • D3 visualizations            │   │  • Quick payments / swaps       │
│  • Compliance dashboards        │   │  • Native key management        │
│  • Audit trails / Reports       │   │  • Biometric security           │
│  • Multi-monitor workflows      │   │  • On-the-go privacy            │
│                                 │   │                                 │
│  ← YOU ARE HERE                 │   │  → sip-mobile repo              │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

**NOT 1:1 clones** — each optimized for its platform's strengths.

---

## ✨ Features

### 🔐 Private Payments
Send and receive shielded payments with stealth addresses. Full privacy with one toggle.

| Feature | Description | Status |
|---------|-------------|--------|
| **Send** | Send SOL/tokens to stealth addresses | ✅ Live |
| **Receive** | Generate one-time stealth addresses | ✅ Live |
| **Scan** | Detect incoming payments to your keys | ✅ Live |
| **History** | View transaction history | ✅ Live |
| **Disclose** | Share viewing keys for compliance | ✅ Live |

### 📊 Privacy Score
Analyze any wallet's surveillance exposure with D3 visualizations.

- Heuristic analysis of on-chain activity
- Exchange interaction detection
- Address clustering risk assessment
- Privacy improvement recommendations

### 🔑 Viewing Key Disclosure
Selective disclosure for compliance without exposing spending keys.

- Export viewing keys for specific time ranges
- Track who you've shared with
- Revoke access anytime
- Audit-ready transaction proofs

### 🏢 Enterprise (Coming Soon)
Compliance dashboards and audit tools for institutions.

- Batch transaction processing
- Audit report generation
- Multi-signature workflows
- Regulatory compliance tools

---

## 🎥 Live Demo

**Try it now:** [app.sip-protocol.org](https://app.sip-protocol.org)

### Screenshots

| Hub Dashboard | Private Payments | Privacy Score |
|---------------|------------------|---------------|
| App overview with feature cards | Send/receive shielded payments | Wallet surveillance analyzer |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/sip-protocol/sip-app.git
cd sip-app

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_HELIUS_API_KEY=your-key  # For DAS API
```

---

## 🏗️ Architecture

### Project Structure

```
sip-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (nav/footer)
│   │   ├── page.tsx              # Hub dashboard
│   │   │
│   │   ├── (payments)/           # Route group: Private Payments
│   │   │   └── payments/
│   │   │       ├── page.tsx      # Payments dashboard
│   │   │       ├── send/         # Send shielded payment
│   │   │       ├── receive/      # Generate stealth address
│   │   │       ├── scan/         # Scan for incoming
│   │   │       ├── history/      # Transaction history
│   │   │       └── disclose/     # Viewing key disclosure
│   │   │
│   │   ├── (wallet)/             # Route group: Wallet
│   │   │   └── wallet/
│   │   │       ├── page.tsx      # Wallet overview
│   │   │       └── keys/         # Viewing key management
│   │   │
│   │   ├── (dex)/                # Route group: DEX
│   │   │   └── dex/
│   │   │       ├── page.tsx      # Private swap interface
│   │   │       └── jupiter/      # Jupiter integration
│   │   │
│   │   ├── (enterprise)/         # Route group: Enterprise
│   │   │   └── enterprise/
│   │   │       ├── page.tsx      # Dashboard
│   │   │       └── compliance/   # Compliance tools
│   │   │
│   │   ├── privacy-score/        # Wallet analyzer
│   │   └── showcase/             # Hackathon showcases
│   │
│   ├── components/
│   │   ├── ui/                   # Base components (Button, Card, Input)
│   │   ├── payments/             # Payment-specific components
│   │   ├── wallet/               # Wallet components
│   │   └── shared/               # Shared components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-send-payment.ts
│   │   ├── use-scan-payments.ts
│   │   └── use-stealth-address.ts
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── wallet.ts
│   │   ├── privacy.ts
│   │   └── payments.ts
│   │
│   ├── lib/                      # Utilities
│   │   ├── sip-client.ts         # SIP SDK integration
│   │   ├── solana.ts             # Solana connection
│   │   └── privacy/              # Privacy backends
│   │
│   └── types/                    # TypeScript types
│
├── public/                       # Static assets
├── tests/                        # Test suites
└── docker-compose.yml            # Production deployment
```

### Data Flow

```
User Action → React Component → Custom Hook → SIP SDK → Solana
                                    │
                                    ▼
                            Privacy Layer
                    ┌──────────────────────────┐
                    │ • Generate stealth addr  │
                    │ • Create commitment      │
                    │ • Sign transaction       │
                    └──────────────────────────┘
                                    │
                                    ▼
                            On-Chain Execution
```

---

## 📍 App Routes

### Live Routes (8)

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Hub dashboard with app cards | ✅ Live |
| `/payments` | Private Payments dashboard | ✅ Live |
| `/payments/send` | Send shielded payment | ✅ Live |
| `/payments/receive` | Generate stealth address | ✅ Live |
| `/payments/scan` | Scan for incoming payments | ✅ Live |
| `/payments/history` | Transaction history | ✅ Live |
| `/payments/disclose` | Viewing key disclosure | ✅ Live |
| `/privacy-score` | Wallet surveillance analyzer | ✅ Live |

### Scaffolded Routes (6)

| Route | Purpose | Status |
|-------|---------|--------|
| `/wallet` | Wallet interface | 🔲 Scaffolded |
| `/wallet/keys` | Viewing key management | 🔲 Scaffolded |
| `/dex` | Private DEX | 🔲 Scaffolded |
| `/dex/jupiter` | Jupiter integration | 🔲 Scaffolded |
| `/enterprise` | Enterprise dashboard | 🔲 Scaffolded |
| `/enterprise/compliance` | Compliance tools | 🔲 Scaffolded |

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React |
| **UI** | React 19 | Component library |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **State** | Zustand 5 | Client state management |
| **Animations** | Framer Motion | Micro-interactions |
| **Visualization** | D3.js | Privacy Score charts |
| **Testing** | Vitest + Playwright | Unit + E2E tests |
| **Privacy SDK** | @sip-protocol/sdk | Core privacy primitives |
| **React Hooks** | @sip-protocol/react | useSIP, useStealthAddress |
| **Wallet** | @solana/wallet-adapter | Phantom, Solflare, etc. |

---

## 💻 Development

### Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm typecheck        # Type check with TypeScript
pnpm lint             # Lint with ESLint
pnpm format           # Format with Prettier
pnpm validate         # Run all checks
```

### Testing

```bash
# Unit tests
pnpm test:run

# E2E tests
pnpm test:e2e

# With UI
pnpm test:e2e:ui

# Coverage
pnpm test:coverage
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `SendShieldedForm` | Form for sending private payments |
| `StealthAddressGenerator` | Generate + display stealth meta-address |
| `PaymentScanner` | Scan blockchain for incoming payments |
| `ClaimPayment` | Claim received stealth payments |
| `ViewingKeyDisclosure` | Reveal transaction to auditor |
| `PrivacyToggle` | Privacy level selector |
| `WalletConnect` | Solana wallet connection |

---

## 🚀 Deployment

### Docker (Production)

```bash
# Build Docker image
docker build -t sip-app .

# Run locally
docker run -p 3000:3000 sip-app
```

### VPS Configuration

```yaml
# docker-compose.yml
name: sip-app

services:
  app-blue:
    image: ghcr.io/sip-protocol/sip-app:latest
    container_name: sip-app-blue
    ports:
      - "5004:3000"
    restart: unless-stopped

  app-green:
    image: ghcr.io/sip-protocol/sip-app:green
    container_name: sip-app-green
    ports:
      - "5005:3000"
    restart: unless-stopped
```

### CI/CD Pipeline

```
Push to main → GitHub Actions → Build Docker → Push to GHCR → SSH Deploy → Live
```

---

## 🎨 Design Philosophy

### Quality Standards

| Aspect | Standard |
|--------|----------|
| **UX** | Delightful, intuitive, zero friction |
| **Performance** | Sub-second interactions, optimistic UI |
| **Design** | Clean, modern, professional |
| **Reliability** | 99.9% uptime, graceful error handling |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Mobile** | Mobile-first responsive design |

### Design Inspirations

| App | What to Learn |
|-----|---------------|
| **jup.ag** | Swap UX, token selection, transaction flow |
| **phantom.app** | Wallet UX, onboarding, mobile experience |
| **uniswap.org** | Clean design, professional feel |
| **stripe.com** | Form design, error handling, trust signals |
| **linear.app** | Speed, keyboard shortcuts, polish |

### Quality Benchmark

> **"Would this be acceptable on jup.ag?"**
>
> If no, raise the bar. The app sells the SDK.

---

## 🔗 Related Projects

| Project | Description | Link |
|---------|-------------|------|
| **sip-protocol** | Core SDK (6,600+ tests) | [GitHub](https://github.com/sip-protocol/sip-protocol) |
| **sip-mobile** | Companion mobile app | [GitHub](https://github.com/sip-protocol/sip-mobile) |
| **sip-website** | Marketing website | [GitHub](https://github.com/sip-protocol/sip-website) |
| **docs-sip** | Documentation | [docs.sip-protocol.org](https://docs.sip-protocol.org) |

---

## 📄 License

[MIT License](LICENSE) — see LICENSE file for details.

---

<div align="center">

**Privacy Command Center for Web3**

*Privacy is not a feature. It's a right.*

[Live App](https://app.sip-protocol.org) · [Documentation](https://docs.sip-protocol.org) · [Report Bug](https://github.com/sip-protocol/sip-app/issues)

*Part of the [SIP Protocol](https://github.com/sip-protocol) ecosystem*

</div>
