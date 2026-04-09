"use client";

import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { WalletModal } from "./WalletModal";
import { Wallet, ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const WalletConnect = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, publicKey, fraudScore, fraudLevel } = useWallet();
  
  const isBlocked = fraudLevel === "Blocked";
  const riskScore = fraudScore;
  const loading = false;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "relative flex items-center gap-3 overflow-hidden rounded-xl px-5 py-3 transition-all duration-300 glass-card",
          !isConnected 
            ? "hover:bg-white/[0.08] text-white" 
            : isBlocked 
              ? "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
        )}
      >
        <div className={cn(
          "flex items-center gap-2.5",
          loading && "opacity-50"
        )}>
          {!isConnected ? (
            <>
              <Wallet className="size-4 text-[#06B6D4]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Connect Wallet</span>
            </>
          ) : isBlocked ? (
            <>
              <ShieldAlert className="size-4" />
              <div className="text-left">
                <p className="text-[9px] font-black uppercase leading-none mb-0.5">Blocked</p>
                <p className="text-[11px] font-bold font-mono">{publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <ShieldCheck className="size-4" />
                <div className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase leading-none mb-1 text-[#999]">
                  {riskScore !== null ? `Risk: ${riskScore}%` : "Verified"}
                </p>
                <p className="text-[11px] font-bold font-mono text-white">{publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}</p>
              </div>
            </>
          )}
        </div>
        
        {!isConnected && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 italic-none">
             <ChevronRight className="size-4 opacity-50 italic-none" />
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit italic-none">
            <div className="size-5 border-2 border-current border-t-transparent animate-spin rounded-full italic-none" />
          </div>
        )}
      </button>

      <WalletModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  );
};
