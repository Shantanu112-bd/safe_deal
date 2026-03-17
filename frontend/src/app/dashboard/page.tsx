"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { CreateDealModal } from "@/components/deal/CreateDealModal";
import { StatsSkeleton } from "@/components/ui/loading-skeletons";
import ErrorBoundary from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";
import { useWallet } from "@/context/WalletContext";
import { getSellerDeals, type DealData } from "@/lib/stellar";
import Link from "next/link";

export default function Dashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const { publicKey, xlmBalance, usdcBalance, fraudScore, fraudLevel, isConnected } = useWallet();
  const [deals, setDeals] = useState<DealData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load deals
  useEffect(() => {
    if (!publicKey) {
      setLoading(false);
      return;
    }

    const loadDeals = async () => {
      try {
        setLoading(true);
        // Use the smart contract or fallback
        const sellerDeals = await getSellerDeals(publicKey);
        setDeals(sellerDeals);
      } catch (error) {
        console.error('Failed to load deals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, [publicKey]);

  // Calculations
  const activeDealsList = deals.filter(d => 
    d.status === 'WaitingForPayment' || 
    d.status === 'Locked' ||
    d.status === 'Disputed'
  );
  
  const activeDealsCount = activeDealsList.length;

  // Truncate public key for display
  const shortKey = publicKey
    ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
    : "—";

  const stats = [
    { label: "Active Deals", value: activeDealsCount.toString(), sub: activeDealsCount > 0 ? "Requires action" : "None yet", color: "text-slate-900" },
    { label: "USDC Balance", value: `${parseFloat(usdcBalance || "0").toFixed(2)}`, sub: "In wallet", color: "text-emerald-600" },
    { label: "XLM Balance", value: `${parseFloat(xlmBalance || "0").toFixed(2)}`, sub: "For fees", color: "text-blue-600" },
    { label: "Risk Score", value: fraudScore > 0 ? `${fraudScore}` : "—", sub: fraudLevel || "Connect wallet", color: "text-slate-900" },
  ];

  return (
    <ErrorBoundary>
      <div className="flex-1 min-w-0 bg-slate-50 pb-24 lg:pb-0">
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 lg:px-10 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900">Merchant Dashboard</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {isConnected ? shortKey : "Connect your wallet to get started"}
            </p>
          </div>
          <GradientButton
            className="rounded-xl px-6 py-3 text-sm font-bold"
            onClick={() => setShowCreate(true)}
            disabled={!isConnected}
          >
            <Plus className="mr-2 size-4" />
            Create New Deal
          </GradientButton>
        </header>

        <main className="mx-auto max-w-7xl px-6 lg:px-10 py-10 space-y-10 font-sans">
          
          {loading ? (
            <StatsSkeleton />
          ) : (
            <>
              {/* STATS OVERVIEW */}
              <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <article key={stat.label} className="group relative overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp className="size-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <p className={cn("mt-4 text-3xl font-black", stat.color)}>{stat.value}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="size-1 rounded-full bg-slate-300" />
                      <p className="text-xs font-bold text-slate-500">{stat.sub}</p>
                    </div>
                  </article>
                ))}
              </section>

              {/* EMPTY STATE / ACTIVE DEALS */}
              <article className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Active Deals</h2>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">Live</span>
                </div>

                {!isConnected ? (
                  <div className="py-24 flex flex-col items-center text-center space-y-6 px-8">
                    <div className="size-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300">
                      <Shield className="size-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Wallet Not Connected</h3>
                      <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                        Connect your Stellar wallet to view and manage your deals.
                      </p>
                    </div>
                  </div>
                ) : activeDealsList.length === 0 ? (
                  <div className="py-24 flex flex-col items-center text-center space-y-6 px-8">
                    <div className="size-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300">
                      <ShoppingBag className="size-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Active Deals</h3>
                      <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                        Create your first deal to start accepting secure payments via SafeDeal escrow.
                      </p>
                    </div>
                    <GradientButton onClick={() => setShowCreate(true)} className="rounded-xl px-8 py-4">
                      <Plus className="mr-2 size-4" />
                      Create First Deal
                    </GradientButton>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {activeDealsList.slice(0, 5).map((deal) => (
                      <Link href={`/dashboard/deals`} key={deal.id} className="block group px-8 py-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                              🛍️
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{deal.title}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {deal.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-600">{deal.amountUSDC.toFixed(2)} USDC</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{deal.status}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {activeDealsList.length > 5 && (
                      <Link href="/dashboard/deals" className="block px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        View all active deals →
                      </Link>
                    )}
                  </div>
                )}
              </article>

              {/* ACTIVITY FEED PLACEHOLDER */}
              <div className="grid gap-10 lg:grid-cols-3 items-start">
                <div className="lg:col-span-2">
                  <article className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Earnings Overview</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Activity will appear here after deals complete</p>
                      </div>
                    </div>
                    <div className="h-[200px] w-full flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-center space-y-2">
                        <TrendingUp className="size-8 text-slate-200 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No earnings data yet</p>
                      </div>
                    </div>
                  </article>
                </div>

                <div className="space-y-6">
                  <article className="rounded-[2.5rem] bg-[#0f172a] p-8 text-white shadow-2xl shadow-slate-900/20">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">Recent Activity</h2>
                    </div>
                    <div className="py-8 flex flex-col items-center text-center space-y-4">
                      <CheckCircle2 className="size-10 text-white/10" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        No activity to show yet. Activity will appear here as deals progress.
                      </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-slate-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Awaiting first deal</span>
                      </div>
                      {fraudLevel && fraudLevel !== "Unknown" && (
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                          fraudLevel === "Safe" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        )}>
                          <AlertTriangle className="size-3" />
                          Fraud Level: {fraudLevel} ({fraudScore}%)
                        </div>
                      )}
                    </div>
                  </article>
                </div>
              </div>
            </>
          )}
        </main>

        <CreateDealModal open={showCreate} onClose={() => setShowCreate(false)} />
      </div>
    </ErrorBoundary>
  );
}
