"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, ShoppingBag } from "lucide-react";
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
        const result = await getSellerDeals(publicKey);
        const activeDeals = result.filter(d => 
          d.status === 'WaitingForPayment' || 
          d.status === 'Locked' ||
          d.status === 'Disputed'
        );
        setDeals(activeDeals.reverse());
      } else {
        setDeals([]);
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
    const interval = setInterval(() => { loadDeals(); }, 30000);
    return () => {
      window.removeEventListener("focus", loadDeals);
      clearInterval(interval);
    };
  }, [loadDeals]);

  const handleModalClose = () => {
    setShowCreate(false);
    loadDeals();
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesStatus = filter === "all" || deal.status === filter;
    const matchesSearch = deal.title.toLowerCase().includes(search.toLowerCase()) || deal.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <ErrorBoundary>
      <div className="flex-1 min-w-0 bg-[#050505] min-h-screen text-white pb-20 font-sans">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-md px-6 lg:px-10 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">My Deals</h1>
            <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] mt-0.5">
              {filteredDeals.length > 0
                ? `${filteredDeals.length} deal${filteredDeals.length !== 1 ? "s" : ""}`
                : "No deals yet"}
            </p>
          </div>
          <button
            className="accent-gradient rounded-xl px-6 py-3 text-sm font-bold !text-white hover:scale-[1.02] transition-transform duration-200 disabled:opacity-50 flex items-center uppercase tracking-wider"
            onClick={() => setShowCreate(true)}
            disabled={!isConnected}
          >
            <Plus className="mr-2 size-4" />
            Create Deal
          </button>
        </header>

        <main className="mx-auto max-w-7xl px-6 lg:px-10 py-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex glass-card p-1 rounded-xl w-fit flex-wrap gap-1">
              {(["all", "WaitingForPayment", "Locked", "Disputed"] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-200",
                    filter === s
                      ? "accent-gradient text-white"
                      : "text-[#999] hover:text-white"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative group max-w-xs w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#999] group-focus-within:text-[#06B6D4] transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#111] pl-11 pr-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 transition-all duration-200 placeholder:text-[#999]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="py-24 flex flex-col items-center text-center space-y-6 md:col-span-2 lg:col-span-3">
                <div className="size-20 rounded-2xl glass-card flex items-center justify-center text-[#999]">
                  <ShoppingBag className="size-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">No deals found</h3>
                  <p className="text-sm font-light text-[#999] max-w-xs mx-auto">
                    {!isConnected
                      ? "Connect your wallet to view deals."
                      : "Create your first deal to get started"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <CreateDealModal open={showCreate} onClose={handleModalClose} onDealCreated={() => loadDeals()} />
    </ErrorBoundary>
  );
}
