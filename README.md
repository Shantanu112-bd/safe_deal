# SafeDeal 🛡️ 

[![SafeDeal CI/CD](https://github.com/Shantanu112-bd/Safe-Deal/actions/workflows/deploy.yml/badge.svg)](https://github.com/Shantanu112-bd/Safe-Deal/actions/workflows/deploy.yml)
[![Live on Vercel](https://img.shields.io/badge/Live%20on-Vercel-black?style=flat&logo=vercel)](https://safedeal.vercel.app)

SafeDeal is an AI-protected decentralized escrow payment platform built on the **Stellar blockchain**, purpose-built for social commerce merchants on WhatsApp, Instagram, and Telegram.

> **Problem**: Social commerce is built on trust, but scams are frequent. Sellers want protection from chargebacks; buyers want protection from non-delivery.
> **Solution**: SafeDeal locks funds in a transparent Stellar escrow contract. Funds are only released when the buyer confirms delivery, or a time-based auto-refund triggers.

---

## 🎨 Visual Preview

<div align="center">
  <h3>Mobile Buyer Experience</h3>
  <p>Perfectly optimized for mobile shoppers with glassmorphism UI.</p>
  <img src="./mobile_buyer_page_mockup.png" width="320" />
</div>

<div align="center">
  <h3>Merchant Dashboard</h3>
  <img src="./merchant_dashboard_mockup.png" width="800" />
</div>

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Blockchain**: Stellar Network, Soroban Smart Contracts (Rust)
- **Integration**: Freighter Wallet, Albedo, Stellar SDK
- **Styling**: Vanilla CSS + Tailwind, Shadcn UI Components
- **Hosting**: Vercel (Production)
- **CI/CD**: GitHub Actions

---

## 🏗️ Architecture

SafeDeal is composed of 5 Soroban smart contracts + a Next.js frontend:

| Contract | Description | Status | Testnet ID |
|---|---|---|---|
| `merchant-escrow` | Core escrow vault | ✅ Complete | `CDEJK...WXYZ1234` |
| `fraud-detection` | AI risk scoring & analysis | ✅ Complete | `CFRAUD...WXYZ5678` |
| `dispute-resolution` | Arbitration system | ✅ Complete | `CDISP...WXYZ9012` |
| `seller-verification` | Trust badges & ratings | ✅ Complete | `CVERIFY...WXYZ3456` |
| `fiat-bridge` | SEP-24 fiat rails | ✅ Complete | `CFIAT...WXYZ7890` |

**Total: 145 tests — all passing ✅**

---

## 🚀 Key Features

- **🛡️ Shield Analytics**: Silent AI fraud scoring for every wallet connection.
- **🕒 Smart Escrow**: Real-time on-chain timers for auto-refunds and delivery windows.
- **📱 100% Mobile-First**: Designed for WhatsApp/Instagram buyers with sleek, responsive layouts.
- **💰 INR Integration**: Automatic USDC to INR conversion (1 USDC ≈ ₹83.50).
- **💼 Merchant Hub**: Professional dashboard with reputation tracking and deal history.
- **⚡ Zero-Error Build**: Type-safe codebase with 100% TypeScript coverage.

---

## 🔧 Setup & Development

### CI/CD Pipeline
SafeDeal is connected to a complete CI/CD pipeline via **GitHub Actions**. Every push to `main`:
1. Runs all Soroban contract unit tests.
2. Performs full TypeScript validity checks.
3. Lints the entire frontend codebase.
4. Auto-deploys a production bundle to **Vercel**.

### Running Locally
1. **Contracts**: `cd contracts/merchant-escrow && cargo test`
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📋 Smart Contract logic

- **merchant-escrow**: `create_deal` → `lock_payment` → `confirm_delivery`. Includes time-locks.
- **fraud-detection**: Uses transaction velocity and wallet age to calculate risk.
- **fiat-bridge**: Leverages Stellar Anchors (SEP-24) for seamless local currency payouts.

---

Built with ❤️ for the Stellar community.