"use client";

import { useWallet } from "@/context/WalletContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BadgeCheck, Copy, ExternalLink, Star, Award, } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { publicKey, xlmBalance, usdcBalance, fraudLevel, fraudScore } = useWallet();
  

  // Mock progression stats
  const dealsCompleted = 12;
  const targetDeals = 50;
  const progressPercent = Math.min(100, Math.floor((dealsCompleted / targetDeals) * 100));

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      
      toast.success("Wallet address copied!");
      
    }
  };

  const badges = [
    { title: "New Seller", desc: "0 deals", active: dealsCompleted >= 0 },
    { title: "Rising Star", desc: "10 deals", active: dealsCompleted >= 10 },
    { title: "Trusted Merchant", desc: "50 deals", active: dealsCompleted >= 50 },
    { title: "Verified Partner", desc: "100 deals", active: dealsCompleted >= 100 },
  ];

  return (
    <ErrorBoundary>
      <div className="flex-1 min-w-0 bg-[#0f0f1a] min-h-screen text-slate-200 pb-20 font-sans">
        
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#030712]/80 backdrop-blur-md px-6 lg:px-10 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-white">Merchant Profile</h1>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mt-0.5">
              Manage your identity and trust level
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 lg:px-10 py-10 space-y-8">
          
          {/* Identity Card */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="size-24 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl shadow-inner pt-2 shrink-0 relative">
                👾
                {fraudLevel !== "Blocked" && <div className="absolute -bottom-2 -right-2 size-8 bg-emerald-500 rounded-full border-4 border-[#0f0f1a] flex items-center justify-center"><BadgeCheck className="size-4 text-white" /></div>}
              </div>

              <div className="flex-1 w-full space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2">Connected Wallet</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="bg-black/40 text-indigo-300 px-4 py-2 rounded-xl text-sm border border-white/5 font-bold">
                      {publicKey ? `${publicKey.slice(0,12)}...${publicKey.slice(-12)}` : "Not connected"}
                    </code>
                    {publicKey && (
                      <>
                        <button onClick={handleCopy} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
                          <Copy className="size-4" />
                        </button>
                        <a href={`https://stellar.expert/explorer/testnet/account/${publicKey}`} target="_blank" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
                          <ExternalLink className="size-4" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8] mb-1">XLM Balance</p>
                    <p className="text-lg font-black text-white">{Number(xlmBalance).toFixed(2)}</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8] mb-1">USDC Balance</p>
                    <p className="text-lg font-black text-emerald-400">{Number(usdcBalance).toFixed(2)}</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8] mb-1">Risk Score</p>
                    <div className="flex items-center gap-2">
                      <p className={cn("text-lg font-black", fraudLevel === "Blocked" ? "text-red-500" : "text-emerald-500")}>{Math.round(fraudScore)} / 100</p>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8] mb-1">Status</p>
                    <p className={cn("text-lg font-black", fraudLevel === "Blocked" ? "text-red-500" : "text-emerald-500")}>
                      {fraudLevel === "Blocked" ? "Blocked" : "Clear"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badge Progression */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <Award className="size-6 text-amber-500" />
              <h2 className="text-xl font-black text-white">Trust Progression</h2>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Leveling up to <span className="text-amber-400">Trusted Merchant</span></span>
                <span className="text-sm font-black text-white">{dealsCompleted} / {targetDeals} Deals</span>
              </div>
              <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((b, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-2xl border transition-all text-center",
                  b.active ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "bg-black/20 border-white/5 opacity-50 grayscale"
                )}>
                  <div className={cn(
                    "size-12 mx-auto rounded-full flex items-center justify-center mb-3",
                    b.active ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-500"
                  )}>
                    <Star className={cn("size-6", b.active && i > 0 && "fill-current")} />
                  </div>
                  <h4 className="text-sm font-black text-white">{b.title}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-[#94a3b8] mt-1 font-bold">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </ErrorBoundary>
  );
}
