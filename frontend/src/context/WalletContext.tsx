"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  connectFreighter, 
  connectAlbedo, 
  getBalances, 
  WalletType,
  signTransaction as signTx
} from "@/lib/wallet";
import { checkFraudScore } from "@/lib/stellar";
import { toast } from "sonner";

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  xlmBalance: string;
  usdcBalance: string;
  fraudScore: number;
  fraudLevel: string;
  walletType: WalletType;
  connectFreighter: () => Promise<void>;
  connectAlbedo: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [xlmBalance, setXlmBalance] = useState("0");
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [fraudScore, setFraudScore] = useState(0);
  const [fraudLevel, setFraudLevel] = useState("Unknown");

  const isConnected = !!publicKey;

  const refreshBalance = useCallback(async () => {
    if (publicKey) {
      const balances = await getBalances(publicKey);
      setXlmBalance(balances.xlmBalance);
      setUsdcBalance(balances.usdcBalance);
      
      // Perform silent AI fraud check
      const fraud = await checkFraudScore(publicKey);
      setFraudScore(fraud.score);
      setFraudLevel(fraud.level);
    }
  }, [publicKey]);

  useEffect(() => {
    // Load local storage session
    const storedKey = localStorage.getItem("safedeal_pubkey");
    const storedType = localStorage.getItem("safedeal_wallet_type") as WalletType;
    
    if (storedKey && storedType) {
      setPublicKey(storedKey);
      setWalletType(storedType);
    }
  }, []);

  useEffect(() => {
    if (publicKey) {
      refreshBalance();
      // Auto refresh every 30 seconds
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [publicKey, refreshBalance]);

  const handleConnectFreighter = async () => {
    try {
      const { publicKey, walletType } = await connectFreighter();
      setPublicKey(publicKey);
      setWalletType(walletType);
      localStorage.setItem("safedeal_pubkey", publicKey);
      localStorage.setItem("safedeal_wallet_type", walletType);
      document.cookie = `safedeal_pubkey=${publicKey}; path=/; max-age=604800; samesite=lax`;
      toast.success("Wallet connected via Freighter");
      
      // Initial fraud check
      const fraud = await checkFraudScore(publicKey);
      if (fraud.level === "Blocked") {
        toast.error("Wallet blocked due to high risk score");
        disconnect();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect Freighter";
      toast.error(message);
      throw error; // re-throw so WalletModal can catch it
    }
  };

  const handleConnectAlbedo = async () => {
    try {
      const { publicKey, walletType } = await connectAlbedo();
      setPublicKey(publicKey);
      setWalletType(walletType);
      localStorage.setItem("safedeal_pubkey", publicKey);
      localStorage.setItem("safedeal_wallet_type", walletType);
      document.cookie = `safedeal_pubkey=${publicKey}; path=/; max-age=604800; samesite=lax`;
      toast.success("Wallet connected via Albedo");

      // Initial fraud check
      const fraud = await checkFraudScore(publicKey);
      if (fraud.level === "Blocked") {
        toast.error("Wallet blocked due to high risk score");
        disconnect();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect Albedo";
      toast.error(message);
      throw error; // re-throw so WalletModal can catch it
    }
  };

  const disconnect = () => {
    setPublicKey(null);
    setWalletType(null);
    setXlmBalance("0");
    setUsdcBalance("0");
    setFraudScore(0);
    setFraudLevel("Unknown");
    localStorage.removeItem("safedeal_pubkey");
    localStorage.removeItem("safedeal_wallet_type");
    document.cookie = "safedeal_pubkey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    toast.info("Wallet disconnected");
  };

  const signTransaction = async (xdr: string) => {
    return await signTx(xdr, walletType);
  };

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected,
        xlmBalance,
        usdcBalance,
        fraudScore,
        fraudLevel,
        walletType,
        connectFreighter: handleConnectFreighter,
        connectAlbedo: handleConnectAlbedo,
        disconnect,
        refreshBalance,
        signTransaction
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
