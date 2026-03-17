"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowDownLeft,
  Calendar,
  Filter,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useWallet } from "@/context/WalletContext";
import { getSellerDeals, type DealData } from "@/lib/stellar";
import { GradientButton } from "@/components/ui/gradient-button";
import Link from "next/link";
import { TableSkeleton } from "@/components/ui/loading-skeletons";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const { publicKey, isConnected, xlmBalance, usdcBalance } = useWallet();
  const [history, setHistory] = useState<DealData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setLoading(false);
      return;
    }
    
    const loadHistory = async () => {
      try {
        setLoading(true);
        const allDeals = await getSellerDeals(publicKey);
        const completed = allDeals.filter(d =>
          d.status === 'Completed' ||
          d.status === 'Refunded' ||
          d.status === 'Disputed' ||
          d.status === 'Cancelled'
        );
        // Sort descending by created/locked date if available, here using deal ID conceptually (could add time sort)
        setHistory(completed.reverse()); 
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [publicKey]);

  const totalEarned = history
    .filter(d => d.status === 'Completed')
    .reduce((sum, d) => sum + d.amountUSDC, 0);

  const stats = [
    { label: "Lifetime Earnings", val: `${totalEarned.toFixed(2)} USDC`, sub: history.length > 0 ? `${history.filter(d => d.status === 'Completed').length} completed deals` : "No completed deals yet", icon: CheckCircle2, iconColor: "text-emerald-500" },
    { label: "Successful Settlements", val: history.filter(d => d.status === 'Completed').length.toString(), sub: "—", icon: ArrowDownLeft, iconColor: "text-blue-500" },
    { label: "Wallet USDC Balance", val: `${parseFloat(usdcBalance || "0").toFixed(2)} USDC`, sub: `${parseFloat(xlmBalance || "0").toFixed(2)} XLM available`, icon: Calendar, iconColor: "text-indigo-500" },
  ];

  const filteredHistory = history.filter(deal => 
    deal.title.toLowerCase().includes(search.toLowerCase()) || 
    deal.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ErrorBoundary>
      <div className="flex-1 min-w-0 bg-slate-50 pb-20 font-sans">
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 lg:px-10 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900">Transaction History</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Audited record of all finalized settlements</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="size-4" />
            Export CSV
          </button>
        </header>

        <main className="mx-auto max-w-7xl px-6 lg:px-10 py-10 space-y-10">

          {/* SUMMARY CARDS */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <stat.icon className={cn("size-5", stat.iconColor)} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">{stat.val}</h2>
                <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* FILTER ROW */}
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="Search by Deal ID, Item, or Transaction Reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border border-slate-100 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]">
                <Calendar className="size-4" />
                Date
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border border-slate-100 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]">
                <Filter className="size-4" />
                Status
              </button>
            </div>
          </div>

          {/* EMPTY STATE OR TABLE */}
          {loading ? (
             <TableSkeleton /> 
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Deal Reference</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <FileText className="size-10 text-slate-200" />
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                              {!isConnected ? "Connect your wallet to view transaction history" : "No completed deals yet"}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs">
                              {isConnected ? "Your finalized deals will appear here." : "Connect to view history."}
                            </p>
                            {isConnected && (
                              <Link href="/dashboard/deals" className="mt-4 inline-block">
                                <GradientButton className="rounded-xl px-6 py-3 text-xs font-bold">
                                  Go to Active Deals
                                </GradientButton>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((deal) => (
                        <tr key={deal.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                           <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-slate-900 transition-colors shadow-sm">
                                <CheckCircle2 className="size-4" />
                              </div>
                              <span className="text-sm font-black text-slate-900">{deal.title}</span>
                            </div>
                           </td>
                           <td className="px-8 py-6">
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{deal.id}</span>
                           </td>
                           <td className="px-8 py-6">
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(deal.createdAt).toLocaleDateString()}</span>
                           </td>
                           <td className="px-8 py-6">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                deal.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                deal.status === "Refunded" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                deal.status === "Cancelled" ? "bg-slate-50 text-slate-600 border-slate-200" :
                                "bg-red-50 text-red-600 border-red-100" // Disputed
                              )}>
                                {deal.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                             <span className="text-sm font-black text-emerald-600">
                               {deal.status === "Completed" ? "+" : ""}{deal.amountUSDC.toFixed(2)} USDC
                             </span>
                           </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
  
              {/* MOBILE HISTORY VIEW */}
              <div className="lg:hidden">
                {filteredHistory.length === 0 ? (
                  <div className="py-20 flex flex-col items-center space-y-4">
                    <FileText className="size-10 text-slate-200" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      {!isConnected ? "Connect wallet to view history" : "No completed deals yet"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredHistory.map((deal) => (
                      <div key={deal.id} className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-black text-slate-900">{deal.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{deal.id}</p>
                          </div>
                          <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                              deal.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              deal.status === "Refunded" ? "bg-orange-50 text-orange-600 border-orange-100" :
                              deal.status === "Cancelled" ? "bg-slate-50 text-slate-600 border-slate-200" :
                              "bg-red-50 text-red-600 border-red-100"
                            )}>
                              {deal.status}
                           </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                           <span className="text-slate-400">{new Date(deal.createdAt).toLocaleDateString()}</span>
                           <span className="text-emerald-600">{deal.status === "Completed" ? "+" : ""}{deal.amountUSDC.toFixed(2)} USDC</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAGINATION — only show when there's data */}
          {history.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing {filteredHistory.length} entries</p>
              <div className="flex items-center gap-2">
                <button disabled className="size-[44px] rounded-xl border border-slate-200 flex items-center justify-center text-slate-200 cursor-not-allowed">
                  <ChevronLeft className="size-5" />
                </button>
                <button className="size-[44px] rounded-xl text-[10px] font-black bg-slate-900 text-white shadow-lg">
                  1
                </button>
                <button disabled className="size-[44px] rounded-xl border border-slate-200 flex items-center justify-center text-slate-200 cursor-not-allowed">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
