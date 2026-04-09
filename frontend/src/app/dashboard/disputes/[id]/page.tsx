"use client";

import { useState, useEffect } from "react";
import { 
  Upload, 
  History, 
  ShieldAlert, 
  ArrowLeft,
  FileText,
  Clock,
  Loader2
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWallet } from "@/context/WalletContext";
import { getDispute, submitEvidence } from "@/lib/stellar";

type DisputeStatus = "pending_evidence" | "under_review" | "resolved_refund" | "resolved_payout" | string;

export default function DisputePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [status, setStatus] = useState<DisputeStatus>("pending_evidence");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dealData, setDealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [evidenceExplanation, setEvidenceExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDispute = async () => {
      try {
        const dispute = await getDispute(params.id);
        if (dispute) {
          setDealData({
            id: dispute.id,
            title: `SafeDeal #${dispute.dealId}`, // We don't have the original deal's title natively mapped here, so we mock or use dealId
            amount: `${dispute.amount} USDC`,
            buyer: dispute.buyer,
            seller: dispute.seller,
            reason: dispute.reason,
            openedOn: new Date(dispute.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            rawStatus: dispute.status
          });
          setStatus(dispute.status);
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };
    fetchDispute();
  }, [params.id]);

  const handleSubmitEvidence = async () => {
    if (!publicKey) return toast.error("Connect your wallet first");
    
    setSubmitting(true);
    try {
      // Mock hash generation
      const evidenceHash = "hash_" + Date.now().toString(16);
      const evidenceType = "text_explanation";

      await submitEvidence(
        params.id,
        publicKey,
        evidenceType,
        evidenceHash
      );
      toast.success("Evidence submitted successfully");
      setEvidenceExplanation("");
    } catch {
      toast.error("Failed to submit evidence");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-w-0 bg-[#050505] flex items-center justify-center min-h-screen">
        <Loader2 className="size-10 text-[#999] animate-spin" />
      </div>
    );
  }

  if (!dealData) {
    return (
      <div className="flex-1 min-w-0 bg-[#050505] flex items-center justify-center min-h-screen pb-20 text-white">
        <div className="text-center">
          <ShieldAlert className="size-16 text-[#999] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white uppercase">Dispute Not Found</h2>
        </div>
      </div>
    );
  }

  const isResolved = status === "resolved_payout" || status === "resolved_refund" || status.toLowerCase() === "dismissed";

  return (
    <div className="flex-1 min-w-0 bg-[#050505] pb-20 font-sans text-white min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-md h-16 flex items-center px-6 lg:px-10 justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#999] hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase text-[#999] tracking-[0.2em]">Status:</span>
           <span className={cn(
             "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
             status === "pending_evidence" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
             status === "under_review" ? "bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20" :
             "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
           )}>
             {status.replace("_", " ")}
           </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 lg:px-10 py-10 space-y-8">
        
        {/* DISPUTE HEADER */}
        <div className="glass-card rounded-2xl p-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-6 items-center">
                 <div className="size-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center text-3xl">
                    <ShieldAlert className="size-8" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Dispute #{dealData.id}</p>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">Evidence Review: {dealData.title}</h1>
                    <p className="text-sm font-bold text-[#999]">Reason: <span className="text-red-400 font-bold">{dealData.reason}</span></p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] mb-1">Escrowed Amount</p>
                 <p className="text-2xl font-black accent-gradient-text">{dealData.amount}</p>
              </div>
           </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
           
           {/* EVIDENCE SUBMISSION */}
           <div className="lg:col-span-2 space-y-8">
              
              <div className="glass-card rounded-2xl overflow-hidden">
                 <div className="p-8 pb-4">
                    <h3 className="text-lg font-black flex items-center gap-2 text-white">
                       <Upload className="size-5 text-[#06B6D4]" />
                       Submit Evidence
                    </h3>
                    <p className="text-[#999] font-light text-sm mt-1">Upload receipts, shipping photos, or chat logs to support your case.</p>
                 </div>
                 <div className="p-8 space-y-6">
                    {!isResolved ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="rounded-2xl border-2 border-dashed border-white/[0.08] p-8 text-center flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-white/[0.03] transition-all duration-200">
                              <FileText className="size-8 text-[#999] group-hover:text-white group-hover:scale-110 transition-all duration-200" />
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Shipping Bill</p>
                           </div>
                           <div className="rounded-2xl border-2 border-dashed border-white/[0.08] p-8 text-center flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-white/[0.03] transition-all duration-200">
                              <FileText className="size-8 text-[#999] group-hover:text-white group-hover:scale-110 transition-all duration-200" />
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Packing Proof</p>
                           </div>
                        </div>
                        <textarea 
                          value={evidenceExplanation}
                          onChange={(e) => setEvidenceExplanation(e.target.value)}
                          placeholder="Add an optional explanation for the arbiter..."
                          className="w-full rounded-2xl border border-white/[0.08] bg-[#111] p-4 text-xs font-bold text-white focus:bg-[#050505] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 transition-all resize-none min-h-[100px] placeholder-[#999]"
                        />
                        <GradientButton className="w-full rounded-2xl py-4 font-bold uppercase tracking-[0.2em] text-xs" onClick={handleSubmitEvidence} disabled={submitting}>
                           {submitting ? "Submitting..." : "Submit to Arbiter"}
                        </GradientButton>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <ShieldAlert className="size-16 text-[#999] mx-auto mb-4" />
                        <h4 className="text-lg font-black text-white">Dispute Closed</h4>
                        <p className="text-[#999] font-light text-sm">Evidence submission is no longer allowed.</p>
                      </div>
                    )}
                 </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                 <div className="p-8 pb-4">
                    <h3 className="text-lg font-black flex items-center gap-2 text-[#999]">
                       <History className="size-5" />
                       Evidence Log
                    </h3>
                 </div>
                 <div className="p-8">
                    <p className="text-sm font-light text-[#999] mb-4">No recent evidence found or syncing with contract.</p>
                 </div>
              </div>
           </div>

           {/* RESOLUTION TIMELINE */}
           <div className="space-y-8">
              <div className="rounded-2xl bg-[#111] text-white p-8 border border-white/[0.08]">
                 <div className="flex items-center gap-2 mb-8">
                    <History className="size-4 text-[#06B6D4]" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">Dispute Timeline</h2>
                 </div>
                 <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.05]">
                    <TimelineItem title="Dispute Opened" date={dealData.openedOn} active />
                    <TimelineItem title="Awaiting Evidence" date="Pending" active={status === "pending_evidence"} dotColor="bg-amber-400" />
                    <TimelineItem title="Arbiter Review" date="In Progress" active={status === "under_review"} dotColor="bg-[#06B6D4]" />
                    <TimelineItem title="Resolved" date={isResolved ? "Closed" : "Pending"} active={isResolved} />
                 </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                 <div className="p-8 pb-4">
                    <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-[#999]">
                       Arbiter Verdict
                    </h3>
                 </div>
                 <div className="p-8 flex flex-col items-center text-center">
                    <div className="size-16 rounded-2xl bg-white/[0.03] flex items-center justify-center text-[#999] mb-4">
                       <Clock className="size-8" />
                    </div>
                    {isResolved ? (
                      <p className="text-sm font-bold text-[#999]">Decision reached: <span className="text-emerald-400 font-black">{dealData.rawStatus}</span></p>
                    ) : (
                      <p className="text-sm font-light text-[#999]">Awaiting final decision from arbiter.</p>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

function TimelineItem({ title, date, active = false, dotColor = "bg-emerald-500" }: { title: string; date: string; active?: boolean; dotColor?: string }) {
  return (
    <div className="flex gap-6 relative">
       <div className={cn(
          "size-[24px] rounded-full flex items-center justify-center shrink-0 z-10 transition-all",
          active ? "bg-white text-[#050505]" : "bg-white/[0.05] text-white/20 border border-white/[0.08]"
       )}>
          <div className={cn("size-2 rounded-full", active ? dotColor : "bg-white/10")} />
       </div>
       <div className="space-y-0.5">
          <h3 className={cn("text-xs font-bold uppercase tracking-[0.2em]", active ? "text-white" : "text-white/20")}>{title}</h3>
          <p className={cn("text-[10px] font-bold", active ? "text-[#999]" : "text-white/10")}>{date}</p>
       </div>
    </div>
  );
}
