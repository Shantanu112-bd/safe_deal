# SafeDeal

SafeDeal is an AI-protected decentralized escrow payment platform built on the Stellar blockchain, specifically designed for social commerce merchants on WhatsApp, Instagram, and Telegram.

## Architecture

SafeDeal is built on Soroban smart contracts and Next.js and includes:
- **merchant-escrow**: Core escrow vault.
- **fraud-detection**: AI risk scoring for transactions.
- **dispute-resolution**: Arbitration system.
- **seller-verification**: Trust badging and verification.
- **fiat-bridge**: SEP-24 integration for seamless fiat on/off-ramps.

## Technologies Used

- Stellar / Soroban
- Next.js 14
- Tailwind CSS
- shadcn/ui
- 21st.dev components

## Running the Project

Start the development server:
```bash
cd frontend
npm run dev
```