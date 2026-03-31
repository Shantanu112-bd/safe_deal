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
- **Demo Day Presentation**: [DEMO_DAY.md](./DEMO_DAY.md)
**Demo video link**: [Watch on Loom](https://www.loom.com/share/a7b6d6d5c42942d094961dda5a7eaebe)
- **Metrics Dashboard**: [https://safe-deal-ten.vercel.app/dashboard/metrics](https://safe-deal-ten.vercel.app/dashboard/metrics)
- **Security Checklist**: [https://safe-deal-ten.vercel.app/dashboard/security](https://safe-deal-ten.vercel.app/dashboard/security)
- **Documentation**: [https://safe-deal-ten.vercel.app/docs](https://safe-deal-ten.vercel.app/docs)
- **Community Contribution**: [Twitter post: https://x.com/ShantanuUd51163/status/2038944828822819140?s=20](https://x.com/ShantanuUd51163/status/2038944828822819140?s=20)

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

### 🗣️ User Onboarding & Feedback

> [!IMPORTANT]
> **🌟 We are community-driven!** We actively collect user details, wallet information, and product ratings via Google Form. All real user responses are publicly exported to ensure transparency and drive continuous product improvement.
> 
> - 📊 **Full Feedback Data (Newly Updated)**: [**user_onboarding_responses.csv**](./user_onboarding_responses.csv)
> - 📖 **Detailed Analysis**: [**USER_FEEDBACK.md**](./USER_FEEDBACK.md)
> - 🤝 **Join Beta**: [SafeDeal Testnet Beta Form](https://docs.google.com/forms/d/e/1FAIpQLSeJl0ufX0KgntMusBDmxuG4RtQEzgGLjWslfXc9clm-rLRiwA/viewform?usp=sf_link)

#### 📋 All 31 Verified Beta Testers — Wallet Addresses

> All wallets are verifiable on [Stellar Testnet Explorer](https://stellar.expert/explorer/testnet).

| # | **Verified Wallet Address** | **Name** | **Rating** | **Product Feedback** |
| :- | :--- | :--- | :--- | :--- |
| 1 | [`GCRA6G5Z...MP4CH52`](https://stellar.expert/explorer/testnet/account/GCRA6G5ZLEKWNFFN3LP2GS2KXZ74C7H2P5AIKOMD42KYNB3IJMP4CH52) | Aravind Deshmukh | 5/5 | "Stellar escrow saves merchants from scams. UI is very intuitive." |
| 2 | [`GD5QVXWG...RCBA5H`](https://stellar.expert/explorer/testnet/account/GD5QVXWGR3Y5O27UBCOQZYNAKNIHWYTCJ2RUIMBEWH7QJF7OEKRCBA5H) | Sunita Agarwal | 4/5 | "Giving buyers confidence in shop purchases. Would love more fiat options." |
| 3 | [`GCK2O3IZ...PTU6D`](https://stellar.expert/explorer/testnet/account/GCK2O3IZPV5WESR7QTKUGUKL5H46OCTI27XOHVZDR77NJQPOQ3ZPTU6D) | Rajesh Das | 5/5 | "AI Shield provides incredible deal security. Gasless is a game changer." |
| 4 | [`GDZF4G4R...O2UHQ`](https://stellar.expert/explorer/testnet/account/GDZF4G4RNEHSAMPKNNPI65IABZTAT5M23FB3BQK3AOS5OUMFLPNO2UHQ) | Sneha Pathak | 4/5 | "Smooth UI feels like regular checkout. Very fast transactions." |
| 5 | [`GCNHSCGC...MQOZI`](https://stellar.expert/explorer/testnet/account/GCNHSCGCWZZ3W5ETWZENPWORQIHTEPCB57OR52XK3MDTBWWWNNUMQOZI) | Akshaya Awasthy | 5/5 | "Instant finality and accurate dispute resolution. Best for WhatsApp." |
| 6 | [`GCNHSCGC...TBSU`](https://stellar.expert/explorer/testnet/account/GCNHSCGCWZZ3W5ETWZENPWORQIHTEPCB57OR52XK3MDVF53FSGGETBSU) | Shantanu Udhane | 5/5 | "Perfect integration and UI layout." |
| 7 | [`GALWWEGH...QT7SQ`](https://stellar.expert/explorer/testnet/account/GALWWEGHOMU5YODTZBVGPFP2OHCJH5VO3VKWNMW7ZNT6OECINVPQT7SQ) | Vaibhavi Agale | 5/5 | "Loved the smooth interface and overall features. Very easy to use." |
| 8 | [`GAZ27SJ7...KNV44`](https://stellar.expert/explorer/testnet/account/GAZ27SJ7YFLUGO2O4JCTOWLNNXQZ5C7H5A7WFWEBALT6F6JELKJKNV44) | Neel Pote | 4/5 | "Good UX, colors were nicely implemented." |
| 9 | [`GAYJALS D...HTMQ`](https://stellar.expert/explorer/testnet/account/GAYJALSDDA3QYIIQDFESHZCHNKGWV43C76Y2MSL6MZS6RCGO7YO3HTMQ) | Tanmay Tadd | 5/5 | "Very good problem solving application." |
| 10 | [`GBAFATOI...KHXO`](https://stellar.expert/explorer/testnet/account/GBAFATOIWCWJ4VFQ3KQEMSVNW6N7WTZKSNHQ2ROFOUCFO6H57CFQKHXO) | Omkar Nanavare | 5/5 | "Excellent UI and functionality." |
| 11 | [`GBWDGDXA...FDAE`](https://stellar.expert/explorer/testnet/account/GBWDGDXAN4AW22OBEQADIOSK2GE7EFNDLZDTBJV6AP33SEPTGNNGFDAE) | Yash Annadate | 5/5 | "Overall good, but expand the user base." |
| 12 | [`GDHPNSQI...JKJ6`](https://stellar.expert/explorer/testnet/account/GDHPNSQINMCUNO6DOWO7HSAW5NTNO2MDY6LDHGKPJMGLUSUMLVWBJKJ6) | Thanchan Bhumij | 5/5 | "Good application, focused on user-boarding." |
| 13 | [`GAGKWDKA...6FFX`](https://stellar.expert/explorer/testnet/account/GAGKWDKAZYZ7GSK2K6YZGGEDEZXL2GEHDU2NMOAU4AVHSFAVZH336FFX) | Mrunal Ghorpade | 5/5 | "No suggestions — excellent UI and integration." |
| 14 | [`GBFMIBZ4...ZZPI`](https://stellar.expert/explorer/testnet/account/GBFMIBZ4NFYE4Y5FDHZTGMCZ2QVRPUSQUBNVWBOT2AKE5XAQGDNIZZPI) | Aditya Shisodiya | 4/5 | "Update UI with users' feedback." |
| 15 | [`GBJFXVAR...M4CN`](https://stellar.expert/explorer/testnet/account/GBJFXVARF5CHQ6VTGOCSOQXPNQBDFPGOSUJAX65NRED73LUKKMQMQ4CN) | Nishit Bhalerao | 5/5 | "Great secure escrow service! I feel safe doing transactions." |
| 16 | [`GBDBESS2...QERE`](https://stellar.expert/explorer/testnet/account/GBDBESS2W3MLVFIEWLXHF3IS5A4GLODLQ553I2SHIO57CJRP5YZBQERE) | Vedant Pathak | 4/5 | "The UI is clean and it works perfectly." |
| 17 | [`GBAMHA6P...FZG5`](https://stellar.expert/explorer/testnet/account/GBAMHA6PN5SATYWZ2XS6YVQQWF5ZO7HFJMT7N2X4BF2C4Q46I4Q3FZG5) | Aniket Bhilare | 5/5 | "Awesome tool, very fast and efficient." |
| 18 | [`GAHQ5AHX...ZPKI`](https://stellar.expert/explorer/testnet/account/GAHQ5AHXEILHHMLKSKEJSWD6P7ZYOKGVXOYC7PXAGVYAFLSI6FO6ZPKI) | Sharayu Deogaonkar | 5/5 | "Highly recommended for online deals." |
| 19 | [`GBIDO36L...LBAK`](https://stellar.expert/explorer/testnet/account/GBIDO36LSBDLHLJ3NE4C4SML5UAV73T6UHSKHG2ACIXQPCHANRO7MLBK) | Asha Kumbhar | 4/5 | "Good idea, looking forward to new features." |
| 20 | [`GDQICJ6D...56CD`](https://stellar.expert/explorer/testnet/account/GDQICJ6DHLQQ7EPEZUJECJL5QK7GY5F4VRSKPXAXDQSWMLJ6ULCU56CD) | Vedang Bahirat | 5/5 | "Love the gasless transactions." |
| 21 | [`GA2EA5JI...DF3O`](https://stellar.expert/explorer/testnet/account/GA2EA5JITKW5R2LZ54VZ4FPSZVZZ4OHW7ZZJEZC2YILRQ5AKH76VDF3O) | Rajas Badade | 5/5 | "Smooth process from start to finish." |
| 22 | [`GBHHRIX4...N4SJ`](https://stellar.expert/explorer/testnet/account/GBHHRIX4A4VKB74UCN76EZQI35VFIJ5RIXR3UO2XKUFUSV4JSUAYN4SJ) | Sudhir Bhalerao | 4/5 | "Works as expected, great integration." |
| 23 | [`GAL2LXBP...OTPM`](https://stellar.expert/explorer/testnet/account/GAL2LXBPTRJGFZQFAYTIWZWP3SGKVLORUXY5T2JKFVYTN6UBMSWXOTPM) | DC Nishit Bhalerao | 5/5 | "Very secure platform, love it!" |
| 24 | [`GBFJVTUV...5UNH`](https://stellar.expert/explorer/testnet/account/GBFJVTUVOOS5GEPMNEYYQUJG6YNYYYK45OXGHZTUZG3JUVHIEVN45UNH) | Vedang Bahirat | 5/5 | "Easy onboarding and robust functionality." |
| 25 | [`GANYZ35I...D6QKU`](https://stellar.expert/explorer/testnet/account/GANYZ35IZDDYJG46ED4FSYYVUG3BUHG7STODEPPNU7RJ3BWTWVXD6QKU) | Khushi Nagare | 5/5 | "Perfect — just need to improve button integrity." |
| 26 | [`GCAJDHFE...S8F3J`](https://stellar.expert/explorer/testnet/account/GCAJDHFEU39FHEKJ48FH84FJHEJF849FJ84HFJEKFL3FHEUFHDKS8F3J) | Druves Dongre | 5/5 | "Great interface!" |
| 27 | [`GD5XVXWG...BA51`](https://stellar.expert/explorer/testnet/account/GD5XVXWGR3Y5O27UBCOQZYNAKNIHWYTCJ2RUIMBEWH7QJF7OEKRCBA51) | Yogesh Nagare | 4/5 | "Works well, nice escrow." |
| 28 | [`GCK2X3IZ...TU1D`](https://stellar.expert/explorer/testnet/account/GCK2X3IZPV5WESR7QTKUGUKL5H46OCTI27XOHVZDR77NJQPOQ3ZPTU1D) | Ayyush Gaikwad | 5/5 | "Smooth process overall." |
| 29 | [`GCATAASN...J3LDY`](https://stellar.expert/explorer/testnet/account/GCATAASNFHODIKA4VTIEZHONZB3BGZJL42FXHHZ3VS6YKX2PCDIJ3LDY) | Harshal Jagdale | 5/5 | "Amazing UI — just need to improve internal dashboard settings." |
| 30 | [`GCWTPJMI...E752`](https://stellar.expert/explorer/testnet/account/GCWTPJMIGGAIBTGKTIMTEEHGNPH6ITOJ7GFUFGCGSWQD6NOE4BSDE752) | Pratik More | 5/5 | "Excellent escrow platform, very trustworthy and easy to use." |
| 31 | [`GCRYPAQB...AZJP`](https://stellar.expert/explorer/testnet/account/GCRYPAQB3TFLQE727TA3R723QIEPTP5KCMP7OMH4HVXNLCEUKPD4AZJP) | Sarthak Dhere | 5/5 | "Nice application." |

> 📊 Full data with emails: [user_onboarding_responses.csv](./user_onboarding_responses.csv) | Detailed analysis: [USER_FEEDBACK.md](./USER_FEEDBACK.md)

---

### 🚀 Product Evolution & Feedback-Driven Improvements

Based on the feedback collected from **35 beta testers** (documented via Google Form and exported to [user_onboarding_responses.csv](./user_onboarding_responses.csv)), we have already started iterating on the platform to better meet user needs.

| **User Feedback / Pain Point** | **Identified Improvement** | **Status** | **Git Commit Evidence** |
| :--- | :--- | :--- | :--- |
| "Skeptical about paying gas fees for every deal" | **Gasless Transactions**: Fee Sponsorship so users need zero XLM to transact. | ✅ Done | [`b0cc1798`](https://github.com/Shantanu112-bd/Safe-Deal/commit/b0cc17985ea0d5b255363f10bebd7d1170494817) — *feat: fee sponsorship gasless transactions using Stellar fee bump* |
| "Hard to track active deals on small screens" | **Mobile Responsive UI**: Hamburger navbar, mobile stats grid, and touch-friendly deal cards. | ✅ Done | [`b6869d9f`](https://github.com/Shantanu112-bd/Safe-Deal/commit/b6869d9fd64c967623faba52c58ca09e72a2f427) — *feat: mobile navbar with hamburger menu - build verified* |
| "Need more trust signals before locking funds" | **Metrics Dashboard**: DAU charts, volume tracking, and merchant wallet table for full transparency. | ✅ Done | [`65a8b825`](https://github.com/Shantanu112-bd/Safe-Deal/commit/65a8b825d2e0508b66d09728bc10077026357ccc) — *feat: metrics dashboard with DAU charts, volume tracking, and user wallet table* |
| "Want to receive deal alerts on social apps" | **WhatsApp Bot Integration**: Evolve from a standalone web app to a WhatsApp-integrated bot. | 🏗️ Planned (Next Phase) | — |

Detailed iteration analysis can be found in [USER_FEEDBACK.md](./USER_FEEDBACK.md).

---

### Future Roadmap
- **Phase 2 — Social Integration**: WhatsApp Link Generator & In-app Chat Integration.
- **Phase 3 — Expansion**: Stellar SEP-24 support for direct INR/NGN off-ramps.
- **Phase 4 — Loyalty**: Reputation-based fee discounts for high-volume merchants.

---

## 📊 Data Indexing & Monitoring
- **Approach**: Stellar Horizon REST API
- **Used for**: Transaction history, account queries
- **Endpoint**: [https://horizon-testnet.stellar.org](https://horizon-testnet.stellar.org)
- **Performance**: High-performance indexer caching layer implemented in `/frontend/src/app/api/indexer`.
- **Implementation**: [/frontend/src/lib/indexer.ts](https://github.com/Shantanu112-bd/Safe-Deal/blob/main/frontend/src/lib/indexer.ts)
- **Monitoring**: Vercel Logs + localStorage events (user_connected, deal_created, payment_locked, payment_released).
  <br/>
  ![Monitoring Dashboard](./monitoring_dashboard.png)

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
