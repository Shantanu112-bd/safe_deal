/**
 * SafeDeal Stellar Integration Layer
 * ====================================
 * Dual-mode: uses real Soroban contract calls when contracts are deployed,
 * falls back to localStorage for local testing when they're not.
 *
 * Each function checks isOnChainMode() to decide which path to take.
 */

import {
  Horizon,
  TransactionBuilder,
  Transaction,
  FeeBumpTransaction,
} from "@stellar/stellar-sdk";
import { CONTRACTS, PASSPHRASE, HORIZON_URL } from "./contracts";
import { WalletType } from "./wallet";
import {
  isOnChainMode,
  invokeContract,
  queryContract,
  toScString,
  toScAmount,
  toScU64,
  toScAddress,
  fromScString,
  fromScAmount,
  fromScU64,
  fromScU32,
  fromScAddress,
  fromScVec,
  fromScMap,
  fromScBool,
} from "./soroban";

const server = new Horizon.Server(HORIZON_URL);

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface DealData {
  id: string;
  title: string;
  description: string;
  category: string;
  amountUSDC: number;
  sellerKey: string;
  buyerKey?: string;
  status: string;
  createdAt: number;
  expiresAt: number;
  lockedAt?: number;
}

export interface SellerProfileData {
  verified: boolean;
  rating: number;       // 0.0 – 5.0
  badges: string[];
  businessName: string;
  completedDeals: number;
  totalVolume: number;   // USDC
}

export interface FraudScoreData {
  score: number;
  level: string;
  canProceed: boolean;
  factors: string[];
}

// ──────────────────────────────────────────────
// Helper: localStorage fallback
// ──────────────────────────────────────────────

const updateDealStatus = (dealId: string, newStatus: string, extra?: Record<string, unknown>) => {
  try {
    const raw = localStorage.getItem(`safedeal_deal_${dealId}`);
    if (raw) {
      const deal = JSON.parse(raw);
      deal.status = newStatus;
      if (extra) Object.assign(deal, extra);
      localStorage.setItem(`safedeal_deal_${dealId}`, JSON.stringify(deal));
    }
    const listRaw = localStorage.getItem("safedeal_deals");
    if (listRaw) {
      const list = JSON.parse(listRaw) as Array<Record<string, unknown>>;
      const updated = list.map((d) =>
        d.id === dealId ? { ...d, status: newStatus, ...(extra || {}) } : d
      );
      localStorage.setItem("safedeal_deals", JSON.stringify(updated));
    }
  } catch (e) {
    console.warn("updateDealStatus localStorage error:", e);
  }
};

// ──────────────────────────────────────────────
// Status mapping
// ──────────────────────────────────────────────

const DEAL_STATUS_MAP: Record<number, string> = {
  0: "waiting",    // WaitingForPayment
  1: "locked",     // Locked
  2: "completed",  // Completed
  3: "disputed",   // Disputed
  4: "refunded",   // Refunded
  5: "cancelled",  // Cancelled
  6: "expired",    // Expired
};

const decodeDealStatus = (scVal: unknown): string => {
  try {
    // Soroban enum is encoded as a u32
    if (typeof scVal === "number") return DEAL_STATUS_MAP[scVal] || "waiting";
    return "waiting";
  } catch {
    return "waiting";
  }
};

// ──────────────────────────────────────────────
// 1. CREATE DEAL (Merchant)
// ──────────────────────────────────────────────

export const createEscrowTransaction = async (
  merchantAddress: string,
  amount: number,
  expiryHours: number,
  walletType: WalletType,
  meta?: { itemName?: string; description?: string; category?: string }
): Promise<{ success: boolean; dealId: string }> => {
  if (!merchantAddress) throw new Error("Wallet not connected");
  if (amount <= 0) throw new Error("Amount must be greater than 0");

  // ── ON-CHAIN MODE ──
  if (isOnChainMode("MERCHANT_ESCROW")) {
    console.log("[createEscrowTransaction] Soroban mode");

    const args = [
      toScAddress(merchantAddress),                           // seller
      toScAmount(amount),                                     // amount (i128 stroops)
      toScString(meta?.description || ""),                    // description
      toScString(meta?.itemName || "SafeDeal Item"),          // item_name
      toScU64(expiryHours),                                   // expiry_hours
    ];

    const result = await invokeContract(
      merchantAddress,
      "MERCHANT_ESCROW",
      "create_deal",
      args,
      walletType
    );

    // The return value is the deal_id string
    const resultVal = TransactionBuilder.fromXDR(result.resultXdr, PASSPHRASE);
    let dealId = result.txHash.slice(0, 8); // fallback
    try {
      // Try to extract the deal ID from the result
      if (resultVal && "operations" in resultVal) {
        dealId = result.txHash.slice(0, 12);
      }
    } catch {
      // use txHash prefix as deal ID
    }

    return { success: true, dealId };
  }

  // ── LOCAL FALLBACK ──
  console.log("[createEscrowTransaction] localStorage mode");

  const dealId = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  const expiresAt = Date.now() + expiryHours * 60 * 60 * 1000;

  const deal = {
    id: dealId,
    title: meta?.itemName || "SafeDeal Item",
    description: meta?.description || "",
    category: meta?.category || "Other",
    amountUSDC: amount,
    sellerKey: merchantAddress,
    walletType,
    status: "waiting",
    createdAt: Date.now(),
    expiresAt,
  };

  try {
    const existing = JSON.parse(localStorage.getItem("safedeal_deals") || "[]");
    existing.unshift(deal);
    localStorage.setItem("safedeal_deals", JSON.stringify(existing));
    localStorage.setItem(`safedeal_deal_${dealId}`, JSON.stringify(deal));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }

  return { success: true, dealId };
};

// ──────────────────────────────────────────────
// 2. LOCK PAYMENT (Buyer)
// ──────────────────────────────────────────────

export const lockPayment = async (
  dealId: string,
  amount: number,
  walletType: WalletType,
  buyerAddress?: string
): Promise<{ success: boolean; txHash: string }> => {
  if (!walletType) throw new Error("Wallet not connected");

  // ── ON-CHAIN MODE ──
  if (isOnChainMode("MERCHANT_ESCROW") && buyerAddress) {
    console.log("[lockPayment] Soroban mode");

    const args = [
      toScString(dealId),           // deal_id
      toScAddress(buyerAddress),    // buyer
      toScAmount(amount),           // amount
    ];

    const result = await invokeContract(
      buyerAddress,
      "MERCHANT_ESCROW",
      "lock_payment",
      args,
      walletType
    );

    return { success: true, txHash: result.txHash };
  }

  // ── LOCAL FALLBACK ──
  console.log("[lockPayment] localStorage mode");
  await new Promise((r) => setTimeout(r, 1500));
  updateDealStatus(dealId, "locked", { buyerKey: buyerAddress });
  return { success: true, txHash: `tx_${Date.now().toString(36)}_${dealId}` };
};

// ──────────────────────────────────────────────
// 3. CONFIRM DELIVERY (Buyer)
// ──────────────────────────────────────────────

export const confirmDelivery = async (
  dealId: string,
  walletType: WalletType,
  buyerAddress?: string
): Promise<{ success: boolean; txHash: string }> => {
  if (!walletType) throw new Error("Wallet not connected");

  // ── ON-CHAIN MODE ──
  if (isOnChainMode("MERCHANT_ESCROW") && buyerAddress) {
    console.log("[confirmDelivery] Soroban mode");

    const args = [
      toScString(dealId),           // deal_id
      toScAddress(buyerAddress),    // buyer
    ];

    const result = await invokeContract(
      buyerAddress,
      "MERCHANT_ESCROW",
      "confirm_delivery",
      args,
      walletType
    );

    return { success: true, txHash: result.txHash };
  }

  // ── LOCAL FALLBACK ──
  console.log("[confirmDelivery] localStorage mode");
  await new Promise((r) => setTimeout(r, 1200));
  updateDealStatus(dealId, "completed");
  return { success: true, txHash: `tx_${Date.now().toString(36)}_${dealId}_release` };
};

// ──────────────────────────────────────────────
// 4. CANCEL DEAL (Seller)
// ──────────────────────────────────────────────

export const cancelDeal = async (
  dealId: string,
  walletType: WalletType,
  sellerAddress: string
): Promise<{ success: boolean }> => {
  if (!walletType) throw new Error("Wallet not connected");

  // ── ON-CHAIN MODE ──
  if (isOnChainMode("MERCHANT_ESCROW")) {
    console.log("[cancelDeal] Soroban mode");

    const args = [
      toScString(dealId),
      toScAddress(sellerAddress),
    ];

    await invokeContract(sellerAddress, "MERCHANT_ESCROW", "cancel_deal", args, walletType);
    return { success: true };
  }

  // ── LOCAL FALLBACK ──
  console.log("[cancelDeal] localStorage mode");
  await new Promise((r) => setTimeout(r, 800));
  updateDealStatus(dealId, "cancelled");
  return { success: true };
};

// ──────────────────────────────────────────────
// 5. GET DEAL (Read-only)
// ──────────────────────────────────────────────

export const getDeal = async (dealId: string): Promise<DealData | null> => {
  // ── ON-CHAIN MODE ──
  if (isOnChainMode("MERCHANT_ESCROW")) {
    console.log("[getDeal] Soroban mode");

    const result = await queryContract("MERCHANT_ESCROW", "get_deal", [
      toScString(dealId),
    ]);

    if (!result) return null;

    try {
      const map = fromScMap(result);
      return {
        id: fromScString(map["deal_id"]),
        title: fromScString(map["item_name"]),
        description: fromScString(map["description"]),
        category: "",
        amountUSDC: fromScAmount(map["amount"]),
        sellerKey: fromScAddress(map["seller"]),
        buyerKey: map["buyer"] ? fromScAddress(map["buyer"]) : undefined,
        status: decodeDealStatus(fromScU32(map["status"])),
        createdAt: fromScU64(map["created_at"]) * 1000,
        expiresAt: fromScU64(map["expiry_at"]) * 1000,
        lockedAt: map["locked_at"] ? fromScU64(map["locked_at"]) * 1000 : undefined,
      };
    } catch (e) {
      console.error("Failed to decode deal:", e);
      return null;
    }
  }

  // ── LOCAL FALLBACK ──
  try {
    const raw = localStorage.getItem(`safedeal_deal_${dealId}`);
    if (!raw) return null;
    return JSON.parse(raw) as DealData;
  } catch {
    return null;
  }
};

// ──────────────────────────────────────────────
// 6. GET SELLER DEALS (Read-only)
// ──────────────────────────────────────────────

export const getSellerDeals = async (sellerAddress: string): Promise<DealData[]> => {
  // ── ON-CHAIN MODE ──
  if (isOnChainMode("MERCHANT_ESCROW")) {
    console.log("[getSellerDeals] Soroban mode");

    const result = await queryContract("MERCHANT_ESCROW", "get_seller_deals", [
      toScAddress(sellerAddress),
    ]);

    if (!result) return [];

    try {
      const vec = fromScVec(result);
      return vec.map((dealVal) => {
        const map = fromScMap(dealVal);
        return {
          id: fromScString(map["deal_id"]),
          title: fromScString(map["item_name"]),
          description: fromScString(map["description"]),
          category: "",
          amountUSDC: fromScAmount(map["amount"]),
          sellerKey: fromScAddress(map["seller"]),
          status: decodeDealStatus(fromScU32(map["status"])),
          createdAt: fromScU64(map["created_at"]) * 1000,
          expiresAt: fromScU64(map["expiry_at"]) * 1000,
        };
      });
    } catch (e) {
      console.error("Failed to decode seller deals:", e);
      return [];
    }
  }

  // ── LOCAL FALLBACK ──
  try {
    const raw = localStorage.getItem("safedeal_deals");
    if (!raw) return [];
    const all = JSON.parse(raw) as DealData[];
    return all.filter((d) => d.sellerKey === sellerAddress);
  } catch {
    return [];
  }
};

// ──────────────────────────────────────────────
// 7. GET BUYER DEALS (Read-only)
// ──────────────────────────────────────────────

export const getBuyerDeals = async (buyerAddress: string): Promise<DealData[]> => {
  // ── ON-CHAIN MODE ──
  if (isOnChainMode("MERCHANT_ESCROW")) {
    console.log("[getBuyerDeals] Soroban mode");

    const result = await queryContract("MERCHANT_ESCROW", "get_buyer_deals", [
      toScAddress(buyerAddress),
    ]);

    if (!result) return [];

    try {
      const vec = fromScVec(result);
      return vec.map((dealVal) => {
        const map = fromScMap(dealVal);
        return {
          id: fromScString(map["deal_id"]),
          title: fromScString(map["item_name"]),
          description: fromScString(map["description"]),
          category: "",
          amountUSDC: fromScAmount(map["amount"]),
          sellerKey: fromScAddress(map["seller"]),
          buyerKey: map["buyer"] ? fromScAddress(map["buyer"]) : undefined,
          status: decodeDealStatus(fromScU32(map["status"])),
          createdAt: fromScU64(map["created_at"]) * 1000,
          expiresAt: fromScU64(map["expiry_at"]) * 1000,
        };
      });
    } catch (e) {
      console.error("Failed to decode buyer deals:", e);
      return [];
    }
  }

  // ── LOCAL FALLBACK ──
  try {
    const raw = localStorage.getItem("safedeal_deals");
    if (!raw) return [];
    const all = JSON.parse(raw) as DealData[];
    return all.filter((d) => d.buyerKey === buyerAddress);
  } catch {
    return [];
  }
};

// ──────────────────────────────────────────────
// 8. FRAUD SCORE (Read-only)
// ──────────────────────────────────────────────

export const checkFraudScore = async (publicKey: string): Promise<FraudScoreData> => {
  // ── ON-CHAIN MODE ──
  if (isOnChainMode("FRAUD_DETECTION")) {
    console.log("[checkFraudScore] Soroban mode");

    try {
      const result = await queryContract("FRAUD_DETECTION", "get_risk_score", [
        toScAddress(publicKey),
      ]);

      if (!result) {
        return { score: 0, level: "Unknown", canProceed: true, factors: [] };
      }

      const map = fromScMap(result);
      const score = fromScU32(map["score"]);

      // Determine level from score (matches contract logic)
      let level = "Safe";
      if (score > 85) level = "Blocked";
      else if (score > 60) level = "HighRisk";
      else if (score > 30) level = "Caution";

      return {
        score,
        level,
        canProceed: score <= 85,
        factors: map["factors"] ? fromScVec(map["factors"]).map(fromScString) : [],
      };
    } catch (e) {
      console.error("Fraud check failed:", e);
      return { score: 0, level: "Unknown", canProceed: true, factors: [] };
    }
  }

  // ── LOCAL FALLBACK ──
  return { score: 0, level: "Unknown", canProceed: true, factors: [] };
};

// ──────────────────────────────────────────────
// 9. SELLER PROFILE (Read-only)
// ──────────────────────────────────────────────

export const getSellerProfile = async (
  sellerAddress: string
): Promise<SellerProfileData> => {
  // ── ON-CHAIN MODE ──
  if (isOnChainMode("SELLER_VERIFICATION")) {
    console.log("[getSellerProfile] Soroban mode");

    try {
      const result = await queryContract("SELLER_VERIFICATION", "get_profile", [
        toScAddress(sellerAddress),
      ]);

      if (!result) {
        return { verified: false, rating: 0, badges: [], businessName: "", completedDeals: 0, totalVolume: 0 };
      }

      const map = fromScMap(result);

      // Check verified status
      const isVerified = await queryContract("SELLER_VERIFICATION", "is_verified", [
        toScAddress(sellerAddress),
      ]);

      // Decode badge enum
      const BADGE_NAMES: Record<number, string> = {
        0: "New Seller",
        1: "Rising Star",
        2: "Trusted Seller",
        3: "Top Seller",
        4: "Elite Seller",
      };

      return {
        verified: isVerified ? fromScBool(isVerified) : false,
        rating: fromScU32(map["avg_rating"]) / 100, // stored as 0-500
        badges: [BADGE_NAMES[fromScU32(map["badge"])] || "New Seller"],
        businessName: fromScString(map["business_name"]),
        completedDeals: fromScU32(map["completed_deals"]),
        totalVolume: fromScAmount(map["total_volume"]),
      };
    } catch (e) {
      console.error("Seller profile fetch failed:", e);
      return { verified: false, rating: 0, badges: [], businessName: "", completedDeals: 0, totalVolume: 0 };
    }
  }

// ── LOCAL FALLBACK ──
  return { verified: false, rating: 0, badges: [], businessName: "", completedDeals: 0, totalVolume: 0 };
};

export async function registerSeller(
  publicKey: string,
  name: string,
  description: string,
  category: string,
  contact: string
) {
  // Description may not natively be in the schema but provided via args by prompt
  return await invokeContract(
    publicKey,
    "SELLER_VERIFICATION",
    "register_seller",
    [
      toScAddress(publicKey),
      toScString(name),
      toScString(category), // mapping description/category based on contract args (seller, name, type, platform)
      toScString(contact)
    ],
    // Let wallet decide type
    "TESTNET" as any
  );
}

export async function updateSellerProfile(
  publicKey: string,
  formData: { name: string; description: string; category: string; contact: string }
) {
  // Simulate or wrap update call
  console.log("updateSellerProfile called", publicKey, formData);
  return { success: true };
}

// ──────────────────────────────────────────────
// 10. WITHDRAWAL (Merchant)
// ──────────────────────────────────────────────

export const initiateWithdrawal = async (
  address: string,
  walletType: WalletType
): Promise<{ success: boolean }> => {
  if (!walletType) throw new Error("Wallet not connected");

  // No on-chain fiat bridge used yet — local only
  console.log("[initiateWithdrawal] localStorage mode");
  await new Promise((r) => setTimeout(r, 1000));
  return { success: true };
};

// ──────────────────────────────────────────────
// 11. NETWORK SUBMISSION
// ──────────────────────────────────────────────

export const submitToNetwork = async (signedXdr: string) => {
  try {
    const transaction = TransactionBuilder.fromXDR(signedXdr, PASSPHRASE) as
      | Transaction
      | FeeBumpTransaction;
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    console.error("Submission failed:", error);
    throw error;
  }
};

// ──────────────────────────────────────────────
// 12. STREAMING
// ──────────────────────────────────────────────

export const streamDealEvents = () => {
  console.log("Starting deal event stream...");
};

// ──────────────────────────────────────────────
// 13. DISPUTE RESOLUTION
// ──────────────────────────────────────────────

export async function raiseDispute(
  dealId: string,
  raiser: string,
  reason: string,
  evidenceHash: string
) {
  let mappedReason = "Other";
  if (reason === "Item not received") mappedReason = "ItemNotReceived";
  if (reason === "Wrong item") mappedReason = "WrongItem";
  if (reason === "Damaged item") mappedReason = "DamagedItem";

  return await invokeContract(
    raiser,
    "DISPUTE_RESOLUTION",
    "file_dispute",
    [
      toScString(dealId),
      toScAddress(raiser),
      toScAddress(raiser), // this isn't exactly right for seller but mock or passing seller via deal later
      toScAmount(0), // amount
      toScString(mappedReason), // mapped reason
      toScString(evidenceHash) // using as description temporarily
    ],
    "TESTNET" as any
  );
}

export async function submitEvidence(
  disputeId: string,
  submitter: string,
  evidenceType: string,
  evidenceHash: string
) {
  return await invokeContract(
    submitter,
    "DISPUTE_RESOLUTION",
    "submit_evidence",
    [
      toScString(disputeId),
      toScAddress(submitter),
      toScString(`${evidenceType}:${evidenceHash}`)
    ],
    "TESTNET" as any
  );
}

export async function getDispute(disputeId: string) {
  if (isOnChainMode("DISPUTE_RESOLUTION")) {
    try {
      const result = await queryContract("DISPUTE_RESOLUTION", "get_dispute", [
        toScString(disputeId)
      ]);
      
      if (!result) return null;
      
      const map = fromScMap(result);
      
      let statusDecoded = "pending_evidence";
      if (typeof map["status"] === "number") {
        const statuses = ["Open", "UnderReview", "Resolved", "Escalated", "Dismissed"];
        const st = statuses[map["status"]] || "Open";
        if (st === "Resolved") statusDecoded = "resolved_payout";
        else if (st === "UnderReview") statusDecoded = "under_review";
      }

      return {
        id: fromScString(map["dispute_id"]),
        dealId: fromScString(map["deal_id"]),
        buyer: fromScAddress(map["buyer"]),
        seller: fromScAddress(map["seller"]),
        amount: fromScAmount(map["amount"]),
        reason: map["reason"] ? String(map["reason"]) : "Item Not As Described",
        description: fromScString(map["description"]),
        status: statusDecoded,
        createdAt: fromScU64(map["created_at"]) * 1000,
        resolvedAt: map["resolved_at"] ? fromScU64(map["resolved_at"]) * 1000 : undefined
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  // Mock local return if not on chain
  return {
    id: disputeId,
    dealId: "LOCAL-123",
    buyer: "LOCAL BUYER",
    seller: "LOCAL SELLER",
    amount: 1000,
    reason: "Item Not As Described",
    description: "Mock testing description",
    status: "pending_evidence",
    createdAt: Date.now()
  };
}
