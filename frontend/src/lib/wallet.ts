import { isConnected, getAddress, signTransaction } from "@stellar/freighter-api";
import albedo from "@albedo-link/intent";
import * as StellarSdk from "@stellar/stellar-sdk";

export type WalletType = "freighter" | "albedo" | "manual";

export interface WalletState {
  address: string | null;
  type: WalletType | null;
  connected: boolean;
  balance: string;
  inrEquivalent: string;
  riskScore: number | null;
  isBlocked: boolean;
  hasUsdcTrustline: boolean;
  isNewSeller: boolean;
}

const USDC_ASSET_CODE = "USDC";
const USDC_ISSUER = "GBBD67IF64WOYID0G6A2665B3DB3E0A" ; // Example Public Issuer for USDC on Testnet/Mainnet
const MOCK_INR_RATE = 83.50;

// Mock Blocklist
const BLOCKLIST = ["GBLOCK123...", "GSCAMMER..."];

export const checkBlocklist = (address: string): boolean => {
  return BLOCKLIST.includes(address);
};

export const runFraudCheck = async (address: string): Promise<number> => {
  // Simulate a delay for the AI check
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Logic: More than 10 transactions = lower risk, but we mock it
  if (address.startsWith("GB")) return 20; // Low risk
  if (address.startsWith("GC")) return 75; // Medium risk
  return 90; // High risk
};

export const getUsdcBalance = async (address: string): Promise<{ balance: string, hasTrustline: boolean }> => {
  try {
    const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
    const account = await server.loadAccount(address);
    const usdcBalance = account.balances.find(
      (b: any) => b.asset_code === USDC_ASSET_CODE && b.asset_issuer === USDC_ISSUER
    );
    
    if (usdcBalance) {
      return { balance: usdcBalance.balance, hasTrustline: true };
    }
    return { balance: "0.00", hasTrustline: false };
  } catch (error) {
    console.error("Error fetching balance:", error);
    return { balance: "0.00", hasTrustline: false };
  }
};

export const formatINR = (usdc: string | number): string => {
  const amount = typeof usdc === "string" ? parseFloat(usdc) : usdc;
  return (amount * MOCK_INR_RATE).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export const connectFreighter = async (): Promise<string | null> => {
  if (await isConnected()) {
    const { address } = await getAddress();
    return address;
  }
  return null;
};

export const connectAlbedo = async (): Promise<string | null> => {
  try {
    const res = await albedo.publicKey({});
    return res.pubkey;
  } catch (error) {
    console.error("Albedo connection failed:", error);
    return null;
  }
};
