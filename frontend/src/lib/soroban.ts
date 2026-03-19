/**
 * SafeDeal Soroban Client
 * =======================
 * Low-level RPC helpers for invoking Soroban smart contracts on Stellar Testnet.
 * Used by stellar.ts to build, simulate, and submit contract transactions.
 */

import {
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  xdr,
  nativeToScVal,
  Keypair,
} from "@stellar/stellar-sdk";
import { CONTRACTS, RPC_URL, PASSPHRASE } from "./contracts";
import { signTransaction, WalletType } from "./wallet";

// ─────────────────────────────────────────────
// Soroban RPC Server
// ─────────────────────────────────────────────

const rpcServer = new rpc.Server(RPC_URL);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Check if a contract ID looks real (starts with C and is 56 chars)
 * Placeholder IDs like "CCBA..." are 7 chars, so they fail this check
 */
export const isContractDeployed = (contractId: string): boolean => {
  return contractId.length === 56 && contractId.startsWith("C");
};

/**
 * Check if we should use on-chain mode for a given contract
 */
export const isOnChainMode = (contractKey: keyof typeof CONTRACTS): boolean => {
  return isContractDeployed(CONTRACTS[contractKey]);
};

/**
 * Convert a JS string to Soroban String ScVal
 */
export const toScString = (str: string): xdr.ScVal => {
  return nativeToScVal(str, { type: "string" });
};

/**
 * Convert a JS number to Soroban i128 ScVal (for USDC amounts in stroops)
 * 1 USDC = 10_000_000 stroops
 */
export const toScAmount = (usdcAmount: number): xdr.ScVal => {
  const stroops = BigInt(Math.round(usdcAmount * 10_000_000));
  return nativeToScVal(stroops, { type: "i128" });
};

/**
 * Convert a JS number to Soroban u64 ScVal
 */
export const toScU64 = (num: number): xdr.ScVal => {
  return nativeToScVal(num, { type: "u64" });
};

/**
 * Convert an Address string to Soroban Address ScVal
 */
export const toScAddress = (address: string): xdr.ScVal => {
  return new Address(address).toScVal();
};

// ─────────────────────────────────────────────
// Contract Client Builders
// ─────────────────────────────────────────────

export const getEscrowContract = () => new Contract(CONTRACTS.MERCHANT_ESCROW);
export const getFraudContract = () => new Contract(CONTRACTS.FRAUD_DETECTION);
export const getDisputeContract = () => new Contract(CONTRACTS.DISPUTE_RESOLUTION);
export const getVerifyContract = () => new Contract(CONTRACTS.SELLER_VERIFICATION);
export const getFiatBridgeContract = () => new Contract(CONTRACTS.FIAT_BRIDGE);

// ─────────────────────────────────────────────
// Core: Build, Simulate, Sign, Submit
// ─────────────────────────────────────────────

/**
 * Build a Soroban contract invocation transaction
 */
export const buildContractTx = async (
  sourcePublicKey: string,
  contract: Contract,
  method: string,
  args: xdr.ScVal[]
): Promise<TransactionBuilder> => {
  const account = await rpcServer.getAccount(sourcePublicKey);

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: PASSPHRASE || Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(300); // 5 minutes timeout to ensure users have enough time to sign

  return builder;
};

/**
 * Simulate a transaction to get gas estimate and prepare it
 */
export const simulateAndPrepare = async (
  builder: TransactionBuilder
): Promise<{ preparedXdr: string; simulatedResult?: xdr.ScVal }> => {
  const tx = builder.build();

  const simResponse = await rpcServer.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simResponse)) {
    const errorMsg =
      "error" in simResponse
        ? String(simResponse.error)
        : "Simulation failed";
    throw new Error(`Contract simulation error: ${errorMsg}`);
  }

  // Add a 20% margin to the fee to prevent tx_insufficient_fee due to ledger fluctuations
  if (rpc.Api.isSimulationSuccess(simResponse) && simResponse.minResourceFee) {
    const feeWithMargin = (BigInt(simResponse.minResourceFee) * BigInt(120)) / BigInt(100);
    simResponse.minResourceFee = feeWithMargin.toString();
  }

  // Prepare the transaction with the simulation result
  const preparedTx = rpc.assembleTransaction(tx, simResponse);
  
  // Extract simulated result if successful
  let simulatedResult: xdr.ScVal | undefined;
  if (rpc.Api.isSimulationSuccess(simResponse) && simResponse.result) {
    simulatedResult = simResponse.result.retval;
  }

  return { preparedXdr: preparedTx.build().toXDR(), simulatedResult };
};

/**
 * Sign and submit a prepared transaction XDR
 * Returns the transaction hash on success
 */
export const signAndSubmit = async (
  preparedXdr: string,
  walletType: WalletType,
  sourcePublicKey: string
): Promise<{ txHash: string; resultXdr: string }> => {
  // 1. Sign with the user's wallet
  const signedXdr = await signTransaction(preparedXdr, walletType, PASSPHRASE, sourcePublicKey);

  // 2. Submit to network
  const tx = TransactionBuilder.fromXDR(signedXdr, PASSPHRASE);
  const sendResponse = await rpcServer.sendTransaction(tx);

  if (sendResponse.status === "ERROR") {
    console.error(`Transaction submission failed. Status: ${sendResponse.status}, Hash: ${sendResponse.hash}`);
    let errName = "UNKNOWN";
    let rawXdr = "";
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyRes = sendResponse as any;
    
    if (sendResponse.errorResult) {
      try {
        errName = sendResponse.errorResult.result().switch().name;
        rawXdr = sendResponse.errorResult.toXDR("base64");
      } catch {
        errName = "PARSE_ERROR";
      }
    } else if (anyRes.errorResultXdr) {
      rawXdr = anyRes.errorResultXdr;
    }
    
    throw new Error(`Transaction Rejected by Network: ${errName}. Details: ${rawXdr}`);
  }

  // 3. Poll for result
  const txHash = sendResponse.hash;
  let getResponse = await rpcServer.getTransaction(txHash);
  
  // Poll every 2s for up to 30s
  const maxAttempts = 15;
  for (let i = 0; i < maxAttempts && getResponse.status === "NOT_FOUND"; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    getResponse = await rpcServer.getTransaction(txHash);
  }

  if (getResponse.status === "SUCCESS") {
    return {
      txHash,
      resultXdr: getResponse.resultMetaXdr?.toXDR("base64") || "",
    };
  }

  throw new Error(
    `Transaction failed with status: ${getResponse.status}`
  );
};

/**
 * Full flow: build → simulate → sign → submit
 * Returns the transaction hash and decoded return value
 */
export const invokeContract = async (
  sourcePublicKey: string,
  contractKey: keyof typeof CONTRACTS,
  method: string,
  args: xdr.ScVal[],
  walletType: WalletType
): Promise<{ txHash: string; resultXdr: string; simulatedResult?: xdr.ScVal }> => {
  const contractId = CONTRACTS[contractKey];
  if (!isContractDeployed(contractId)) {
    throw new Error(
      `Contract ${contractKey} is not deployed. Set ${contractKey} env var to a real contract ID.`
    );
  }

  const contract = new Contract(contractId);
  const builder = await buildContractTx(sourcePublicKey, contract, method, args);
  const { preparedXdr, simulatedResult } = await simulateAndPrepare(builder);
  const { txHash, resultXdr } = await signAndSubmit(preparedXdr, walletType, sourcePublicKey);
  return { txHash, resultXdr, simulatedResult };
};

/**
 * Read-only contract call (no signing, no submission)
 * Used for get_deal, get_seller_deals, etc.
 */
export const queryContract = async (
  contractKey: keyof typeof CONTRACTS,
  method: string,
  args: xdr.ScVal[]
): Promise<xdr.ScVal | null> => {
  const contractId = CONTRACTS[contractKey];
  if (!isContractDeployed(contractId)) {
    return null;
  }

  const contract = new Contract(contractId);

  // Use a random source for read-only calls
  const randomSource = Keypair.random().publicKey();
  
  try {
    const account = await rpcServer.getAccount(randomSource);
    
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: PASSPHRASE || Networks.TESTNET,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const simResponse = await rpcServer.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(simResponse)) {
      return null;
    }

    if (
      rpc.Api.isSimulationSuccess(simResponse) &&
      simResponse.result
    ) {
      return simResponse.result.retval;
    }

    return null;
  } catch {
    // Read-only call can fail if account doesn't exist; 
    // use a funded source instead
    return null;
  }
};

// ─────────────────────────────────────────────
// ScVal Decoders
// ─────────────────────────────────────────────

/**
 * Decode a Soroban String ScVal to JS string
 */
export const fromScString = (val: xdr.ScVal): string => {
  if (val.switch().value === xdr.ScValType.scvString().value) {
    return val.str().toString();
  }
  if (val.switch().value === xdr.ScValType.scvSymbol().value) {
    return val.sym().toString();
  }
  return "";
};

/**
 * Decode a Soroban i128 ScVal to JS number (USDC amount)
 */
export const fromScAmount = (val: xdr.ScVal): number => {
  try {
    if (val.switch().value === xdr.ScValType.scvI128().value) {
      const i128Parts = val.i128();
      const lo = BigInt(i128Parts.lo().toString());
      const hi = BigInt(i128Parts.hi().toString());
      const stroops = (hi << BigInt(64)) | lo;
      return Number(stroops) / 10_000_000;
    }
    return 0;
  } catch {
    return 0;
  }
};

/**
 * Decode a Soroban u64 ScVal to JS number
 */
export const fromScU64 = (val: xdr.ScVal): number => {
  try {
    if (val.switch().value === xdr.ScValType.scvU64().value) {
      return Number(val.u64().toString());
    }
    return 0;
  } catch {
    return 0;
  }
};

/**
 * Decode a Soroban u32 ScVal to JS number
 */
export const fromScU32 = (val: xdr.ScVal): number => {
  try {
    if (val.switch().value === xdr.ScValType.scvU32().value) {
      return val.u32();
    }
    return 0;
  } catch {
    return 0;
  }
};

/**
 * Decode a Soroban Address ScVal to string
 */
export const fromScAddress = (val: xdr.ScVal): string => {
  try {
    return Address.fromScVal(val).toString();
  } catch {
    return "";
  }
};

/**
 * Decode a Soroban Bool ScVal
 */
export const fromScBool = (val: xdr.ScVal): boolean => {
  try {
    return val.b();
  } catch {
    return false;
  }
};

/**
 * Decode a Soroban Map ScVal to JS object
 */
export const fromScMap = (val: xdr.ScVal): Record<string, xdr.ScVal> => {
  const result: Record<string, xdr.ScVal> = {};
  try {
    if (val.switch().value === xdr.ScValType.scvMap().value) {
      const entries = val.map();
      if (entries) {
        for (const entry of entries) {
          const key = fromScString(entry.key()) || entry.key().switch().name;
          result[key] = entry.val();
        }
      }
    }
  } catch {
    // ignore
  }
  return result;
};

/**
 * Decode a Soroban Vec ScVal to array of ScVal
 */
export const fromScVec = (val: xdr.ScVal): xdr.ScVal[] => {
  try {
    if (val.switch().value === xdr.ScValType.scvVec().value) {
      return val.vec() || [];
    }
    return [];
  } catch {
    return [];
  }
};

/**
 * Decode a Soroban Enum ScVal into string variant name or u32
 */
export const fromScEnum = (val: xdr.ScVal): string | number => {
  try {
    const sw = val.switch().value;
    if (sw === xdr.ScValType.scvU32().value) return val.u32();
    if (sw === xdr.ScValType.scvSymbol().value) return val.sym().toString();
    if (sw === xdr.ScValType.scvVec().value) {
      const vec = val.vec();
      if (vec && vec.length > 0) return fromScEnum(vec[0]); // recursive for first element
    }
    return 0; // default
  } catch {
    return 0;
  }
};
