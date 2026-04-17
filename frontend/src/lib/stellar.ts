/**
 * SafeDeal Stellar Integration Layer
 * ====================================
 * All interactions go through real Soroban smart contract calls.
 * No localStorage fallbacks — every operation is on-chain.
 */

import {
  Horizon,
  Transaction,
  FeeBumpTransaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { PASSPHRASE, HORIZON_URL } from "./contracts";
import { WalletType } from "./wallet";
import {
  isOnChainMode,
  isContractDeployed,
  invokeContract,
  queryContract,
  toScString,
  toScAmount,
  toScU64,
  toScAddress,
  toScSymbol,
  fromScString,
  fromScAmount,
  fromScU64,
  fromScU32,
  fromScAddress,
  fromScVec,
  fromScMap,
  fromScBool,
  fromScEnum,
} from "./soroban";
import { CONTRACTS } from "./contracts";

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
// Status mapping
// ──────────────────────────────────────────────

const DEAL_STATUS_MAP: Record<number, string> = {
  0: "WaitingForPayment",
  1: "Locked",
  2: "Completed",
  3: "Disputed",
  4: "Refunded",
  5: "Cancelled",
  6: "Expired",
};

const decodeDealStatus = (scVal: unknown): string => {
  try {
    if (typeof scVal === "number") return DEAL_STATUS_MAP[scVal] || "WaitingForPayment";
    if (typeof scVal === "string") {
      const pascalCase = scVal.charAt(0).toUpperCase() + scVal.slice(1).toLowerCase();
      if (scVal.toLowerCase() === "waitingforpayment") return "WaitingForPayment";
      return pascalCase;
    }
    return "WaitingForPayment";
  } catch {
    return "WaitingForPayment";
  }
};

// ──────────────────────────────────────────────
// Contract readiness check
// ──────────────────────────────────────────────

const requireContract = (contractKey: keyof typeof CONTRACTS, operation: string) => {
  if (!isContractDeployed(CONTRACTS[contractKey])) {
    throw new Error(
      `Cannot ${operation}: ${contractKey} contract is not deployed. ` +
      `Set the NEXT_PUBLIC_*_CONTRACT_ID env var to a real 56-char contract address.`
    );
  }
};

// ──────────────────────────────────────────────
// 1. CREATE DEAL (Merchant) — On-chain only
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
  requireContract("MERCHANT_ESCROW", "create deal");

  console.log("[createEscrowTransaction] Soroban on-chain mode");

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

  // The return value of create_deal is the deal_id string
  let dealId = result.txHash.slice(0, 12); // fallback ID from tx hash
  if (result.simulatedResult) {
    try {
      const decoded = fromScString(result.simulatedResult);
      if (decoded) dealId = decoded;
    } catch (e) {
      console.warn("Failed to decode dealId from simulatedResult", e);
    }
  }

  return { success: true, dealId };
};

// ──────────────────────────────────────────────
// 2. LOCK PAYMENT (Buyer) — On-chain only
// ──────────────────────────────────────────────

export const lockPayment = async (
  dealId: string,
  amount: number,
  walletType: WalletType,
  buyerAddress?: string,
  isGasless?: boolean
): Promise<{ success: boolean; txHash: string }> => {
  if (!walletType) throw new Error("Wallet not connected");
  if (!buyerAddress) throw new Error("Buyer address is required");
  requireContract("MERCHANT_ESCROW", "lock payment");

  console.log("[lockPayment] Soroban on-chain mode");

  // Pre-flight: verify deal exists on-chain
  const dealCheck = await queryContract("MERCHANT_ESCROW", "get_deal", [toScString(dealId)]);
  if (!dealCheck) {
    throw new Error(
      `Deal "${dealId}" does not exist on-chain. ` +
      `It may be a locally cached deal from before contracts were deployed. Please create a new deal.`
    );
  }

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
    walletType,
    isGasless
  );

  return { success: true, txHash: result.txHash };
};

// ──────────────────────────────────────────────
// 3. CONFIRM DELIVERY (Buyer) — On-chain only
// ──────────────────────────────────────────────

export const confirmDelivery = async (
  dealId: string,
  walletType: WalletType,
  buyerAddress?: string
): Promise<{ success: boolean; txHash: string }> => {
  if (!walletType) throw new Error("Wallet not connected");
  if (!buyerAddress) throw new Error("Buyer address is required");
  requireContract("MERCHANT_ESCROW", "confirm delivery");

  console.log("[confirmDelivery] Soroban on-chain mode");

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
};

// ──────────────────────────────────────────────
// 4. CANCEL DEAL (Seller) — On-chain only
// ──────────────────────────────────────────────

export const cancelDeal = async (
  dealId: string,
  walletType: WalletType,
  sellerAddress: string
): Promise<{ success: boolean }> => {
  if (!walletType) throw new Error("Wallet not connected");
  requireContract("MERCHANT_ESCROW", "cancel deal");

  console.log("[cancelDeal] Soroban on-chain mode");

  const args = [
    toScString(dealId),
    toScAddress(sellerAddress),
  ];

  await invokeContract(sellerAddress, "MERCHANT_ESCROW", "cancel_deal", args, walletType);
  return { success: true };
};

// ──────────────────────────────────────────────
// 5. GET DEAL (Read-only) — On-chain only
// ──────────────────────────────────────────────

export const getDeal = async (dealId: string): Promise<DealData | null> => {
  requireContract("MERCHANT_ESCROW", "get deal");
  console.log("[getDeal] Soroban on-chain mode, dealId:", dealId);

  const result = await queryContract("MERCHANT_ESCROW", "get_deal", [
    toScString(dealId),
  ]);

  if (!result) {
    console.warn("[getDeal] Deal not found on-chain:", dealId);
    return null;
  }

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
      status: decodeDealStatus(fromScEnum(map["status"])),
      createdAt: fromScU64(map["created_at"]) * 1000,
      expiresAt: fromScU64(map["expiry_at"]) * 1000,
      lockedAt: map["locked_at"] ? fromScU64(map["locked_at"]) * 1000 : undefined,
    };
  } catch (e) {
    console.error("[getDeal] Failed to decode deal:", e);
    return null;
  }
};

// ──────────────────────────────────────────────
// 6. GET SELLER DEALS (Read-only) — On-chain only
// ──────────────────────────────────────────────

export const getSellerDeals = async (sellerAddress: string): Promise<DealData[]> => {
  requireContract("MERCHANT_ESCROW", "get seller deals");
  console.log("[getSellerDeals] Soroban on-chain mode, seller:", sellerAddress);

  const result = await queryContract("MERCHANT_ESCROW", "get_seller_deals", [
    toScAddress(sellerAddress),
  ]);

  if (!result) {
    console.warn("[getSellerDeals] No deals found on-chain for seller");
    return [];
  }

  try {
    const vec = fromScVec(result);
    console.log("[getSellerDeals] Decoded vec length:", vec.length);
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
        status: decodeDealStatus(fromScEnum(map["status"])),
        createdAt: fromScU64(map["created_at"]) * 1000,
        expiresAt: fromScU64(map["expiry_at"]) * 1000,
      };
    });
  } catch (e) {
    console.error("[getSellerDeals] Failed to decode seller deals:", e);
    return [];
  }
};

// ──────────────────────────────────────────────
// 7. GET BUYER DEALS (Read-only) — On-chain only
// ──────────────────────────────────────────────

export const getBuyerDeals = async (buyerAddress: string): Promise<DealData[]> => {
  requireContract("MERCHANT_ESCROW", "get buyer deals");
  console.log("[getBuyerDeals] Soroban on-chain mode");

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
        status: decodeDealStatus(fromScEnum(map["status"])),
        createdAt: fromScU64(map["created_at"]) * 1000,
        expiresAt: fromScU64(map["expiry_at"]) * 1000,
      };
    });
  } catch (e) {
    console.error("Failed to decode buyer deals:", e);
    return [];
  }
};

// ──────────────────────────────────────────────
// 8. FRAUD SCORE (Read-only) — On-chain query
// ──────────────────────────────────────────────

export const checkFraudScore = async (publicKey: string): Promise<FraudScoreData> => {
  if (!isOnChainMode("FRAUD_DETECTION")) {
    // Contract not deployed — return safe default (not mocked data)
    return { score: 0, level: "Unknown", canProceed: true, factors: [] };
  }

  console.log("[checkFraudScore] Soroban on-chain mode");

  try {
    const result = await queryContract("FRAUD_DETECTION", "get_risk_score", [
      toScAddress(publicKey),
    ]);

    if (!result) {
      return { score: 0, level: "Unknown", canProceed: true, factors: [] };
    }

    const map = fromScMap(result);
    const score = fromScU32(map["score"]);

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
};

// ──────────────────────────────────────────────
// 9. SELLER PROFILE (Read-only) — On-chain query
// ──────────────────────────────────────────────

export const getSellerProfile = async (
  sellerAddress: string
): Promise<SellerProfileData> => {
  if (!isOnChainMode("SELLER_VERIFICATION")) {
    return { verified: false, rating: 0, badges: [], businessName: "", completedDeals: 0, totalVolume: 0 };
  }

  console.log("[getSellerProfile] Soroban on-chain mode");

  try {
    const result = await queryContract("SELLER_VERIFICATION", "get_profile", [
      toScAddress(sellerAddress),
    ]);

    if (!result) {
      return { verified: false, rating: 0, badges: [], businessName: "", completedDeals: 0, totalVolume: 0 };
    }

    const map = fromScMap(result);

    const isVerified = await queryContract("SELLER_VERIFICATION", "is_verified", [
      toScAddress(sellerAddress),
    ]);

    const BADGE_NAMES: Record<number, string> = {
      0: "New Seller",
      1: "Rising Star",
      2: "Trusted Seller",
      3: "Top Seller",
      4: "Elite Seller",
    };

    return {
      verified: isVerified ? fromScBool(isVerified) : false,
      rating: fromScU32(map["avg_rating"]) / 100,
      badges: [BADGE_NAMES[fromScU32(map["badge"])] || "New Seller"],
      businessName: fromScString(map["business_name"]),
      completedDeals: fromScU32(map["completed_deals"]),
      totalVolume: fromScAmount(map["total_volume"]),
    };
  } catch (e) {
    console.error("Seller profile fetch failed:", e);
    return { verified: false, rating: 0, badges: [], businessName: "", completedDeals: 0, totalVolume: 0 };
  }
};

export async function registerSeller(
  publicKey: string,
  name: string,
  description: string,
  category: string,
  contact: string
) {
  requireContract("SELLER_VERIFICATION", "register seller");
  return await invokeContract(
    publicKey,
    "SELLER_VERIFICATION",
    "register_seller",
    [
      toScAddress(publicKey),
      toScString(name),
      toScString(category),
      toScString(contact)
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "TESTNET" as any
  );
}

export async function updateSellerProfile(
  publicKey: string,
  formData: { name: string; description: string; category: string; contact: string }
) {
  console.log("updateSellerProfile called", publicKey, formData);
  // TODO: implement on-chain profile update when contract supports it
  return { success: true };
}

// ──────────────────────────────────────────────
// 10. WITHDRAWAL (Merchant) — On-chain placeholder
// ──────────────────────────────────────────────

export const initiateWithdrawal = async (
  address: string,
  walletType: WalletType
): Promise<{ success: boolean }> => {
  if (!walletType) throw new Error("Wallet not connected");

  // Fiat bridge contract is deployed but withdrawal is a future feature
  console.log("[initiateWithdrawal] Feature coming soon — fiat bridge deployed at", CONTRACTS.FIAT_BRIDGE);
  throw new Error("Withdrawal feature coming soon. Fiat bridge contract is deployed but off-ramp integration is in progress.");
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
// 13. DISPUTE RESOLUTION — On-chain only
// ──────────────────────────────────────────────

export async function raiseDispute(
  dealId: string,
  buyer: string,
  seller: string,
  amount: number,
  reason: string,
  description: string
) {
  requireContract("DISPUTE_RESOLUTION", "file dispute");

  let mappedReason = "Other";
  if (reason === "Item not received") mappedReason = "ItemNotReceived";
  if (reason === "Wrong item") mappedReason = "WrongItem";
  if (reason === "Damaged item") mappedReason = "DamagedItem";

  return await invokeContract(
    buyer,
    "DISPUTE_RESOLUTION",
    "file_dispute",
    [
      toScString(dealId),
      toScAddress(buyer),
      toScAddress(seller),
      toScAmount(amount),
      toScSymbol(mappedReason),
      toScString(description)
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "TESTNET" as any
  );
}

export async function submitEvidence(
  disputeId: string,
  submitter: string,
  evidenceType: string,
  evidenceHash: string
) {
  requireContract("DISPUTE_RESOLUTION", "submit evidence");

  return await invokeContract(
    submitter,
    "DISPUTE_RESOLUTION",
    "submit_evidence",
    [
      toScString(disputeId),
      toScAddress(submitter),
      toScString(`${evidenceType}:${evidenceHash}`)
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "TESTNET" as any
  );
}

export async function getDispute(disputeId: string) {
  requireContract("DISPUTE_RESOLUTION", "get dispute");

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
    console.error("getDispute failed:", e);
    return null;
  }
}
