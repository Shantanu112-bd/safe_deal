# SafeDeal

SafeDeal is an AI-protected decentralised escrow payment platform built on the **Stellar blockchain**, purpose-built for social commerce merchants on WhatsApp, Instagram, and Telegram.

---

## 🏗️ Architecture

SafeDeal is composed of 5 Soroban smart contracts + a Next.js frontend:

| Contract | Description | Status | Tests |
|---|---|---|---|
| `merchant-escrow` | Core escrow vault — create, lock, confirm, refund deals | ✅ Complete | 21 passing |
| `fraud-detection` | AI risk scoring, wallet analysis, scam reporting | ✅ Complete | 21 passing |
| `dispute-resolution` | Arbitration system with arbiter pool and evidence submission | ✅ Complete | 32 passing |
| `seller-verification` | Trust badges, verification, ratings & review system | ✅ Complete | 39 passing |
| `fiat-bridge` | SEP-24 anchor integration for USDC → INR/NGN/BRL/PHP/IDR | ✅ Complete | 32 passing |

**Total: 145 tests — all passing ✅**

---

## 🛠️ Technologies Used

- **Blockchain**: Stellar / Soroban (Rust smart contracts, SDK v21)
- **Frontend**: Next.js 14
- **Styling**: Tailwind CSS + shadcn/ui + 21st.dev components
- **Fiat Rails**: Stellar SEP-24 Anchor protocol
- **CI/CD**: GitHub Actions

---

## 🚀 Running the Project

### Smart Contracts

Run tests for all contracts:
```bash
# From repo root
for contract in merchant-escrow fraud-detection dispute-resolution seller-verification fiat-bridge; do
  echo "=== $contract ==="
  cd contracts/$contract && cargo test && cd ../..
done
```

### Frontend

Start the development server:
```bash
cd frontend
npm run dev
```

---

## 📋 Contract Summary

### merchant-escrow
Handles the full deal lifecycle: `create_deal` → `lock_payment` → `confirm_delivery` / `auto_refund` / `cancel_deal`. Emits on-chain events at every state transition.

### fraud-detection
Analyses wallet history, transaction velocity, and known scammer reports to produce a 0–100 risk score. Supports whitelisting, blacklisting, and community scam reporting with auto-block at 5 reports.

### dispute-resolution
Manages buyer-filed disputes through Open → UnderReview → Resolved/Dismissed/Escalated states. Arbiters are drawn from an admin-curated pool and submit binding resolutions with optional split settlements.

### seller-verification
Registers social commerce sellers (WhatsApp / Instagram / Telegram) and tracks verification status, deal volume, trust badges (NewSeller → EliteSeller), ratings, and dispute records.

### fiat-bridge
Connects SafeDeal escrow payments to real-world banking via Stellar SEP-24 Anchors. Supports USDC → INR (UPI), NGN (bank transfer), BRL, PHP, IDR with automatic lowest-fee anchor selection and transparent fee breakdowns.