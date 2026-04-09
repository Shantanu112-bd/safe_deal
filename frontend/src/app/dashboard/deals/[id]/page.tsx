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
import { getDeal, type DealData } from "@/lib/stellar";

type DealStatus = "waiting" | "waitingforpayment" | "locked" | "shipped" | "completed" | "disputed";

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<DealStatus>("locked");
  const [loading, setLoading] = useState(true);

  const [deal, setDeal] = useState<DealData | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const loadDeal = async () => {
      setLoading(true);
      try {
        const d = await getDeal(params.id);
        if (d) {
          setDeal(d);
          setStatus(d.status.toLowerCase() as DealStatus);
        } else {
          toast.error("Deal not found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load deal details");
      } finally {
        setLoading(false);
      }
    };

    loadDeal();
  }, [params.id]);

  useEffect(() => {
    if (typeof window !== "undefined" && deal) {
      if (localStorage.getItem(`shipped_${deal.id}`) === "true" && deal.status === "Locked") {
        setStatus("shipped");
      }
    }
  }, [deal]);

  const handleCopyLink = () => {
    if (!deal) return;
    navigator.clipboard.writeText(`safedeal.app/deal/${deal.id}`);
    toast.success("Link copied to clipboard");
  };

  if (loading || !deal) {
    return (
      <div className="min-h-screen bg-[#050505] p-6 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#050505] pb-20 text-white font-sans">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-md h-16 flex items-center px-6 lg:px-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#999] hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </button>
        </header>

        <main className="mx-auto max-w-5xl px-6 lg:px-10 py-10 space-y-8">
          
          {/* TOP STATUS OVERVIEW */}
          <section className="glass-card rounded-2xl p-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-6 items-center">
                   <div className="size-16 rounded-2xl bg-[#111] border border-white/[0.08] flex items-center justify-center text-3xl">
                      🛍️
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Deal #{deal.id}</p>
                      <h1 className="text-2xl font-black text-white uppercase tracking-tight">{deal.title}</h1>
                      <div className="flex items-center gap-3 mt-2">
                         <span className="text-xl font-black accent-gradient-text">{deal.amountUSDC} USDC</span>
                         <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {status === "locked" ? "Payment Locked" : status}
                         </span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={handleCopyLink} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass text-xs font-bold uppercase tracking-[0.2em] text-white/70 hover:text-white transition-all duration-200">
                      <Copy className="size-4" />
                      Copy
                   </button>
                   <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass text-xs font-bold uppercase tracking-[0.2em] text-white/70 hover:text-white transition-all duration-200">
                      <Share2 className="size-4" />
                      Share
                   </button>
                </div>
             </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-2 items-start">
             
             {/* LEFT COLUMN: TIMELINE */}
             <article className="glass-card rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-10">
                   <History className="size-4 text-[#999]" />
                   <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Transaction Timeline</h2>
                </div>
                
                <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
                   <TimelineItem 
                      title="Deal Created"
                      subtitle={new Date(deal.createdAt).toLocaleString()}
                      completed
                   />
                   <TimelineItem 
                      title="Payment Locked"
                      subtitle={`Buyer ${deal.buyerKey ? deal.buyerKey.slice(0, 6) + '...' : 'Unknown'} locked ${deal.amountUSDC} USDC`}
                      completed={status !== "waiting" && status !== "waitingforpayment"}
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
                <article className="rounded-2xl p-8 text-white overflow-hidden relative" style={{ background: "#111" }}>
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                      <ShieldCheck className="size-32" />
                   </div>
                   
                   <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4]">Buyer Risk Assessment</h2>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                         <CheckCircle2 className="size-3.5" />
                         <span className="text-[10px] font-bold uppercase">Level: Safe</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Risk Score</p>
                         <p className="text-3xl font-black text-white">23<span className="text-sm text-[#999]">/100</span></p>
                      </div>
                      <div className="space-y-1 text-right">
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Wallet Age</p>
                         <p className="text-xl font-bold">847 days</p>
                      </div>
                   </div>

                   <div className="mt-8 pt-8 border-t border-white/[0.08] grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.05]">
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] mb-1">Total Deals</p>
                         <p className="text-lg font-bold">34</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.05]">
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] mb-1">Disputes</p>
                         <p className="text-lg font-bold">0</p>
                      </div>
                   </div>
                </article>

                {/* ACTION PANEL */}
                <article className="glass-card rounded-2xl p-8">
                   <div className="flex items-center gap-2 mb-8">
                      <div className="size-1 rounded-full bg-[#999]" />
                      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Contextual Actions</h2>
                   </div>

                   <div className="space-y-4">
                      {status === "waiting" && (
                         <>
                            <GradientButton className="w-full rounded-2xl py-4 font-bold uppercase tracking-[0.2em] text-xs" onClick={() => toast.info("Link shared again")}>
                               Share Link Again
                            </GradientButton>
                            <button className="w-full rounded-2xl border border-red-500/20 py-4 text-xs font-bold uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 transition-colors duration-200">
                               <Ban className="inline-block mr-2 size-3.5" />
                               Cancel Deal
                            </button>
                         </>
                      )}

                      {status === "locked" && (
                         <>
                            <GradientButton className="w-full rounded-2xl py-4 font-bold uppercase tracking-[0.2em] text-xs" onClick={() => {
                               setStatus("shipped");
                               toast.success("Deal marked as shipped!");
                            }}>
                               <Truck className="inline-block mr-2 size-4" />
                               Mark as Shipped
                            </GradientButton>
                            <button className="w-full rounded-2xl border border-red-500/20 py-4 text-xs font-bold uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 transition-colors duration-200">
                               <AlertTriangle className="inline-block mr-2 size-3.5" />
                               Cancel & Refund
                            </button>
                         </>
                      )}

                      {status === "shipped" && (
                         <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center space-y-3">
                            <Clock className="size-8 text-[#999] mx-auto animate-spin-slow" />
                            <p className="text-sm font-bold text-white">Waiting for buyer confirmation...</p>
                            <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em]">Funds are locked in escrow until the buyer confirms receipt on their side.</p>
                         </div>
                      )}

                      {status === "disputed" && (
                         <div className="space-y-3">
                            <GradientButton className="w-full rounded-2xl py-4 font-bold uppercase tracking-[0.2em] text-xs">
                               <MessageSquare className="inline-block mr-2 size-4" />
                               Submit Evidence
                            </GradientButton>
                            <button className="w-full rounded-2xl border border-white/[0.1] py-4 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white/[0.03] transition-colors duration-200">
                               <ExternalLink className="inline-block mr-2 size-3.5" />
                               View Dispute Details
                            </button>
                          </div>
                      )}
                   </div>
                </article>

                 {/* SHARE LINK SECTION */}
                 <article className="glass-card rounded-2xl p-8 space-y-6">
                    <div className="flex items-center gap-2">
                       <Share2 className="size-4 text-[#999]" />
                       <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Strategic Sharing</h2>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em]">Customer Payment URL</p>
                       <div className="flex items-center gap-2 p-4 rounded-2xl bg-[#111] border border-white/[0.08] group">
                          <span className="flex-1 font-mono text-xs font-bold text-[#999] truncate italic-none">safedeal.app/deal/{deal.id}</span>
                          <button 
                             onClick={handleCopyLink}
                             className="size-10 flex items-center justify-center rounded-xl glass hover:border-white/20 transition-colors duration-200"
                          >
                             <Copy className="size-4" />
                          </button>
                       </div>
                       <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] leading-relaxed">
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
          completed ? "bg-[#06B6D4] text-white" : active ? "bg-[#050505] border-2 border-[#06B6D4] text-[#06B6D4]" : "bg-[#050505] border-2 border-white/[0.1] text-white/20"
       )}>
          {completed ? <CheckCircle2 className="size-3.5" /> : <div className="size-2 rounded-full bg-current" />}
       </div>
       <div className="space-y-1 pb-2">
          <h3 className={cn("text-xs font-bold uppercase tracking-[0.2em] transition-colors", completed ? "text-white" : active ? "text-[#06B6D4]" : "text-[#999]")}>{title}</h3>
          <p className={cn("text-xs leading-relaxed transition-colors font-light", (completed || active) ? "text-[#ccc]" : "text-[#666]")}>{subtitle}</p>
       </div>
    </div>
  );
}
