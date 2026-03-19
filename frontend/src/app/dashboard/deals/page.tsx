"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  ShoppingBag
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { CreateDealModal } from "@/components/deal/CreateDealModal";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useWallet } from "@/context/WalletContext";
import { DealCardSkeleton } from "@/components/ui/loading-skeletons";
import { DealCard } from "@/components/ui/DealCard";
import { getSellerDeals, type DealData } from "@/lib/stellar";

type Status = "all" | "WaitingForPayment" | "Locked" | "Disputed";

export default function ActiveDealsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [deals, setDeals] = useState<DealData[]>([]);
  const { isConnected, publicKey } = useWallet();

  const [loading, setLoading] = useState(true);

  const loadDeals = useCallback(async () => {
    try {
      if (deals.length === 0) setLoading(true);
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
    } finally {
      if (deals.length === 0) setLoading(false);
    }
  }, [publicKey, deals.length]);

  useEffect(() => {
    loadDeals();
    window.addEventListener("focus", loadDeals);
    const interval = setInterval(() => {
      loadDeals();
    }, 30000);
    return () => {
      window.removeEventListener("focus", loadDeals);
      clearInterval(interval);
    };
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
            {loading ? (
              <>
                <DealCardSkeleton />
                <DealCardSkeleton />
                <DealCardSkeleton />
              </>
            ) : filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onRefresh={loadDeals} />
              ))
            ) : (
              <div className="py-24 flex flex-col items-center text-center space-y-6">
                <div className="size-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="size-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No deals yet</h3>
                  <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                    {!isConnected
                      ? "Connect your wallet to view and create deals."
                      : search || filter !== "all"
                      ? "No deals match your current filters."
                      : "Create your first deal to get started"}
                  </p>
                </div>
                {isConnected && !search && filter === "all" && (
                  <GradientButton onClick={() => setShowCreate(true)} className="rounded-xl px-8 py-4">
                    <Plus className="mr-2 size-4" />
                    Create New Deal
                  </GradientButton>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <CreateDealModal open={showCreate} onClose={handleModalClose} onDealCreated={() => loadDeals()} />
    </ErrorBoundary>
  );
}
