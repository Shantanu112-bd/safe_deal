import { 
  Horizon, 
  TransactionBuilder, 
  Transaction,
  FeeBumpTransaction
} from "@stellar/stellar-sdk";
import { PASSPHRASE } from "./contracts";
import { WalletType } from "./wallet";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

/**
 * Creates a new deal on-chain (merchant-escrow contract)
 */
export const createEscrowTransaction = async (
  merchantAddress: string,
  amount: number,
  expiryHours: number,
  walletType: WalletType,
  meta?: { itemName?: string; description?: string; category?: string }
): Promise<{ success: boolean; dealId: string }> => {
  // ─────────────────────────────────────────────────────────────
  // LOCAL-FIRST implementation while Soroban contracts are being
  // deployed. Stores deal in localStorage so sharing/testing works
  // end-to-end. Replace the body with an actual Soroban invocation
  // once NEXT_PUBLIC_MERCHANT_ESCROW_ID is a real deployed contract.
  // ─────────────────────────────────────────────────────────────
  console.log("[createEscrowTransaction] local-storage mode", { merchantAddress, amount, expiryHours, walletType });

  if (!merchantAddress) throw new Error("Wallet not connected");
  if (amount <= 0)       throw new Error("Amount must be greater than 0");

  // Generate a unique deal ID (6 hex chars, collision-free enough for testnet)
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
    status: "waiting",             // Waiting for Payment
    createdAt: Date.now(),
    expiresAt,
  };

  // Persist to localStorage (both merchant list AND deal lookup by ID)
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

/**
 * Helper: update a deal's status in localStorage
 */
const updateDealStatus = (dealId: string, newStatus: string) => {
  try {
    // Update individual deal record
    const raw = localStorage.getItem(`safedeal_deal_${dealId}`);
    if (raw) {
      const deal = JSON.parse(raw);
      deal.status = newStatus;
      localStorage.setItem(`safedeal_deal_${dealId}`, JSON.stringify(deal));
    }
    // Update the deals list
    const listRaw = localStorage.getItem("safedeal_deals");
    if (listRaw) {
      const list = JSON.parse(listRaw) as Array<{ id: string; status: string }>;
      const updated = list.map((d) => (d.id === dealId ? { ...d, status: newStatus } : d));
      localStorage.setItem("safedeal_deals", JSON.stringify(updated));
    }
  } catch (e) {
    console.warn("updateDealStatus localStorage error:", e);
  }
};

/**
 * Buyer locks payment in escrow
 */
export const lockPayment = async (
  dealId: string,
  amount: number,
  walletType: WalletType
): Promise<{ success: boolean; txHash: string }> => {
  // LOCAL-FIRST: Update deal status to "locked" in localStorage
  // TODO: Replace with real Soroban invoke for lock_payment
  console.log("[lockPayment] local-storage mode", { dealId, amount, walletType });

  if (!walletType) throw new Error("Wallet not connected");

  // Simulate a small network delay so the UI loading state feels realistic
  await new Promise((r) => setTimeout(r, 1500));

  updateDealStatus(dealId, "locked");

  const fakeTxHash = `tx_${Date.now().toString(36)}_${dealId}`;
  return { success: true, txHash: fakeTxHash };
};

/**
 * Buyer confirms delivery, releasing funds to merchant
 */
export const confirmDelivery = async (
  dealId: string,
  walletType: WalletType
): Promise<{ success: boolean; txHash: string }> => {
  // LOCAL-FIRST: Update deal status to "completed" in localStorage
  // TODO: Replace with real Soroban invoke for confirm_delivery
  console.log("[confirmDelivery] local-storage mode", { dealId, walletType });

  if (!walletType) throw new Error("Wallet not connected");

  await new Promise((r) => setTimeout(r, 1200));

  updateDealStatus(dealId, "completed");

  const fakeTxHash = `tx_${Date.now().toString(36)}_${dealId}_release`;
  return { success: true, txHash: fakeTxHash };
};

/**
 * Merchant initiates withdrawal of successful deal funds
 */
export const initiateWithdrawal = async (
  address: string,
  walletType: WalletType
): Promise<{ success: boolean }> => {
  // LOCAL-FIRST: Simulated withdrawal
  // TODO: Replace with real Soroban invoke for withdrawal
  console.log("[initiateWithdrawal] local-storage mode", { address, walletType });

  if (!walletType) throw new Error("Wallet not connected");

  await new Promise((r) => setTimeout(r, 1000));

  return { success: true };
};

/**
 * Checks wallet fraud score using the fraud-detection contract
 */
export const checkFraudScore = async (publicKey: string): Promise<{ score: number; level: string }> => {
  try {
    // TODO: Call analyze_wallet on fraud-detection Soroban contract
    console.log("[checkFraudScore] pending Soroban integration for:", publicKey);
    // Return neutral unknown until contract is wired
    return { score: 0, level: "Unknown" };
  } catch (error) {
    console.error("Fraud check failed:", error);
    return { score: 0, level: "Unknown" };
  }
};

/**
 * Fetches seller profile and trust badges from seller-verification contract
 */
export const getSellerProfile = async (merchantId: string): Promise<{ verified: boolean; rating: number; badges: string[] }> => {
  // TODO: Call get_profile on seller-verification Soroban contract
  console.log("[getSellerProfile] pending Soroban integration for:", merchantId);
  return { verified: false, rating: 0, badges: [] };
};

/**
 * Streams real-time deal events from the Stellar network
 */
export const streamDealEvents = () => {
  console.log("Starting deal event stream...");
};

/**
 * Submits a signed transaction to the Stellar network
 */
export const submitToNetwork = async (signedXdr: string) => {
  try {
    const transaction = TransactionBuilder.fromXDR(signedXdr, PASSPHRASE) as Transaction | FeeBumpTransaction;
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    console.error("Submission failed:", error);
    throw error;
  }
};
