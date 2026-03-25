# 🛡️ SafeDeal — Every Deal, Guaranteed Safe

> **AI-protected decentralized escrow payment platform for WhatsApp and Instagram merchants. Built on Stellar blockchain.**

[![Vercel Deploy](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&logoColor=white)](https://safe-deal-ten.vercel.app)
[![CI/CD](https://github.com/Shantanu112-bd/safe_deal/actions/workflows/deploy.yml/badge.svg)](https://github.com/Shantanu112-bd/safe_deal/actions/workflows/deploy.yml)
[![Stellar Network](https://img.shields.io/badge/Network-Stellar%20Testnet-blueviolet?logo=stellar&logoColor=white)](https://stellar.expert/explorer/testnet)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 🌟 Bridging the Trust Gap

Social commerce is exploding on platforms like **Instagram** and **WhatsApp**, yet millions of deals fail due to a lack of **Trust**. Buyers are afraid to pay upfront, and merchants are afraid to ship without payment.

**SafeDeal** solves this by providing an immutable Layer-2 trust layer built on **Stellar**, ensuring every transaction is protected by a secure, AI-analyzed smart escrow.

---

## 💎 Core Pillars

| 🛡️ Secure Smart Escrow | 🤖 AI Risk Analysis | ⛽ Gasless Web3 UX |
| :--- | :--- | :--- |
| USDC funds are locked in an immutable Soroban contract and only released when the buyer confirms delivery. | Our "AI Shield" analyzes wallet history to flag potential scams *before* you even initiate a deal. | Buyers need exactly **zero XLM** to get started. We use Fee Sponsorship to keep the experience fast and frictionless. |

---

## 🔗 Project Links
- **Live Demo**: [https://safe-deal-ten.vercel.app](https://safe-deal-ten.vercel.app) 
**Demo video link**: [Watch on Loom](https://www.loom.com/share/a7b6d6d5c42942d094961dda5a7eaebe)
- **Metrics Dashboard**: [https://safe-deal-ten.vercel.app/dashboard/metrics](https://safe-deal-ten.vercel.app/dashboard/metrics)
- **Security Checklist**: [https://safe-deal-ten.vercel.app/dashboard/security](https://safe-deal-ten.vercel.app/dashboard/security)
- **Documentation**: [https://safe-deal-ten.vercel.app/docs](https://safe-deal-ten.vercel.app/docs)
- **Community Contribution**: [Twitter post: https://x.com/SafeDeal_Stellar/status/176214041]

---

## ⚡ Advanced Feature — Fee Sponsorship (Account Abstraction)
- **Gasless transactions** using Stellar fee bump.
- Buyers need **zero XLM** to use SafeDeal.
- SafeDeal pays the 0.00001 XLM network fee.
- **Implementation**: [/frontend/src/lib/feeBump.ts](https://github.com/Shantanu112-bd/Safe-Deal/blob/main/frontend/src/lib/feeBump.ts)

---

## ⛓️ Smart Contracts (Stellar Testnet)

| Contract | Address | Tests |
|---|---|---|
| Merchant Escrow | [`CCK5Q4GYHMTAH6ULODU3QHRHTXEI4UDHYBAEEJ3N4KUV6VWHT6JFYKNG`](https://stellar.expert/explorer/testnet/contract/CCK5Q4GYHMTAH6ULODU3QHRHTXEI4UDHYBAEEJ3N4KUV6VWHT6JFYKNG) | 24/24 ✅ |
| Fraud Detection | [`CADZUVFGGYGXGBAUKA75YZNPBKTILEFCLDNG75S34IUMAJEY23CCYHTA`](https://stellar.expert/explorer/testnet/contract/CADZUVFGGYGXGBAUKA75YZNPBKTILEFCLDNG75S34IUMAJEY23CCYHTA) | 21/21 ✅ |
| Dispute Resolution | [`CDISTBIQXAETCAXUGMFDUGAJT2ZA6QLIHA3MJQ6AM22P3ICEEVR5MH2F`](https://stellar.expert/explorer/testnet/contract/CDISTBIQXAETCAXUGMFDUGAJT2ZA6QLIHA3MJQ6AM22P3ICEEVR5MH2F) | 32/32 ✅ |
| Seller Verification | [`CDH5YKKG4GBU5SBNNZZ5ZD4OEEAHBRUUIZZRKWTMQTV5EIGCIPX7NYTZ`](https://stellar.expert/explorer/testnet/contract/CDH5YKKG4GBU5SBNNZZ5ZD4OEEAHBRUUIZZRKWTMQTV5EIGCIPX7NYTZ) | 39/39 ✅ |
| Fiat Bridge | [`CDZ5DMZPMAYS7F64SBBWTZURAT36TFVBUK6TTBRX7QAQMZXAS5FGONOM`](https://stellar.expert/explorer/testnet/contract/CDZ5DMZPMAYS7F64SBBWTZURAT36TFVBUK6TTBRX7QAQMZXAS5FGONOM) | 32/32 ✅ |
| **Total** | | **148/148 ✅** |

---

### 🗣️ User Feedback (Response Sheet)

| # | Verified Wallet Address | Feedback Summary (Anonymized) |
|---|---|---|
| 1 | [`GCRA6G5ZLEKWNFFN3LP2GS2KXZ74C7H2P5AIKOMD42KYNB3IJMP4CH52`](https://stellar.expert/explorer/testnet/account/GCRA6G5ZLEKWNFFN3LP2GS2KXZ74C7H2P5AIKOMD42KYNB3IJMP4CH52) | "Stellar escrow saves merchants from scams." |
| 2 | [`GD5QVXWGR3Y5O27UBCOQZYNAKNIHWYTCJ2RUIMBEWH7QJF7OEKRCBA5H`](https://stellar.expert/explorer/testnet/account/GD5QVXWGR3Y5O27UBCOQZYNAKNIHWYTCJ2RUIMBEWH7QJF7OEKRCBA5H) | "Giving buyers confidence in shop purchases." |
| 3 | [`GCK2O3IZPV5WESR7QTKUGUKL5H46OCTI27XOHVZDR77NJQPOQ3ZPTU6D`](https://stellar.expert/explorer/testnet/account/GCK2O3IZPV5WESR7QTKUGUKL5H46OCTI27XOHVZDR77NJQPOQ3ZPTU6D) | "AI Shield provides incredible deal security." |
| 4 | [`GDZF4G4RNEHSAMPKNNPI65IABZTAT5M23FB3BQK3AOS5OUMFLPNO2UHQ`](https://stellar.expert/explorer/testnet/account/GDZF4G4RNEHSAMPKNNPI65IABZTAT5M23FB3BQK3AOS5OUMFLPNO2UHQ) | "Smooth UI feels like regular checkout." |
| 5 | [`GCNHSCGCWZZ3W5ETWZENPWORQIHTEPCB57OR52XK3MDTBWWWNNUMQOZI`](https://stellar.expert/explorer/testnet/account/GCNHSCGCWZZ3W5ETWZENPWORQIHTEPCB57OR52XK3MDTBWWWNNUMQOZI) | "Instant finality and accurate dispute resolution." |

### Overall Metrics (Beta Phase)
- **Total Beta Transactions**: 42 
- **Successful Payouts**: 38
- **Disputes Handled**: 3 (Resolved via arbitration)
- **Average Risk Score Scanned**: 14%
- **System Stability**: 100% Uptime during testnet trials.

### Future Roadmap
- **WhatsApp Bot Integration**: Generate escrow links via chat.
- **Expanded Fiat Gateway**: Regional INR off-ramps via SEP-24.
- **Advanced Reputation Scores**: Shipping speed and quality reviews.

---

## 📊 Data Indexing & Monitoring
- **Approach**: Stellar Horizon REST API
- **Used for**: Transaction history, account queries
- **Endpoint**: [https://horizon-testnet.stellar.org](https://horizon-testnet.stellar.org)
- **Performance**: High-performance indexer caching layer implemented in `/frontend/src/app/api/indexer`.
- **Implementation**: [/frontend/src/lib/indexer.ts](https://github.com/Shantanu112-bd/Safe-Deal/blob/main/frontend/src/lib/indexer.ts)
- **Monitoring**: Vercel Logs + localStorage events (user_connected, deal_created, payment_locked, payment_released).

---

## 🏗️ Architecture
![Architecture Chart](./architecture_overview.png)

---

## 🛠️ Tech Stack
- **Smart Contracts**: Rust + Soroban (Stellar)
- **Frontend**: Next.js 14 + Tailwind CSS
- **Blockchain**: Stellar Testnet
- **Stablecoin**: USDC
- **Wallet**: Freighter + Albedo
- **Deployment**: Vercel + GitHub Actions

---

## 💻 Local Setup & Testing
```bash
# Clone and run
git clone https://github.com/Shantanu112-bd/Safe-Deal.git
cd Safe-Deal/frontend && npm install && npm run dev

# Run Contract Tests
cd contracts/merchant-escrow && cargo test
cd contracts/fraud-detection && cargo test
cd contracts/dispute-resolution && cargo test
cd contracts/seller-verification && cargo test
cd contracts/fiat-bridge && cargo test
```
