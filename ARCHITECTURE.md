# SafeDeal Architecture

## System Overview

SafeDeal is a decentralized escrow platform operating on the Stellar network. It facilitates trustless transactions for social commerce merchants (WhatsApp, Instagram, etc.).

The system follows a classic modern Web3 architecture:
1. **Client-Side (Frontend)**: A Next.js 14 application built with React, styled with Tailwind CSS, and interacting with the browser's Stellar wallet extensions (e.g., Freighter, Albedo).
2. **Blockchain Layer (Smart Contracts)**: A suite of 5 inter-connected Soroban smart contracts written in Rust.
3. **Data/Indexing Layer**: Utilizes the Stellar Horizon API for fetching network data and submitting transactions.

---

## 1. Smart Contract Architecture

The decentralized backend is divided into 5 modular Soroban contracts to ensure separation of concerns and upgradeability:

### Core Escrow (`merchant-escrow`)
- **Purpose**: The central vault. Holds funds (USDC or native XLM) in escrow.
- **Flow**: 
  1. `create_deal`: Merchant sets up the terms.
  2. `lock_payment`: Buyer deposits funds into the contract's balance.
  3. `confirm_delivery`: Buyer approves the physical item, triggering payout to the merchant.
  4. `auto_refund`: If the merchant fails to ship before the deadline, funds return to the buyer.

### AI Risk Scoring (`fraud-detection`)
- **Purpose**: Pre-transaction security.
- **Logic**: Analyzes wallet age, historical transaction velocity, and previous dispute records on-chain. Assigns a risk score before a buyer is permitted to lock funds.

### Dispute Resolution (`dispute-resolution`)
- **Purpose**: Handles edge cases where buyer and seller disagree.
- **Logic**: Halts the automatic escrow timer. Requires multi-sig or assigned arbiter intervention to release funds to either party.

### Trust System (`seller-verification`)
- **Purpose**: Reputation module.
- **Logic**: Grants mathematically verifiable NFT badges based on the number of successful, dispute-free deals closed by a merchant.

### Fiat Rails (`fiat-bridge`)
- **Purpose**: Integrates with SEP-24 anchors.
- **Logic**: Allows non-crypto-native merchants to automatically receive payouts into local fiat currency (e.g., INR) via Stellar Anchors instead of holding USDC.

---

## 2. Frontend Architecture

Built with Next.js 14 using the App Router (`/src/app`):

### Context & State Management
- `WalletContext.tsx`: Wraps the application to manage connection states for Freighter/Albedo and holds the global `publicKey` and `balances`.

### UI/UX Design System
- Utilizes `shadcn/ui` tailored components and `framer-motion` for complex structural animations.
- Responsive, Mobile-First: Key for target demographic (Instagram/WhatsApp merchants processing orders via smartphones).

### Network Communication
- Interacts with `@stellar/freighter-api` and `@stellar/stellar-sdk` to sign and submit XDR envelopes to the Stellar Testnet.

---

## 3. Deployment & CI/CD

- **Repository**: Hosted publicly on GitHub.
- **CI/CD Pipeline**: GitHub Actions triggered on `push` to `main`.
  - Runs all Rust/Soroban unit tests.
  - Builds Next.js static asset artifacts.
  - Dispatches to **Vercel** serverless infrastructure using Vercel's official GitHub Action.
- **Hosting**: Edge-rendered on Vercel with static assets deployed globally via CDN.
