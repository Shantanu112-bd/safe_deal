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
import { type DealData } from "@/lib/stellar";
import { GradientButton } from "@/components/ui/gradient-button";
import Link from "next/link";
import { TableSkeleton } from "@/components/ui/loading-skeletons";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const { publicKey, isConnected, xlmBalance, usdcBalance } = useWallet();
  const [history, setHistory] = useState<DealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!publicKey) {
      setHistory([]);
      setLoading(false);
      return;
    }
    
    const loadHistory = async () => {
      try {
        setLoading(true);
        // Fetch local deals to maintain parity with un-deployed/fallback environments
        const stored = localStorage.getItem('safedeal_deals');
        const localDeals: DealData[] = stored ? JSON.parse(stored) : [];
        const relatedLocalDeals = localDeals.filter(d => d.sellerKey === publicKey || d.buyerKey === publicKey);

        // Fetch indexed on-chain deals instantaneously from the new Backend API instead of pulling raw Soroban RPC mapping
        let sellerDeals: DealData[] = [];
        let buyerDeals: DealData[] = [];
        
        try {
          const sellerRes = await fetch(`/api/indexer?publicKey=${publicKey}&role=seller`);
          const buyerRes = await fetch(`/api/indexer?publicKey=${publicKey}&role=buyer`);
          
          if (sellerRes.ok) {
            const data = await sellerRes.json();
            if (data.success) sellerDeals = data.deals;
          }
          
          if (buyerRes.ok) {
            const data = await buyerRes.json();
            if (data.success) buyerDeals = data.deals;
          }
        } catch (error) {
          console.warn("Indexer fetch failed, defaulting to local cache logic", error);
        }
        
        // Combine and deduplicate
        const allDeals = [...relatedLocalDeals, ...sellerDeals, ...buyerDeals];
        const uniqueMap = new Map<string, DealData>();
        for (const d of allDeals) {
           if (!uniqueMap.has(d.id)) {
              uniqueMap.set(d.id, d);
           }
        }
        
        const combinedDeals = Array.from(uniqueMap.values());
        
        // Sort descending by created string
        setHistory(combinedDeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); 
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [publicKey]);

  const totalEarned = history
    .filter(d => d.sellerKey === publicKey && d.status === 'Completed')
    .reduce((sum, d) => sum + d.amountUSDC, 0);

  const stats = [
    { label: "Lifetime Earnings", val: `${totalEarned.toFixed(2)} USDC`, sub: history.length > 0 ? `${history.filter(d => d.sellerKey === publicKey && d.status === 'Completed').length} completed deals` : "No completed deals yet", icon: CheckCircle2, iconColor: "text-emerald-400 font-bold", glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]" },
    { label: "Total Transactions", val: history.length.toString(), sub: "—", icon: ArrowDownLeft, iconColor: "text-blue-400 font-bold", glow: "shadow-[0_0_20px_rgba(96,165,250,0.15)]" },
    { label: "Wallet USDC Balance", val: `${parseFloat(usdcBalance || "0").toFixed(2)} USDC`, sub: `${parseFloat(xlmBalance || "0").toFixed(2)} XLM available`, icon: Calendar, iconColor: "text-indigo-400 font-bold", glow: "shadow-[0_0_20px_rgba(129,140,248,0.15)]" },
  ];

  const filteredHistory = history.filter(deal => 
    deal.title.toLowerCase().includes(search.toLowerCase()) || 
    deal.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;

    const headers = ["Transaction ID", "Deal Title", "Role", "Date", "Status", "Amount USDC"];
    
    const rows = filteredHistory.map(deal => {
      const date = new Date(deal.createdAt).toLocaleString();
      const role = deal.sellerKey === publicKey ? "Seller" : "Buyer";
      const amountSign = 
        deal.sellerKey === publicKey ? (deal.status === "Completed" ? "+" : "") 
        : (deal.status !== "WaitingForPayment" && deal.status !== "Cancelled" ? "-" : "");
      
      const amountStr = `${amountSign}${deal.amountUSDC.toFixed(2)}`;
      
      return [
        `"${deal.id}"`,
        `"${deal.title.replace(/"/g, '""')}"`,
        `"${role}"`,
        `"${date}"`,
        `"${deal.status}"`,
        `"${amountStr}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SafeDeal_History_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ErrorBoundary>
      <div className="flex-1 min-w-0 bg-[#030712] text-white pb-20 font-sans min-h-screen">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl px-6 lg:px-10 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-white">Transaction History</h1>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mt-0.5">Audited record of all finalized settlements</p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all shadow-sm"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        </header>

        <main className="mx-auto max-w-7xl px-6 lg:px-10 py-10 space-y-10">

          {/* SUMMARY CARDS */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, i) => (
              <div key={i} className={cn("bg-white/5 rounded-[2rem] border border-white/10 p-8 hover:bg-white/10 transition-all", stat.glow)}>
                <div className="flex items-start justify-between mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">{stat.label}</p>
                  <stat.icon className={cn("size-6 drop-shadow-lg", stat.iconColor)} />
                </div>
                <h2 className="text-3xl font-black text-white">{stat.val}</h2>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* FILTER ROW */}
          <div className="bg-[#0f0f1a] rounded-3xl sm:rounded-[2.5rem] border border-white/10 p-3 sm:p-4 shadow-xl flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by Deal ID, Item, or Transaction Reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#030712] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-white placeholder-[#94a3b8] focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#030712] px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white transition-colors min-h-[44px]">
                <Calendar className="size-4" />
                Date
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#030712] px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white transition-colors min-h-[44px]">
                <Filter className="size-4" />
                Status
              </button>
            </div>
          </div>

          {/* EMPTY STATE OR TABLE */}
          {loading ? (
             <TableSkeleton /> 
          ) : (
            <div className="bg-[#0f0f1a] rounded-[2.5rem] border border-white/10 shadow-xl overflow-hidden p-6 sm:p-0">
              {isMobile ? (
                <div className="flex flex-col gap-3">
                  {filteredHistory.map(deal => (
                    <div key={deal.id} className="bg-[#030712] rounded-2xl p-5 border border-white/5 shadow-inner">
                      <div className="flex justify-between items-start mb-4">
                        <p className="font-bold text-white text-base">{deal.title}</p>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border",
                          deal.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10" :
                          deal.status === "Refunded" ? "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/10" :
                          deal.status === "Cancelled" ? "bg-white/5 text-slate-300 border-white/10" :
                          "bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10"
                        )}>
                          {deal.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className={cn("font-bold text-sm tracking-wide", deal.sellerKey === publicKey ? "text-emerald-400" : "text-white")}>
                          {deal.sellerKey === publicKey ? "+" : "-"}{deal.amountUSDC.toFixed(2)} USDC
                        </p>
                        <p className="text-[#94a3b8] text-[10px] uppercase font-black tracking-widest truncate max-w-[100px]">
                          {deal.id.split('-').pop() || deal.id}
                        </p>
                      </div>
                      <div className="mt-3 text-right">
                         <p className="text-[#94a3b8] text-[9px] uppercase font-black tracking-widest">
                           {new Date(deal.createdAt).toLocaleDateString()}
                         </p>
                      </div>
                    </div>
                  ))}
                  {filteredHistory.length === 0 && (
                     <div className="py-20 flex flex-col items-center space-y-4 text-center">
                       <FileText className="size-10 text-slate-500" />
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No history yet</p>
                     </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left border-collapse">
                    <thead>
                      <tr className="bg-[#030712] border-b border-white/10">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Transaction</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Deal Reference</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Date & Time</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#94a3b8] text-right">Settlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-32 text-center bg-[#030712]">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                <FileText className="size-8 text-[#94a3b8]" />
                              </div>
                              <p className="text-base font-black text-white uppercase tracking-widest">
                                {!isConnected ? "Connect Wallet to View History" : "No Completed Deals Yet"}
                              </p>
                              <p className="text-xs font-medium text-[#94a3b8] uppercase tracking-widest max-w-sm">
                                {isConnected ? "Your finalized deal settlements will automatically appear in this ledger." : "Securely connect to view your past transactions."}
                              </p>
                              {isConnected && (
                                <Link href="/dashboard/deals" className="mt-6 inline-block">
                                  <GradientButton className="rounded-xl px-8 py-4 text-xs font-black uppercase tracking-widest">
                                    Go to Active Deals
                                  </GradientButton>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((deal) => (
                          <tr key={deal.id} className="hover:bg-white/5 transition-colors group">
                             <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-[#030712] border border-white/10 flex items-center justify-center text-[#94a3b8] group-hover:bg-indigo-500/20 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all shadow-sm">
                                  <CheckCircle2 className="size-4" />
                                </div>
                                <span className="text-sm font-black text-white">{deal.title}</span>
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
                                  "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                                  deal.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10" :
                                  deal.status === "Refunded" ? "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/10" :
                                  deal.status === "Cancelled" ? "bg-white/5 text-slate-300 border-white/10" :
                                  "bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10" // Disputed
                                )}>
                                  {deal.status}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                               <span className={cn("text-sm font-black", deal.sellerKey === publicKey && deal.status === "Completed" ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" : "text-white")}>
                                 {deal.sellerKey === publicKey ? (deal.status === "Completed" ? "+" : "") : (deal.status !== "WaitingForPayment" && deal.status !== "Cancelled" ? "-" : "")}{deal.amountUSDC.toFixed(2)} USDC
                               </span>
                             </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PAGINATION — only show when there's data */}
          {history.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Showing {filteredHistory.length} entries</p>
              <div className="flex items-center gap-2">
                <button disabled className="size-[44px] rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#94a3b8] cursor-not-allowed">
                  <ChevronLeft className="size-5" />
                </button>
                <button className="size-[44px] rounded-xl text-[10px] font-black bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
                  1
                </button>
                <button disabled className="size-[44px] rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#94a3b8] cursor-not-allowed">
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
