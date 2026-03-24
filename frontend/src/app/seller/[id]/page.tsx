"use client";

import { Star, ShieldCheck, MapPin, Package, Clock, Share2, BadgeCheck } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Mock Data
export default function SellerProfilePage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching seller data
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  const badges = [
    { title: "Fast Shipper", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Top Rated", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
    { title: "Verified Identity", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#030712] font-sans text-slate-200 pb-20">
        
        {/* Header / Banner Gradients */}
        <div className="h-64 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/20 via-[#06b6d4]/20 to-[#6366f1]/20" />
          <div className="absolute inset-0 backdrop-blur-[100px]" />
          <div className="absolute inset-0 bg-[#0f0f1a]/40" />
          
          {/* Cover abstract pattern placeholder */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 -mt-24">
          
          {/* Profile Card */}
          <div className="bg-[#0f0f1a] rounded-[2rem] border border-white/10 p-6 md:p-10 shadow-2xl backdrop-blur-md flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            {/* Glow border for avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-3xl blur-md" />
              <div className="w-32 h-32 rounded-3xl bg-[#030712] relative flex items-center justify-center overflow-hidden border-2 border-transparent" style={{ backgroundClip: "padding-box" }}>
                 <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                   <Package className="w-12 h-12 text-indigo-400" />
                 </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    VintageStoreHQ 
                    <BadgeCheck className="w-6 h-6 text-emerald-500 mt-1" />
                  </h1>
                  <p className="text-slate-400 font-mono text-sm mt-1">{params.id.slice(0,8)}...{params.id.slice(-4)}</p>
                </div>
                
                <div className="flex gap-2">
                  <button className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-bold text-sm">
                    Follow
                  </button>
                  <button className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-6 border-y border-white/5 py-4">
                <div>
                  <p className="text-2xl font-black text-white">4.9</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-500" /> 128 Reviews
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-black text-white">450+</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                    <Package className="w-3 h-3" /> Deals Completed
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-black text-white">₹1.2M</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                    Volume Processed
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {badges.map((b, i) => (
                  <div key={i} className={cn("px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold", b.bg, b.color)}>
                    <b.icon className="w-3.5 h-3.5" /> {b.title}
                  </div>
                ))}
                <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold bg-white/5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5" /> India
                </div>
              </div>
            </div>
          </div>

          {/* Deals Section */}
          <div className="mt-16">
            <h3 className="text-xl font-black text-white mb-6">Active Storefront Deals</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Leather Crossbody Bag", price: "$45.00", img: "bg-amber-900/20" },
                { title: "Vintage Typewriter", price: "$120.00", img: "bg-stone-800/20" },
                { title: "Custom Engraved Watch", price: "$85.00", img: "bg-blue-900/20" },
                { title: "Handmade Ceramic Set", price: "$60.00", img: "bg-emerald-900/20" },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl group cursor-pointer">
                  <div className={cn("h-48 w-full flex items-center justify-center", item.img)}>
                    <Package className="w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-5">
                    <p className="font-bold text-white text-lg">{item.title}</p>
                    <p className="text-emerald-400 font-black text-xl mt-2">{item.price}</p>
                    <button className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm group-hover:bg-emerald-500 group-hover:border-transparent group-hover:text-white transition-all text-slate-300">
                      Buy Securely
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </ErrorBoundary>
  );
}
