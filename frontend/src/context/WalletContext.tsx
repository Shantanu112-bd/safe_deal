"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WalletState, 
  WalletType, 
  checkBlocklist, 
  runFraudCheck, 
  getUsdcBalance, 
  formatINR,
  connectFreighter,
  connectAlbedo
} from '@/lib/wallet';

interface WalletContextType extends WalletState {
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WalletState>({
    address: null,
    type: null,
    connected: false,
    balance: "0.00",
    inrEquivalent: "0.00",
    riskScore: null,
    isBlocked: false,
    hasUsdcTrustline: true,
    isNewSeller: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async (type: WalletType) => {
    setLoading(true);
    setError(null);
    try {
      let address: string | null = null;
      if (type === 'freighter') {
        address = await connectFreighter();
      } else if (type === 'albedo') {
        address = await connectAlbedo();
      }

      if (address) {
        // 1. Check Blocklist
        if (checkBlocklist(address)) {
          setState(prev => ({ ...prev, isBlocked: true, address, connected: true, type }));
          setLoading(false);
          return;
        }

        // 2. Run Silent Fraud Check
        const riskScore = await runFraudCheck(address);

        // 3. Check Trustline and Balance
        const { balance, hasTrustline } = await getUsdcBalance(address);

        // 4. Mock Seller Status
        const isNewSeller = address.includes("NEW"); // Mock logic

        setState({
          address,
          type,
          connected: true,
          balance,
          inrEquivalent: formatINR(balance),
          riskScore,
          isBlocked: false,
          hasUsdcTrustline: hasTrustline,
          isNewSeller
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setState({
      address: null,
      type: null,
      connected: false,
      balance: "0.00",
      inrEquivalent: "0.00",
      riskScore: null,
      isBlocked: false,
      hasUsdcTrustline: true,
      isNewSeller: false,
    });
  };

  const refreshBalance = async () => {
    if (state.address) {
      const { balance, hasTrustline } = await getUsdcBalance(state.address);
      setState(prev => ({
        ...prev,
        balance,
        inrEquivalent: formatINR(balance),
        hasUsdcTrustline: hasTrustline
      }));
    }
  };

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, refreshBalance, loading, error }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
