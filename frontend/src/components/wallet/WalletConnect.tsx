"use client";

import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { WalletModal } from "./WalletModal";
import { Wallet, ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const WalletConnect = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { connected, address, isBlocked, riskScore, loading } = useWallet();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "relative flex items-center gap-3 overflow-hidden rounded-2xl px-5 py-3.5 transition-all duration-300",
          !connected 
            ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-slate-800" 
            : isBlocked 
              ? "bg-red-50 border-2 border-red-100 text-red-600"
              : "bg-emerald-50 border-2 border-emerald-100 text-emerald-700"
        )}
      >
        <div className={cn(
          "flex items-center gap-2.5",
          loading && "opacity-50"
        )}>
          {!connected ? (
            <>
              <Wallet className="size-5" />
              <span className="text-sm font-black uppercase tracking-widest italic-none">Connect Wallet</span>
            </>
          ) : isBlocked ? (
            <>
              <ShieldAlert className="size-5 italic-none" />
              <div className="text-left italic-none">
                <p className="text-[10px] font-black uppercase leading-none mb-0.5 italic-none">Blocked</p>
                <p className="text-xs font-bold font-mono italic-none">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative italic-none">
                <ShieldCheck className="size-5 italic-none" />
                <div className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-500 animate-pulse italic-none" />
              </div>
              <div className="text-left italic-none">
                <p className="text-[10px] font-black uppercase leading-none mb-0.5 italic-none">
                  {riskScore !== null ? `Risk: ${riskScore}%` : "Verified"}
                </p>
                <p className="text-xs font-bold font-mono italic-none">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            </>
          )}
        </div>
        
        {!connected && (
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
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
