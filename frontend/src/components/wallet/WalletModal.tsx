"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { 
  X, 
  Wallet, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { 
    connect, 
    disconnect, 
    connected, 
    address, 
    loading, 
    isBlocked, 
    riskScore, 
    hasUsdcTrustline,
    balance,
    inrEquivalent
  } = useWallet();

  if (!isOpen) return null;

  const getRiskColor = (score: number) => {
    if (score < 40) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (score < 70) return "text-orange-500 bg-orange-50 border-orange-100";
    return "text-red-500 bg-red-50 border-red-100";
  };

  const getRiskLabel = (score: number) => {
    if (score < 40) return "Low Risk ✅";
    if (score < 70) return "Medium Risk ⚠️";
    return "High Risk 🚨";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
      >
        <div className="relative p-8">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="size-5" />
          </button>

          {!connected ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20">
                  <Wallet className="size-8" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Connect Wallet</h2>
                <p className="text-sm text-slate-500">Choose a Stellar wallet to continue to SafeDeal.</p>
              </div>

              <div className="grid gap-3">
                <button 
                  onClick={() => connect('freighter')}
                  className="group flex w-full items-center justify-between rounded-2xl bg-slate-50 px-6 py-5 transition-all hover:bg-slate-900 hover:text-white"
                  disabled={loading}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 group-hover:bg-slate-800 group-hover:ring-slate-700 transition-colors">
                       <img src="https://www.freighter.app/favicon.ico" alt="Freighter" className="size-6" />
                    </div>
                    <span className="font-bold">Freighter Wallet</span>
                  </div>
                  {loading ? <div className="size-5 border-2 border-current border-t-transparent animate-spin rounded-full" /> : <ChevronRight className="size-5 opacity-40" />}
                </button>

                <button 
                  onClick={() => connect('albedo')}
                  className="group flex w-full items-center justify-between rounded-2xl bg-slate-50 px-6 py-5 transition-all hover:bg-slate-900 hover:text-white"
                  disabled={loading}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 group-hover:bg-slate-800 group-hover:ring-slate-700 transition-colors">
                       <img src="https://albedo.link/favicon.ico" alt="Albedo" className="size-6" />
                    </div>
                    <span className="font-bold">Albedo Link</span>
                  </div>
                  {loading ? <div className="size-5 border-2 border-current border-t-transparent animate-spin rounded-full" /> : <ChevronRight className="size-5 opacity-40" />}
                </button>
              </div>
              
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Secure 256-bit AES connection
              </p>
            </div>
          ) : isBlocked ? (
            <div className="space-y-8 py-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex size-20 items-center justify-center rounded-full bg-red-100 text-red-600 ring-8 ring-red-50">
                  <ShieldAlert className="size-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
                <p className="text-slate-500 leading-relaxed italic-none">
                  Your wallet <span className="font-mono text-xs font-bold text-slate-900 italic-none">({address?.slice(0, 6)}...{address?.slice(-4)})</span> has been flagged for suspicious activity by SafeDeal AI.
                </p>
              </div>
              <GradientButton variant="variant" onClick={disconnect} className="w-full rounded-2xl py-4 italic-none">
                Disconnect Wallet
              </GradientButton>
            </div>
          ) : (
            <div className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 italic-none">
                    <ShieldCheck className="size-8 italic-none" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 italic-none">Wallet Secure</h2>
                    <p className="text-xs font-bold text-slate-500 italic-none underline font-mono truncate max-w-[200px]">{address}</p>
                  </div>
               </div>

               {riskScore !== null && (
                 <div className={cn("rounded-2xl border p-4 flex items-center justify-between italic-none", getRiskColor(riskScore))}>
                   <div className="flex items-center gap-3 italic-none">
                      <ShieldCheck className="size-5 italic-none" />
                      <span className="text-xs font-bold italic-none">Your wallet risk level: {getRiskLabel(riskScore)}</span>
                   </div>
                   <span className="text-xs font-black italic-none">{riskScore}/100</span>
                 </div>
               )}

               {!hasUsdcTrustline && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 space-y-3 italic-none">
                    <div className="flex items-center gap-3 text-orange-700 italic-none">
                       <AlertTriangle className="size-5 shrink-0 italic-none" />
                       <span className="text-xs font-bold italic-none">Add USDC to your wallet first</span>
                    </div>
                    <p className="text-[11px] text-orange-600 leading-relaxed italic-none">
                      SafeDeal requires a USDC trustline to process payments securely.
                    </p>
                    <a 
                      href="https://laboratory.stellar.org/#txbuilder?params=eyJhdHRyaWJ1dGVzIjp7ImZlZSI6IjEwMCIsIm9wdGlvbnMiOnsiaGVscCI6ZmFsc2UsImNvbmZpcm0iOmZhbHNlfX0sIm9wZXJhdGlvbnMiOlt7InR5cGUiOiJjaGFuZ2VfdHJ1c3QiLCJhc3NldCI6eyJ0eXBlIjoiY3JlZGl0X2FscGhhbnVtNCIsImNvZGUiOiJVU0RDIiwiaXNzdWVyIjoiR0JCRDY3SUY2NFdPWUlEMkc2QTI2NjVCM0RCM0UwQSJ9fV19&network=testnet"
                      target="_blank"
                      className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-orange-700 shadow-sm ring-1 ring-orange-100 hover:bg-orange-100 transition-all italic-none"
                    >
                      Add Trustline via Laboratory
                      <ExternalLink className="size-3 italic-none" />
                    </a>
                  </div>
               )}

               <div className="rounded-3xl bg-slate-50 p-6 space-y-4 border border-slate-100 italic-none">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 italic-none">
                    <span>AVAILABLE BALANCE</span>
                    <span className="flex items-center gap-1 italic-none"><Layers className="size-3 italic-none" /> TESTNET</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-900 italic-none">{balance} USDC</div>
                    <div className="text-sm font-bold text-emerald-600 italic-none">≈ ₹{inrEquivalent}</div>
                  </div>
               </div>

               <div className="flex gap-3 mt-4 italic-none">
                 <GradientButton onClick={onClose} className="flex-1 rounded-2xl py-4 font-bold italic-none">
                   Done
                 </GradientButton>
                 <button 
                  onClick={disconnect}
                  className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all italic-none"
                 >
                   <LogOut className="size-6 italic-none" />
                 </button>
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
