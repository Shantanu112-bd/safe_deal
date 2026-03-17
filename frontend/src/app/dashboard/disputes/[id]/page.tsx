"use client";

import { useState } from "react";
import { 
  Upload, 
  History, 
  ShieldAlert, 
  ArrowLeft,
  FileText,
  Clock
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type DisputeStatus = "pending_evidence" | "under_review" | "resolved_refund" | "resolved_payout";

export default function DisputePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [status] = useState<DisputeStatus>("pending_evidence");

  const dealData = {
    id: params.id,
    title: "Handmade Silver Earrings",
    amount: "2,400 USDC",
    buyer: "GCKF...WXQR",
    seller: "Priya's Jewelry",
    reason: "Item not as described (Color mismatch)",
    openedOn: "March 15, 2026"
  };

  const handleUpload = () => {
    toast.info("Evidence uploaded and hash committed to Stellar network.");
  };

  return (
    <div className="flex-1 min-w-0 bg-slate-50 pb-20 font-sans italic-none">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md h-16 flex items-center px-6 lg:px-10 justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <div className="flex items-center gap-2 italic-none">
           <span className="text-[10px] font-black uppercase text-slate-400">Status:</span>
           <Badge className={cn(
             "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
             status === "pending_evidence" ? "bg-amber-50 text-amber-600 border-amber-200" :
             status === "under_review" ? "bg-blue-50 text-blue-600 border-blue-200" :
             "bg-emerald-50 text-emerald-600 border-emerald-200"
           )}>
             {status.replace("_", " ")}
           </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 lg:px-10 py-10 space-y-8">
        
        {/* DISPUTE HEADER */}
        <div className="rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-sm italic-none">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-6 items-center">
                 <div className="size-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center text-3xl shadow-xl shadow-red-500/10">
                    <ShieldAlert className="size-8" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dispute #SD-{dealData.id}</p>
                    <h1 className="text-2xl font-black text-slate-900 italic-none">Evidence Review: {dealData.title}</h1>
                    <p className="text-sm font-bold text-slate-500 italic-none">Reason: <span className="text-red-500 font-black">{dealData.reason}</span></p>
                 </div>
              </div>
              <div className="text-right italic-none">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Escrowed Amount</p>
                 <p className="text-2xl font-black text-slate-900 italic-none">{dealData.amount}</p>
              </div>
           </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-start italic-none">
           
           {/* EVIDENCE SUBMISSION */}
           <div className="lg:col-span-2 space-y-8 italic-none">
              
              <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden italic-none">
                 <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg font-black flex items-center gap-2 italic-none">
                       <Upload className="size-5 text-[#0b50da]" />
                       Submit Evidence (Seller)
                    </CardTitle>
                    <CardDescription className="font-bold">Upload receipts, shipping photos, or chat logs to support your case.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6 italic-none">
                    <div className="grid grid-cols-2 gap-4 italic-none">
                       <div className="rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-50 transition-all">
                          <FileText className="size-8 text-slate-300 group-hover:text-slate-900 group-hover:scale-110 transition-all" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic-none">Shipping Bill</p>
                       </div>
                       <div className="rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-50 transition-all">
                          <FileText className="size-8 text-slate-300 group-hover:text-slate-900 group-hover:scale-110 transition-all" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic-none">Packing Proof</p>
                       </div>
                    </div>
                    <textarea 
                      placeholder="Add an optional explanation for the arbiter..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none transition-all resize-none min-h-[100px]"
                    />
                    <GradientButton className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-xs" onClick={handleUpload}>
                       Submit to Arbiter
                    </GradientButton>
                 </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden bg-slate-50/50 italic-none">
                 <CardHeader className="p-8 pb-4 italic-none">
                    <CardTitle className="text-lg font-black flex items-center gap-2 italic-none text-slate-400">
                       <Upload className="size-5" />
                       Evidence Submitted (Buyer)
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 italic-none">
                    <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 italic-none">
                       <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                          <FileText className="size-5" />
                       </div>
                       <div className="flex-1 italic-none">
                          <p className="text-xs font-black text-slate-900">mismatch_photo.jpg</p>
                          <p className="text-[10px] font-bold text-slate-400">Commit: stellar-tx-3a9b...</p>
                       </div>
                       <button className="text-[10px] font-black text-[#0b50da] hover:underline uppercase italic-none">View</button>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* RESOLUTION TIMELINE */}
           <div className="space-y-8 italic-none">
              <Card className="rounded-[2.5rem] bg-slate-900 text-white p-8 border-none italic-none">
                 <div className="flex items-center gap-2 mb-8 italic-none">
                    <History className="size-4 text-emerald-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic-none">Dispute Timeline</h2>
                 </div>
                 <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                    <TimelineItem title="Dispute Opened" date="Mar 15, 2:30 PM" active />
                    <TimelineItem title="Buyer Evidence" date="Mar 15, 2:45 PM" active />
                    <TimelineItem title="Awaiting Seller" date="In progress" active dotColor="bg-amber-400" />
                    <TimelineItem title="Arbiter Review" date="Estimated Mar 17" />
                 </div>
              </Card>

              <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden italic-none">
                 <CardHeader className="p-8 pb-4 italic-none">
                    <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-widest text-slate-400 italic-none">
                       Arbiter Verdict
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 flex flex-col items-center text-center italic-none">
                    <div className="size-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 italic-none">
                       <Clock className="size-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 italic-none">Awaiting evidence submission from <span className="text-slate-900 font-black">Seller</span> before final decision.</p>
                 </CardContent>
              </Card>
           </div>
        </div>
      </main>
    </div>
  );
}

function TimelineItem({ title, date, active = false, dotColor = "bg-emerald-500" }: { title: string; date: string; active?: boolean; dotColor?: string }) {
  return (
    <div className="flex gap-6 relative italic-none">
       <div className={cn(
          "size-[24px] rounded-full flex items-center justify-center shrink-0 z-10 transition-all italic-none",
          active ? "bg-white text-slate-900 shadow-lg" : "bg-white/5 text-white/20 border border-white/10"
       )}>
          <div className={cn("size-2 rounded-full", active ? dotColor : "bg-white/10")} />
       </div>
       <div className="space-y-0.5 italic-none">
          <h3 className={cn("text-xs font-black uppercase tracking-widest italic-none", active ? "text-white" : "text-white/20")}>{title}</h3>
          <p className={cn("text-[10px] font-bold italic-none", active ? "text-slate-400" : "text-white/10")}>{date}</p>
       </div>
    </div>
  );
}
