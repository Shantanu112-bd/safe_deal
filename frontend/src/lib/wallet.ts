import freighter from "@stellar/freighter-api";
const { isConnected, requestAccess, getAddress, signTransaction: signFreighter } = freighter;
import albedo from "@albedo-link/intent";
import { 
  Horizon 
} from "@stellar/stellar-sdk";

export type WalletType = "freighter" | "albedo" | null;

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

/**
 * Connect to Freighter wallet
 */
export const connectFreighter = async () => {
  if (await isConnected()) {
    // requestAccess pops up the Freighter extension asking the user for authorization!
    const result = await requestAccess();
    if (result.error) {
       throw new Error(result.error);
    }
    const address = typeof result === "string" ? result : result.address || await getAddress().then(r => r.address);
    if (!address) {
       throw new Error("User declined connection");
    }
    return { publicKey: address, walletType: "freighter" as const };
  }
  throw new Error("Freighter not installed. Please install Freighter Extension to connect.");
};

/**
 * Connect to Albedo wallet
 */
export const connectAlbedo = async () => {
  const result = await albedo.publicKey({
    token: "safedeal_connect"
  });
  return { publicKey: result.pubkey, walletType: "albedo" as const };
};

/**
 * Get balances for a public key (XLM and USDC)
 */
export const getBalances = async (publicKey: string) => {
  try {
    const account = await server.loadAccount(publicKey);
    let xlmBalance = "0";
    let usdcBalance = "0";

    for (const balance of account.balances) {
      if (balance.asset_type === "native") {
        xlmBalance = balance.balance;
      } else if ("asset_code" in balance) {
        if (
          balance.asset_code === "USDC" && 
          balance.asset_issuer === "GBBD67IF633SHJY6CIGWSBTEU77OUNMTAOOK7N6A4AKX2HPCY5NQXWVN" // Testnet USDC
        ) {
          usdcBalance = balance.balance;
        }
      }
    }

    return { xlmBalance, usdcBalance };
  } catch (error: any) {
    if (error?.response?.status !== 404) {
      console.error("Error fetching balances:", error);
    }
    return { xlmBalance: "0", usdcBalance: "0" };
  }
};

/**
 * Sign a transaction using the selected wallet
 */
export const signTransaction = async (
  xdr: string, 
  walletType: WalletType,
  networkPassphrase: string = "Test SDF Network ; September 2015",
  publicKey?: string
) => {
  if (walletType === "freighter") {
    const result = await signFreighter(xdr, { 
      networkPassphrase,
      network: "TESTNET",
      address: publicKey
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    if (typeof result === "string") return result;
    if (result && "signedTxXdr" in result) return result.signedTxXdr;
    throw new Error("Failed to sign with Freighter");
  } else if (walletType === "albedo") {
    const result = await albedo.tx({
      xdr,
      network: "testnet"
    });
    return result.signed_envelope_xdr;
  }
  throw new Error("No wallet connected");
};

/**
 * Simple check if wallet is connected (re-verify)
 */
export const isWalletConnected = async (walletType: WalletType) => {
  if (walletType === "freighter") {
    return await isConnected();
  }
  return !!walletType;
};
