"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft, 
  Copy, 
  Share2, 
  Ban, 
  Truck,
  MessageSquare,
  History,
  ExternalLink
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProfileSkeleton } from "@/components/ui/loading-skeletons";
import ErrorBoundary from "@/components/ErrorBoundary";

type DealStatus = "waiting" | "locked" | "shipped" | "completed" | "disputed";

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<DealStatus>("locked");
  const [loading, setLoading] = useState(true);

  // Mock data for the specific deal
  const deal = {
    id: params.id,
    title: "Handmade Silver Earrings",
    amountUSDC: "2,400.00",
    buyer: "GCKF...WXQR",
    createdDate: "March 13, 2:30 PM",
    lockedDate: "March 13, 3:45 PM",
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`safedeal.app/deal/${deal.id}`);
    toast.success("Link copied to clipboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 pb-20">
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md h-16 flex items-center px-6 lg:px-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </button>
        </header>

        <main className="mx-auto max-w-5xl px-6 lg:px-10 py-10 space-y-8">
          
          {/* TOP STATUS OVERVIEW */}
          <section className="rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-sm">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-6 items-center">
                   <div className="size-16 rounded-3xl bg-slate-900 flex items-center justify-center text-3xl shadow-xl shadow-slate-900/20">
                      🛍️
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deal #{deal.id}</p>
                      <h1 className="text-2xl font-black text-slate-900">{deal.title}</h1>
                      <div className="flex items-center gap-3 mt-2">
                         <span className="text-xl font-black text-emerald-600">{deal.amountUSDC} USDC</span>
                         <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                            {status === "locked" ? "Payment Locked" : status}
                         </span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={handleCopyLink} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                      <Copy className="size-4" />
                      Copy
                   </button>
                   <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                      <Share2 className="size-4" />
                      Share
                   </button>
                </div>
             </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-2 items-start">
             
             {/* LEFT COLUMN: TIMELINE */}
             <article className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-8">
                <div className="flex items-center gap-2 mb-10">
                   <History className="size-4 text-slate-400" />
                   <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Transaction Timeline</h2>
                </div>
                
                <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                   <TimelineItem 
                      title="Deal Created"
                      subtitle={deal.createdDate}
                      completed
                   />
                   <TimelineItem 
                      title="Payment Locked"
                      subtitle={`${deal.lockedDate} — "Buyer ${deal.buyer} locked ${deal.amountUSDC} USDC"`}
                      completed={status !== "waiting"}
                      active={status === "locked"}
                   />
                   <TimelineItem 
                      title="Awaiting Delivery Confirmation"
                      subtitle="Funds are securely held in Stellar escrow"
                      active={status === "shipped"}
                      completed={status === "completed"}
                   />
                   <TimelineItem 
                      title="Payment Released"
                      subtitle="Funds will be transferred to your wallet"
                      completed={status === "completed"}
                   />
                </div>
             </article>

             {/* RIGHT COLUMN: RISK & ACTIONS */}
             <div className="space-y-8">
                
                {/* BUYER RISK ASSESSMENT */}
                <article className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                      <ShieldCheck className="size-32" />
                   </div>
                   
                   <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">Buyer Risk Assessment</h2>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                         <CheckCircle2 className="size-3.5" />
                         <span className="text-[10px] font-black uppercase">Level: Safe</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Risk Score</p>
                         <p className="text-3xl font-black text-white">23<span className="text-sm text-slate-500">/100</span></p>
                      </div>
                      <div className="space-y-1 text-right">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Wallet Age</p>
                         <p className="text-xl font-bold">847 days</p>
                      </div>
                   </div>

                   <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Deals</p>
                         <p className="text-lg font-bold">34</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Disputes</p>
                         <p className="text-lg font-bold">0</p>
                      </div>
                   </div>
                </article>

                {/* ACTION PANEL */}
                <article className="rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-sm">
                   <div className="flex items-center gap-2 mb-8">
                      <div className="size-1 rounded-full bg-slate-200" />
                      <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Contextual Actions</h2>
                   </div>

                   <div className="space-y-4">
                      {status === "waiting" && (
                         <>
                            <GradientButton className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-xs" onClick={() => toast.info("Link shared again")}>
                               Share Link Again
                            </GradientButton>
                            <button className="w-full rounded-2xl border border-red-100 py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
                               <Ban className="inline-block mr-2 size-3.5" />
                               Cancel Deal
                            </button>
                         </>
                      )}

                      {status === "locked" && (
                         <>
                            <GradientButton className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-xs" onClick={() => {
                               setStatus("shipped");
                               toast.success("Deal marked as shipped!");
                            }}>
                               <Truck className="inline-block mr-2 size-4" />
                               Mark as Shipped
                            </GradientButton>
                            <button className="w-full rounded-2xl border border-red-100 py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
                               <AlertTriangle className="inline-block mr-2 size-3.5" />
                               Cancel & Refund
                            </button>
                         </>
                      )}

                      {status === "shipped" && (
                         <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-3">
                            <Clock className="size-8 text-slate-400 mx-auto animate-spin-slow" />
                            <p className="text-sm font-bold text-slate-900">Waiting for buyer confirmation...</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Funds are locked in escrow until the buyer confirms receipt on their side.</p>
                         </div>
                      )}

                      {status === "disputed" && (
                         <div className="space-y-3">
                            <GradientButton className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-xs">
                               <MessageSquare className="inline-block mr-2 size-4" />
                               Submit Evidence
                            </GradientButton>
                            <button className="w-full rounded-2xl border border-slate-200 py-4 text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-colors">
                               <ExternalLink className="inline-block mr-2 size-3.5" />
                               View Dispute Details
                            </button>
                          </div>
                      )}
                   </div>
                </article>

                 {/* SHARE LINK SECTION */}
                 <article className="rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                       <Share2 className="size-4 text-slate-400" />
                       <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Strategic Sharing</h2>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Payment URL</p>
                       <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                          <span className="flex-1 font-mono text-xs font-bold text-slate-500 truncate italic-none">safedeal.app/deal/{deal.id}</span>
                          <button 
                             onClick={handleCopyLink}
                             className="size-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 hover:border-slate-900 transition-colors"
                          >
                             <Copy className="size-4" />
                          </button>
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                          Share this link with your buyer. They will be prompted to connect their wallet and lock the USDC amount.
                       </p>
                    </div>
                 </article>
              </div>
           </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

function TimelineItem({ title, subtitle, completed = false, active = false }: { title: string; subtitle: string; completed?: boolean; active?: boolean }) {
  return (
    <div className="flex gap-6 relative">
       <div className={cn(
          "size-[24px] rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500",
          completed ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : active ? "bg-white border-2 border-emerald-500 text-emerald-500" : "bg-white border-2 border-slate-100 text-slate-200"
       )}>
          {completed ? <CheckCircle2 className="size-3.5" /> : <div className="size-2 rounded-full bg-current" />}
       </div>
       <div className="space-y-1 pb-2">
          <h3 className={cn("text-xs font-black uppercase tracking-widest transition-colors", completed ? "text-slate-900" : active ? "text-emerald-600" : "text-slate-400")}>{title}</h3>
          <p className={cn("text-xs leading-relaxed transition-colors", (completed || active) ? "text-slate-500 font-medium" : "text-slate-300")}>{subtitle}</p>
       </div>
    </div>
  );
}
