"use client";

import { useState } from "react";
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

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const { isConnected, xlmBalance, usdcBalance } = useWallet();

  const stats = [
    { label: "Lifetime Earnings", val: "0.00 USDC", sub: "No completed deals yet", icon: CheckCircle2, iconColor: "text-emerald-500" },
    { label: "Successful Settlements", val: "0", sub: "—", icon: ArrowDownLeft, iconColor: "text-blue-500" },
    { label: "Wallet USDC Balance", val: `${parseFloat(usdcBalance || "0").toFixed(2)} USDC`, sub: `${parseFloat(xlmBalance || "0").toFixed(2)} XLM available`, icon: Calendar, iconColor: "text-indigo-500" },
  ];

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

          {/* EMPTY STATE TABLE */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="hidden lg:block">
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
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <FileText className="size-10 text-slate-200" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                          {!isConnected ? "Connect your wallet to view transaction history" : "No transactions yet"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest max-w-xs">
                          {isConnected ? "Completed deal settlements will appear here automatically." : ""}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* MOBILE EMPTY STATE */}
            <div className="lg:hidden py-20 flex flex-col items-center space-y-4">
              <FileText className="size-10 text-slate-200" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                {!isConnected ? "Connect wallet to view history" : "No transactions yet"}
              </p>
            </div>
          </div>

          {/* PAGINATION — only show when there's data */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing 0 entries</p>
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
        </main>
      </div>
    </ErrorBoundary>
  );
}
