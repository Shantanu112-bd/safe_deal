"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Wallet,
  Activity
} from "lucide-react";
import { CreateDealModal } from "@/components/deal/CreateDealModal";
import { StatsSkeleton } from "@/components/ui/loading-skeletons";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useWallet } from "@/context/WalletContext";
import { getSellerDeals, type DealData } from "@/lib/stellar";
import Link from "next/link";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  } from "recharts";

export default function Dashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const { publicKey, isConnected } = useWallet();
  const [deals, setDeals] = useState<DealData[]>([]);
  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const loadDeals = useCallback(async () => {
    if (!publicKey) return;
    try {
      if (deals.length === 0) setLoading(true);
      const sellerDeals = await getSellerDeals(publicKey);
      setDeals(sellerDeals || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load deals:', error);
      setDeals([]);
    } finally {
      if (deals.length === 0) setLoading(false);
    }
  }, [publicKey, deals.length]);

  useEffect(() => {
    if (!publicKey) {
      setLoading(false);
      return;
    }
    loadDeals();
    const interval = setInterval(() => {
      loadDeals();
    }, 30000);
    return () => clearInterval(interval);
  }, [publicKey, loadDeals]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const activeDealsList = deals.filter(d => 
    d.status === 'WaitingForPayment' || 
    d.status === 'Locked' ||
    d.status === 'Disputed'
  );
  
  const activeDealsCount = activeDealsList.length;
  const completedDeals = deals.filter(d => d.status === 'Completed').length;
  
  const totalEarned = deals
    .filter(d => d.status === 'Completed')
    .reduce((sum, d) => sum + Number(d.amountUSDC || 0), 0);

  const pendingEarned = deals
    .filter(d => d.status === 'Locked')
    .reduce((sum, d) => sum + Number(d.amountUSDC || 0), 0);

  const successRate = deals.length > 0 
    ? Math.round((completedDeals / deals.length) * 100)
    : 100;

  const shortKey = publicKey
    ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
    : "—";

  // Dummy Chart Data based on total earned today vs past days (just static for demo visual)
  const chartData = [
    { name: "Mon", earn: totalEarned * 0.1 },
    { name: "Tue", earn: totalEarned * 0.2 },
    { name: "Wed", earn: totalEarned * 0.4 },
    { name: "Thu", earn: totalEarned * 0.6 },
    { name: "Fri", earn: totalEarned * 0.8 },
    { name: "Sat", earn: totalEarned * 0.9 },
    { name: "Sun", earn: totalEarned }
  ];

  return (
    <ErrorBoundary>
      <div className="flex-1 min-w-0 bg-[#050505] min-h-screen text-white pb-24 lg:pb-0 font-sans">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-md px-6 lg:px-10 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs font-bold text-[#06B6D4] tracking-[0.1em] mt-0.5">
              {isConnected ? shortKey : "Connect your wallet"}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            disabled={!isConnected}
            className="accent-gradient rounded-xl px-6 py-3 text-sm font-bold text-white flex items-center hover:scale-[1.02] transition-transform duration-200 disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-wider"
          >
            <Plus className="mr-2 size-4" />
            Create Deal
          </button>
        </header>

        <main className="mx-auto max-w-7xl px-6 lg:px-10 py-10 space-y-10">
          
          {loading ? (
            <div className="opacity-50"><StatsSkeleton /></div>
          ) : !isConnected ? (
             <div className="py-24 flex flex-col items-center text-center space-y-6">
                <div className="size-20 rounded-2xl glass-card flex items-center justify-center text-[#999]">
                  <Wallet className="size-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Wallet Not Connected</h3>
                  <p className="text-[#999] font-light">Connect your Stellar wallet to view deals and analytics.</p>
                </div>
             </div>
          ) : (
            <>
              {/* STATS CARDS */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                
                {/* Active Deals */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-[#06B6D4]/30 transition-all duration-200"
                  style={{ borderLeft: "2px solid #06B6D4" }}
                >
                   <div className="flex justify-between items-start mb-4 relative z-10">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Active Deals</p>
                     <ShoppingBag className="text-[#06B6D4] w-5 h-5" />
                   </div>
                   <p className="text-3xl font-black text-white relative z-10">{activeDealsCount}</p>
                   <p className="text-xs text-[#06B6D4] font-bold mt-2 relative z-10 uppercase tracking-wider">Requires attention</p>
                </div>

                {/* Total Earned */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-200"
                  style={{ borderLeft: "2px solid #10b981" }}
                >
                   <div className="flex justify-between items-start mb-4 relative z-10">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Total Earned</p>
                     <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                   </div>
                   <p className="text-3xl font-black text-white relative z-10">${totalEarned.toFixed(2)}</p>
                   <p className="text-xs text-emerald-500 font-bold mt-2 relative z-10 uppercase tracking-wider">Historical</p>
                </div>

                {/* Pending Payment */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-200"
                  style={{ borderLeft: "2px solid #f59e0b" }}
                >
                   <div className="flex justify-between items-start mb-4 relative z-10">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Pending Escrow</p>
                     <Lock className="text-amber-500 w-5 h-5" />
                   </div>
                   <p className="text-3xl font-black text-white relative z-10">${pendingEarned.toFixed(2)}</p>
                   <p className="text-xs text-amber-500 font-bold mt-2 relative z-10 uppercase tracking-wider">Locked in vault</p>
                </div>

                {/* Success Rate */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-[#EC4899]/30 transition-all duration-200"
                  style={{ borderLeft: "2px solid #EC4899" }}
                >
                   <div className="flex justify-between items-start mb-4 relative z-10">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Success Rate</p>
                     <TrendingUp className="text-[#EC4899] w-5 h-5" />
                   </div>
                   <p className="text-3xl font-black text-white relative z-10">{successRate}%</p>
                   <p className="text-xs text-[#EC4899] font-bold mt-2 relative z-10 uppercase tracking-wider">Completion</p>
                </div>
              </section>

              {/* CHARTS & DEALS GRID */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* ACTIVE DEALS LIST */}
                <section className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Deals</h2>
                     <p className="text-xs text-[#999]">Updated {secondsAgo}s ago</p>
                  </div>
                  
                  {activeDealsList.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center">
                      <ShoppingBag className="w-12 h-12 text-[#999] mb-4" />
                      <p className="text-white font-bold mb-2">No Active Deals</p>
                      <p className="text-[#999] text-sm font-light mb-6">Create a deal to start transacting securely.</p>
                      <button onClick={() => setShowCreate(true)} className="accent-gradient px-6 py-2 rounded-lg text-white text-sm font-bold uppercase tracking-wider">New Deal</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <style dangerouslySetInnerHTML={{__html: `
                        @keyframes pulseGreen {
                          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4) }
                          70% { box-shadow: 0 0 0 10px rgba(16,185,129,0) }
                          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0) }
                        }
                        @keyframes pulseRed {
                          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4) }
                          70% { box-shadow: 0 0 0 10px rgba(239,68,68,0) }
                          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0) }
                        }
                      `}} />
                      {activeDealsList.map((deal) => {
                        let dotColor = "#3b82f6";
                        let dotStyle: React.CSSProperties = {};
                        if (deal.status === 'WaitingForPayment') {
                          dotColor = "#f59e0b";
                          dotStyle = { background: dotColor, boxShadow: "0 0 0 4px rgba(245,158,11,0.2)" };
                        } else if (deal.status === 'Locked') {
                          dotColor = "#10b981";
                          dotStyle = { background: dotColor, boxShadow: "0 0 0 4px rgba(16,185,129,0.2)", animation: "pulseGreen 2s infinite" };
                        } else if (deal.status === 'Disputed') {
                          dotColor = "#ef4444";
                          dotStyle = { background: dotColor, boxShadow: "0 0 0 4px rgba(239,68,68,0.2)", animation: "pulseRed 2s infinite" };
                        }

                        return (
                          <Link href={`/dashboard/deals`} key={deal.id}>
                            <div className="glass-card rounded-2xl p-5 hover:bg-white/[0.06] transition-all duration-200 flex items-center justify-between mb-3 group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center relative">
                                  <div style={dotStyle} className="w-2.5 h-2.5 rounded-full" />
                                </div>
                                <div>
                                  <p className="text-white font-bold group-hover:text-[#06B6D4] transition-colors duration-200">{deal.title}</p>
                                  <p className="text-[#999] text-xs">ID: {deal.id.slice(0, 12)}...</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="accent-gradient-text font-black text-lg">
                                  ${deal.amountUSDC.toFixed(2)}
                                </p>
                                <p className="text-[#999] text-xs uppercase tracking-widest">{deal.status}</p>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </section>

                {/* EARNINGS CHART & ACTIVITY */}
                <section className="space-y-6">
                  <div className="glass-card rounded-2xl p-6">
                     <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Earnings</h2>
                     <div className="h-48 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                           <defs>
                              <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <XAxis dataKey="name" stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
                           <YAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                           <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} itemStyle={{ color: "#06B6D4" }} />
                           <Area type="monotone" dataKey="earn" fill="url(#earnGrad)" stroke="#06B6D4" strokeWidth={2} />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                     <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wider"><Activity className="w-4 h-4 text-[#EC4899]" /> Activity</h2>
                     
                     <div className="space-y-4">
                        {deals.slice(0, 4).map((d, i) => {
                          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                          let msg = "Payment released";
                          if (d.status === "Locked") { icon = <Lock className="w-4 h-4 text-emerald-500" />; msg = "Payment locked"; }
                          else if (d.status === "WaitingForPayment") { icon = <Wallet className="w-4 h-4 text-amber-500" />; msg = "Invoice created"; }
                          else if (d.status === "Disputed") { icon = <AlertTriangle className="w-4 h-4 text-red-500" />; msg = "Dispute opened"; }

                          return (
                            <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors duration-200">
                              <div className="flex items-center gap-3">
                                {icon}
                                <p className="text-sm text-white">{msg}</p>
                              </div>
                              <p className="accent-gradient-text text-xs font-bold">
                                +{d.amountUSDC.toFixed(2)}
                              </p>
                            </div>
                          )
                        })}
                        {deals.length === 0 && (
                          <div className="text-center text-[#999] text-xs py-4 font-light">No activity yet.</div>
                        )}
                     </div>
                  </div>
                </section>
              </div>

            </>
          )}
        </main>
        
        <CreateDealModal open={showCreate} onClose={() => setShowCreate(false)} onDealCreated={() => loadDeals()} />
      </div>
    </ErrorBoundary>
  );
}
