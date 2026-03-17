"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  ShoppingBag,
  Clock,
  Share2,
  ExternalLink
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { CreateDealModal } from "@/components/deal/CreateDealModal";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useWallet } from "@/context/WalletContext";
import Link from "next/link";
import { toast } from "sonner";
import { getSellerDeals, type DealData } from "@/lib/stellar";

type Status = "all" | "WaitingForPayment" | "Locked" | "Disputed";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  WaitingForPayment:  { label: "Waiting for Payment", color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
  Locked:   { label: "Payment Locked",      color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  Disputed: { label: "Disputed",            color: "text-red-600",     bg: "bg-red-50 border-red-100" },
  Completed:{ label: "Completed",           color: "text-slate-600",   bg: "bg-slate-50 border-slate-200" },
  Refunded: { label: "Refunded",            color: "text-orange-600",  bg: "bg-orange-50 border-orange-100" },
  Cancelled:{ label: "Cancelled",           color: "text-slate-500",   bg: "bg-slate-50 border-slate-200" },
  Expired:  { label: "Expired",             color: "text-red-600",     bg: "bg-red-50 border-red-100" },
};

export default function ActiveDealsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [deals, setDeals] = useState<DealData[]>([]);
  const { isConnected, publicKey } = useWallet();

  const loadDeals = useCallback(async () => {
    try {
      if (publicKey) {
        // Uses Soroban contract when deployed, localStorage otherwise
        const result = await getSellerDeals(publicKey);
        const activeDeals = result.filter(d => 
          d.status === 'WaitingForPayment' || 
          d.status === 'Locked' ||
          d.status === 'Disputed'
        );
        setDeals(activeDeals.reverse());
      } else {
        // Fallback: load all deals from localStorage
        const raw = localStorage.getItem("safedeal_deals");
        if (raw) {
          const allLocal = JSON.parse(raw) as DealData[];
          const activeLocal = allLocal.filter(d => 
            d.status === 'WaitingForPayment' || 
            d.status === 'Locked' ||
            d.status === 'Disputed'
          );
          setDeals(activeLocal.reverse());
        }
        else setDeals([]);
      }
    } catch {
      setDeals([]);
    }
  }, [publicKey]);

  useEffect(() => {
    loadDeals();
    window.addEventListener("focus", loadDeals);
    return () => window.removeEventListener("focus", loadDeals);
  }, [loadDeals]);

  const handleModalClose = () => {
    setShowCreate(false);
    loadDeals(); // refresh list after deal created
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesStatus = filter === "all" || deal.status === filter;
    const matchesSearch =
      deal.title.toLowerCase().includes(search.toLowerCase()) ||
      deal.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleShare = (deal: DealData) => {
    const url = `${window.location.origin}/deal/${deal.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Deal link copied to clipboard!");
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const expiresLabel = (expiresAt: number) => {
    const mins = Math.max(0, Math.floor((expiresAt - Date.now()) / 60000));
    if (mins === 0) return "Expired";
    if (mins > 1440) return `${Math.floor(mins / 1440)}d left`;
    if (mins > 60)   return `${Math.floor(mins / 60)}h left`;
    return `${mins}m left`;
  };

  return (
    <ErrorBoundary>
      <div className="flex-1 min-w-0 bg-slate-50 pb-20">
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 lg:px-10 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900">My Deals</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              {filteredDeals.length > 0
                ? `${filteredDeals.length} deal${filteredDeals.length !== 1 ? "s" : ""}`
                : "No deals yet"}
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

        <main className="mx-auto max-w-7xl px-6 lg:px-10 py-10 space-y-8">

          {/* FILTERS BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit flex-wrap gap-1">
              {(["all", "WaitingForPayment", "Locked", "Disputed"] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === s
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative group max-w-xs w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="Search deals by ID or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              />
            </div>
          </div>

          {/* DEALS LIST */}
          <div className="grid gap-6">
            {filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => {
                const config = statusConfig[deal.status] ?? statusConfig["WaitingForPayment"];
                const label = expiresLabel(deal.expiresAt);
                const expired = label === "Expired";

                return (
                  <div
                    key={deal.id}
                    className="group block rounded-[2.5rem] bg-white border border-slate-100 p-6 sm:p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex gap-6 items-center">
                        <div className="size-16 rounded-3xl bg-slate-50 flex items-center justify-center text-2xl ring-1 ring-slate-100 group-hover:bg-white transition-colors">
                          🛍️
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deal #{deal.id}</p>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{deal.title}</h3>
                          <div className="flex items-center flex-wrap gap-3 mt-2">
                            <span className="text-sm font-black text-emerald-600">{deal.amountUSDC.toFixed(2)} USDC</span>
                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", config.bg, config.color)}>
                              {config.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end justify-between gap-4">
                        <div className="text-[10px] font-bold text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5 sm:justify-end">
                            <Clock className="size-2.5" />
                            Created {timeAgo(deal.createdAt)}
                          </div>
                          <div className={cn("flex items-center gap-1.5 sm:justify-end", expired ? "text-red-500" : "text-amber-600")}>
                            {label}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleShare(deal)}
                            className="size-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                            title="Copy shareable link"
                          >
                            <Share2 className="size-4" />
                          </button>
                          <Link
                            href={`/deal/${deal.id}`}
                            target="_blank"
                            className="size-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                            title="Open buyer page"
                          >
                            <ExternalLink className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-24 flex flex-col items-center text-center space-y-6">
                <div className="size-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="size-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Deals Found</h3>
                  <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                    {!isConnected
                      ? "Connect your wallet to view and create deals."
                      : search || filter !== "all"
                      ? "No deals match your current filters."
                      : "Create your first deal to start accepting secure payments."}
                  </p>
                </div>
                {isConnected && !search && filter === "all" && (
                  <GradientButton onClick={() => setShowCreate(true)} className="rounded-xl px-8 py-4">
                    <Plus className="mr-2 size-4" />
                    Create First Deal
                  </GradientButton>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <CreateDealModal open={showCreate} onClose={handleModalClose} />
    </ErrorBoundary>
  );
}
