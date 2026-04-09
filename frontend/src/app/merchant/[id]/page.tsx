"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  Star, 
  Package, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Trophy, 
  History, 
  TrendingUp, 
  ShieldAlert,
  ArrowUpRight,
  Flag,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";
import { ProfileSkeleton } from "@/components/ui/loading-skeletons";
import ErrorBoundary from "@/components/ErrorBoundary";

// Mock Data
const MERCHANT_DATA = {
  name: "Priya's Jewelry",
  avatar: "PJ",
  category: "Jewelry & Handcrafted",
  trustBadge: "Trusted Seller",
  memberSince: "Jan 2023",
  location: "Mumbai, India",
  bio: "Artisan jeweler specializing in 925 silver and sustainable gemstones. Every piece is handcrafted with love and secured by SafeDeal's smart escrow system.",
  stats: {
    deals: 247,
    rating: 4.9,
    disputes: 0,
    success: "100%"
  },
  reputation: {
    delivery: 5,
    accuracy: 5,
    communication: 4,
    overall: 4.9
  },
  progress: {
    current: 247,
    nextThreshold: 500,
    nextBadge: "Verified Seller"
  }
};

const DEAL_HISTORY = [
  { date: "March 2026", category: "Jewelry", amount: "₹1,000-2,000", rating: 5 },
  { date: "March 2026", category: "Clothing", amount: "₹500-1,000", rating: 5 },
  { date: "Feb 2026", category: "Jewelry", amount: "₹4,000-5,000", rating: 5 },
  { date: "Feb 2026", category: "Jewelry", amount: "₹2,000-3,000", rating: 4 },
  { date: "Jan 2026", category: "Accessories", amount: "₹1,000-1,500", rating: 5 },
  { date: "Jan 2026", category: "Jewelry", amount: "₹5,000-7,000", rating: 5 },
];

const ACTIVE_LISTINGS = [
  { id: "4822", title: "Handmade Silver Earrings", amountUSDC: 24.00, amountINR: 1997 },
  { id: "4823", title: "Silver Necklace Set", amountUSDC: 35.00, amountINR: 2921 },
  { id: "4824", title: "Amethyst Ring", amountUSDC: 18.00, amountINR: 1498 },
];

export default function MerchantPage({ params }: { params: { id: string } }) {
  const merchantId = params.id;
  const [activeTab, setActiveTab] = useState<"listings" | "history">("listings");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-6 pt-24">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
        {/* Search/Header background */}
        <div className="h-32 w-full bg-[#111] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#06B6D4] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#EC4899] rounded-full blur-[100px]" />
          </div>
        </div>

        <main className="mx-auto max-w-lg px-6 pb-24 -mt-16 relative z-10 italic-none">
          {/* SELLER HEADER */}
          <div className="glass-card rounded-2xl p-8">
            <div className="flex flex-col items-center text-center italic-none">
              <div className="size-24 rounded-2xl bg-[#111] flex items-center justify-center text-white text-3xl font-black ring-8 ring-[#050505]">
                {MERCHANT_DATA.avatar}
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex flex-col items-center gap-2">
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight">{MERCHANT_DATA.name}</h1>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 fill-emerald-100" />
                    {MERCHANT_DATA.trustBadge}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#999]">{MERCHANT_DATA.category}</p>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-bold text-[#999]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-[#999]" />
                  {MERCHANT_DATA.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-[#999]" />
                  Since {MERCHANT_DATA.memberSince}
                </div>
              </div>

              <p className="mt-6 text-sm text-[#999] leading-relaxed max-w-sm font-light">
                {MERCHANT_DATA.bio} ⚖️ ID: {merchantId}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-4 gap-2">
              {[
                { label: "Deals", value: MERCHANT_DATA.stats.deals, icon: Package, color: "text-[#06B6D4]" },
                { label: "Rating", value: `${MERCHANT_DATA.stats.rating}★`, icon: Star, color: "text-orange-500" },
                { label: "Disputes", value: MERCHANT_DATA.stats.disputes, icon: ShieldAlert, color: "text-red-500" },
                { label: "Success", value: MERCHANT_DATA.stats.success, icon: TrendingUp, color: "text-emerald-500" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center rounded-2xl bg-[#111] border border-white/[0.08] py-4">
                  <span className={cn("text-lg font-black", stat.color)}>{stat.value}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#999] mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TRUST BADGE DETAIL */}
          <div className="mt-8 rounded-2xl bg-[#111] p-8 text-white border border-white/[0.08]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">Reputation Level</p>
                <h3 className="text-2xl font-black">{MERCHANT_DATA.trustBadge}</h3>
              </div>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/[0.08]">
                <Trophy className="size-8 text-emerald-400 italic-none" />
              </div>
            </div>

            <p className="mt-4 text-sm text-[#999] leading-relaxed font-light">
              Awarded to merchants with high volume and zero unresolved disputes.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex justify-between text-[11px] font-bold text-[#999]">
                <span>Goal: {MERCHANT_DATA.progress.nextBadge}</span>
                <span>{MERCHANT_DATA.progress.current} / {MERCHANT_DATA.progress.nextThreshold}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(MERCHANT_DATA.progress.current / MERCHANT_DATA.progress.nextThreshold) * 100}%` }}
                  className="h-full bg-emerald-500 rounded-full" 
                />
              </div>
            </div>
          </div>

          {/* REPUTATION BREAKDOWN */}
          <div className="mt-8 glass-card rounded-2xl p-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] mb-6">Reputation Breakdown</h4>
            <div className="space-y-6">
              {[
                { label: "Delivery Speed", score: MERCHANT_DATA.reputation.delivery },
                { label: "Item Accuracy", score: MERCHANT_DATA.reputation.accuracy },
                { label: "Communication", score: MERCHANT_DATA.reputation.communication },
              ].map((rep, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{rep.label}</span>
                  <div className="flex gap-1 italic-none">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className={cn("size-3 italic-none", s < rep.score ? "fill-orange-400 text-orange-400" : "text-slate-200")} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI VERIFICATION SECTION */}
          <div className="mt-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-8 flex items-start gap-4">
             <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="size-6" />
             </div>
             <div>
                <h4 className="text-sm font-black text-white">AI Identity Verification</h4>
                <p className="text-xs font-light text-[#999] mt-1 leading-relaxed">
                  Identity verified via <span className="text-emerald-400 font-bold">SafeDeal Shield™</span> and government-issued documents on May 12, 2024. Bio-metric matching score: 98.4%.
                </p>
             </div>
          </div>

          {/* CONTENT TABS */}
          <div className="mt-12 space-y-8">
            <div className="flex gap-4 border-b border-white/[0.08]">
              <button 
                onClick={() => setActiveTab("listings")}
                className={cn(
                  "pb-4 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200",
                  activeTab === "listings" ? "text-white border-b-2 border-[#06B6D4]" : "text-[#999] hover:text-white"
                )}
              >
                Listings
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={cn(
                  "pb-4 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200",
                  activeTab === "history" ? "text-white border-b-2 border-[#06B6D4]" : "text-[#999] hover:text-white"
                )}
              >
                History
              </button>
            </div>

            <div>
              {activeTab === "listings" ? (
                <div className="grid gap-4">
                  {ACTIVE_LISTINGS.map((deal) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={deal.id} 
                      className="p-6 glass-card rounded-2xl transition-all hover:-translate-y-1 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h5 className="font-black text-white text-lg">{deal.title}</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black accent-gradient-text">{deal.amountUSDC.toFixed(2)} USDC</span>
                          </div>
                        </div>
                        <div className="size-10 flex items-center justify-center rounded-xl bg-white/[0.05] text-[#999] group-hover:accent-gradient group-hover:text-white transition-all">
                          <ChevronRight className="size-5 italic-none" />
                        </div>
                      </div>
                      <GradientButton className="mt-6 w-full rounded-2xl py-4 flex items-center gap-2 font-black italic-none">
                         Pay with Escrow
                         <ArrowUpRight className="size-4 italic-none" />
                      </GradientButton>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden glass-card rounded-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#050505] border-b border-white/[0.08]">
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Date</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {DEAL_HISTORY.map((deal, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-[#999]">{deal.date}</td>
                            <td className="px-6 py-4 text-xs text-right italic-none">
                              <div className="flex justify-end gap-0.5 italic-none">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                    key={s} 
                                    className={cn(
                                      "size-3 italic-none", 
                                      s <= deal.rating ? "fill-orange-400 text-orange-400" : "text-slate-200"
                                    )} 
                                  />
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* REPORT SELLER */}
           <div className="mt-16 text-center">
             <button className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#999] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
               <Flag className="size-4 italic-none" />
               Report Seller
             </button>
          </div>
        </main>

        {/* Footer Nav for Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-t border-white/[0.08] flex justify-around p-4 md:hidden">
           <button className="flex flex-col items-center gap-1 text-[#999]">
             <Shield className="size-5" />
             <span className="text-[10px] font-bold">Safeguard</span>
           </button>
           <button className="flex flex-col items-center gap-1 text-[#06B6D4]">
             <History className="size-5" />
             <span className="text-[10px] font-bold">Activity</span>
           </button>
           <button className="flex flex-col items-center gap-1 text-[#999]">
             <MessageSquare className="size-5" />
             <span className="text-[10px] font-bold">Support</span>
           </button>
        </nav>
      </div>
    </ErrorBoundary>
  );
}
