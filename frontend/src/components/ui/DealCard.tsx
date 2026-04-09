import { useState, useEffect } from "react";
import { Clock, Share2, Info, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { DealData } from "@/lib/stellar";

interface DealCardProps {
  deal: DealData;
  onRefresh?: () => void;
}

const statusColors: Record<string, string> = {
  WaitingForPayment: "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse",
  Locked: "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse",
  Shipped: "bg-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.6)]",
  Completed: "bg-[#EC4899]",
  Disputed: "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse",
  Refunded: "bg-[#999]",
  Cancelled: "bg-[#999]",
  Expired: "bg-[#666]",
};

export function DealCard({ deal, onRefresh }: DealCardProps) {
  const INR_RATE = 83.5;
  const inrAmount = (deal.amountUSDC * INR_RATE).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  
  const [isShipped, setIsShipped] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsShipped(localStorage.getItem(`shipped_${deal.id}`) === "true");
    }
  }, [deal.id]);

  const displayStatus = isShipped && deal.status === "Locked" ? "Shipped" : deal.status;

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
    if (mins > 60) return `${Math.floor(mins / 60)}h left`;
    return `${mins}m left`;
  };

  const handleShare = () => {
    const baseUrl = typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "https://safe-deal-ten.vercel.app"
      : window.location.origin;
    const dealUrl = `${baseUrl}/deal/${deal.id}`;
    navigator.clipboard.writeText(dealUrl);
    toast.success("Payment link copied to clipboard!");
    const shareText = `Hi! I've created a SafeDeal payment link for your order. Pay here: ${dealUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const markShipped = () => {
    localStorage.setItem(`shipped_${deal.id}`, "true");
    setIsShipped(true);
    toast.success("Item marked as shipped!");
    onRefresh?.();
  };

  return (
    <div className="group block rounded-2xl glass-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className={cn("absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none transition-colors", statusColors[displayStatus]?.split(" ")[0])} />

      <div className="flex flex-col h-full justify-between gap-6 relative z-10">
        
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="size-12 rounded-2xl bg-[#111] border border-white/[0.08] flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200">
              🛍️
            </div>
            <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded-full border border-white/[0.05]">
              <div className={cn("size-2 rounded-full", statusColors[displayStatus] || "bg-[#999]")} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">{displayStatus}</span>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] mb-1">Deal #{deal.id}</p>
          <h3 className="text-xl font-black text-white tracking-tight mb-2 line-clamp-1">{deal.title}</h3>
          
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="text-sm font-black accent-gradient-text bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-3 py-1 rounded-lg">
              {deal.amountUSDC.toFixed(2)} USDC
            </span>
            <span className="text-xs font-bold text-[#999] bg-white/[0.03] border border-white/[0.05] px-3 py-1 rounded-lg">
              ≈ ₹{inrAmount}
            </span>
          </div>

          {(displayStatus === "Locked" || displayStatus === "Shipped" || displayStatus === "Completed" || displayStatus === "Disputed") && deal.buyerKey && (
             <div className="mt-3 text-xs font-mono font-bold text-[#06B6D4] bg-[#06B6D4]/10 px-3 py-1.5 rounded-lg border border-[#06B6D4]/20 inline-block">
               Buyer: {deal.buyerKey.slice(0, 5)}...{deal.buyerKey.slice(-4)}
             </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-[#999] mb-4 pb-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3" />
              {timeAgo(deal.createdAt)}
            </div>
            <div className={cn("flex items-center gap-1.5", deal.expiresAt < Date.now() ? "text-red-400" : "text-amber-400")}>
              Expires in {expiresLabel(deal.expiresAt)}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            {displayStatus === "WaitingForPayment" && (
              <>
                <button onClick={handleShare} className="flex-1 py-3 rounded-xl accent-gradient text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]">
                  <Share2 className="size-3.5" /> Share
                </button>
                <Link href={`/deal/${deal.id}`} target="_blank" className="flex-1 py-3 rounded-xl glass text-white text-xs font-bold transition-all duration-200 text-center hover:border-white/20">
                  Details
                </Link>
              </>
            )}

            {displayStatus === "Locked" && (
              <>
                <button onClick={markShipped} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2">
                  <CheckCircle2 className="size-3.5" /> Shipped?
                </button>
                <Link href={`/deal/${deal.id}`} target="_blank" className="flex-1 py-3 rounded-xl glass text-white text-xs font-bold transition-all duration-200 text-center hover:border-white/20">
                  Details
                </Link>
              </>
            )}

            {displayStatus === "Shipped" && (
              <>
                <Link href={`/deal/${deal.id}`} target="_blank" className="flex-1 py-3 rounded-xl glass text-white text-xs font-bold transition-all duration-200 text-center hover:border-white/20">
                  View Details
                </Link>
                <span className="flex-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] flex items-center justify-center gap-1.5">
                  <Info className="size-3" /> Waiting
                </span>
              </>
            )}

            {displayStatus === "Completed" && (
              <>
                <button className="flex-1 py-3 accent-gradient text-white rounded-xl text-xs font-bold transition-all duration-200 text-center hover:scale-[1.02]">
                  Withdraw
                </button>
              </>
            )}

            {displayStatus === "Disputed" && (
              <>
                <Link href={`/dashboard/disputes/${deal.id}`} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2">
                  <ShieldAlert className="size-3.5" /> View Dispute
                </Link>
              </>
            )}
            
            {(displayStatus === "Expired" || displayStatus === "Cancelled" || displayStatus === "Refunded") && (
              <Link href={`/deal/${deal.id}`} target="_blank" className="flex-1 py-3 rounded-xl glass text-white text-xs font-bold transition-all duration-200 text-center hover:border-white/20">
                History
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
