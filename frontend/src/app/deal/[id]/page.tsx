"use client";

import { useState } from "react";
import { 
  Shield, 
  Lock, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  Clock, 
  MessageSquare, 
  Wallet, 
  ChevronRight,
  Copy,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Undo2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";
import { useWallet } from "@/context/WalletContext";
import { WalletConnect } from "@/components/wallet/WalletConnect";

// Types
type PageStep = "pay" | "locking" | "success" | "confirm_delivery" | "dispute_opened" | "released";
type SellerStatus = "verified" | "new" | "flagged";

// Mock Data
const SELLER_DATA = {
  name: "Priya's Jewelry",
  status: "verified" as SellerStatus,
  rating: 4.9,
  completedDeals: 247,
  memberSince: "Jan 2023",
  lastDispute: "Never"
};

const DEAL_DATA = {
  title: "Handmade Silver Earrings",
  description: "Handcrafted 925 silver earrings. Size 2cm.",
  amountUSDC: 24.00,
  amountINR: 1997,
  image: "https://images.unsplash.com/photo-1635767794421-4d5671c69991?q=80&w=2000&auto=format&fit=crop"
};

export default function DealPage({ params }: { params: { id: string } }) {
  const dealId = params.id;
  const { connected, address, balance, inrEquivalent, isBlocked, riskScore, hasUsdcTrustline } = useWallet();
  const [step, setStep] = useState<PageStep>("pay");
  const [copied, setCopied] = useState(false);

  const handlePay = () => {
    setStep("locking");
    setTimeout(() => {
      setStep("success");
    }, 2500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`safedeal.app/deal/${dealId}/confirm`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Border color based on seller status
  const getBorderColor = (status: SellerStatus) => {
    switch (status) {
      case "verified": return "border-emerald-500 shadow-xl shadow-emerald-500/10";
      case "new": return "border-orange-400 shadow-xl shadow-orange-500/10";
      case "flagged": return "border-red-500 shadow-xl shadow-red-500/10";
      default: return "border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100 italic-none">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20 text-white">
              <Shield className="size-5 fill-emerald-100/20" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900">SafeDeal</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Secure Payment</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
            <ShieldCheck className="size-3.5" />
            ESCROW ACTIVE
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 pb-24 pt-8">
        <AnimatePresence mode="wait">
          {step === "locking" ? (
            <motion.div 
              key="locking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative">
                <div className="size-24 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="size-8 text-emerald-600" />
                </div>
              </div>
              <h2 className="mt-8 text-2xl font-bold text-slate-900">Locking Payment...</h2>
              <p className="mt-2 text-slate-500">Securing 24.00 USDC on Stellar Network</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* SELLER TRUST CARD */}
              <div className={cn(
                "group relative overflow-hidden rounded-3xl border-2 bg-white p-6 transition-all duration-300",
                getBorderColor(SELLER_DATA.status)
              )}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seller Identity</p>
                    <h2 className="text-xl font-bold text-slate-900">{SELLER_DATA.name}</h2>
                  </div>
                  {SELLER_DATA.status === "verified" && (
                    <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-100">
                      <CheckCircle2 className="size-3" /> VERIFIED
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-emerald-50/50">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm ring-1 ring-slate-100">
                      <Star className="size-4 fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Rating</p>
                      <p className="text-sm font-bold text-slate-900">{SELLER_DATA.rating}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-emerald-50/50">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-blue-500 shadow-sm ring-1 ring-slate-100">
                      <Package className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Deals</p>
                      <p className="text-sm font-bold text-slate-900">{SELLER_DATA.completedDeals}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-emerald-50/50">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-indigo-500 shadow-sm ring-1 ring-slate-100">
                      <Clock className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Member</p>
                      <p className="text-sm font-bold text-slate-900">{SELLER_DATA.memberSince}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-emerald-50/50">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm ring-1 ring-slate-100">
                      <MessageSquare className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Dispute</p>
                      <p className="text-sm font-bold text-slate-900">{SELLER_DATA.lastDispute}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEAL DETAILS CARD */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden relative">
                   <img 
                    src={DEAL_DATA.image} 
                    alt={DEAL_DATA.title}
                    className="w-full h-full object-cover"
                   />
                   <div className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-slate-900 shadow-sm">
                     REF: #{dealId}
                   </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{DEAL_DATA.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 leading-relaxed italic-none">{DEAL_DATA.description}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-6 py-5 ring-1 ring-slate-100">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total amount</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 italic-none">{DEAL_DATA.amountUSDC.toFixed(2)} USDC</span>
                        <span className="text-xs font-bold text-emerald-600">≈ ₹{DEAL_DATA.amountINR}</span>
                      </div>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                      <Smartphone className="size-6 text-slate-300" />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 px-4 py-3 text-xs font-semibold text-emerald-800 italic-none">
                    <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                    Protected by SafeDeal Escrow until you confirm delivery.
                  </div>
                </div>
              </div>

              {/* PROTECTION INFO */}
              <div className="grid grid-cols-1 gap-3">
                <h4 className="px-1 text-xs font-black uppercase tracking-widest text-slate-400">Buyer Protection</h4>
                {[
                  { icon: Lock, color: "text-blue-500", bg: "bg-blue-50", title: "Smart Escrow", desc: "Money locked until you confirm delivery" },
                  { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", title: "AI Verification", desc: "Seller verified by AI fraud detection" },
                  { icon: Undo2, color: "text-orange-500", bg: "bg-orange-50", title: "Auto-Refund", desc: "Refund if seller fails to ship order" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:scale-[1.02]">
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", item.bg, item.color)}>
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 italic-none">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAYMENT SECTION */}
              <div className="mt-10 rounded-3xl bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20">
                {step === "pay" && !connected && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Step 1 of 2</p>
                      <h3 className="text-2xl font-bold">Connect Wallet</h3>
                      <p className="text-sm text-slate-400">Select your preferred Stellar wallet to start.</p>
                    </div>

                    <WalletConnect />
                  </div>
                )}

                {connected && step === "pay" && (
                  <div className="space-y-8">
                    {isBlocked ? (
                       <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex gap-3 text-red-200">
                        <ShieldAlert className="size-5 shrink-0" />
                        <div className="text-xs leading-relaxed italic-none">
                          <span className="font-bold block text-sm text-red-400 mb-1 italic-none">Access Restricted</span>
                          Your wallet has been flagged for suspicious activity.
                        </div>
                      </div>
                    ) : (
                      <>
                        {riskScore !== null && riskScore > 60 && (
                          <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-4 flex gap-3 text-orange-200">
                            <AlertTriangle className="size-5 shrink-0" />
                            <div className="text-xs leading-relaxed italic-none">
                              <span className="font-bold block text-sm text-orange-400 mb-1 italic-none">Caution: Risk Detected</span>
                              Your wallet has a risk score of {riskScore}. Please verify the deal details carefully.
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Step 2 of 2</p>
                          <h3 className="text-2xl font-bold">Confirm Payment</h3>
                          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-white/5 rounded-full ring-1 ring-white/10 text-[10px] font-bold text-emerald-400 uppercase tracking-wider italic-none">
                            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Connected: {address?.slice(0, 8)}...
                          </div>
                        </div>

                        <div className="space-y-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 italic-none">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Your USDC Balance</span>
                            <span className="font-bold text-white italic-none">{balance} USDC</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Payment Amount</span>
                            <span className="font-bold text-emerald-400 italic-none">-{DEAL_DATA.amountUSDC.toFixed(2)} USDC</span>
                          </div>
                          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-sm font-bold">Remaining After</span>
                            <span className="text-lg font-black text-white italic-none">{(parseFloat(balance) - DEAL_DATA.amountUSDC).toFixed(2)} USDC</span>
                          </div>
                        </div>

                        <GradientButton 
                          className="w-full rounded-2xl py-6 text-lg font-black italic-none"
                          onClick={handlePay}
                          disabled={!hasUsdcTrustline || isBlocked}
                        >
                          {!hasUsdcTrustline ? "Add USDC Trustline First" : "Pay & Lock in Escrow"}
                        </GradientButton>
                      </>
                    )}
                  </div>
                )}

                {step === "success" && (
                   <div className="space-y-8 py-4">
                     <div className="text-center space-y-4">
                        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-600 shadow-2xl shadow-emerald-600/40 text-white">
                          <CheckCircle2 className="size-10" />
                        </div>
                        <h3 className="text-2xl font-bold italic-none">Payment Locked Successfully!</h3>
                        <p className="text-slate-400 text-sm italic-none">Your {DEAL_DATA.amountUSDC.toFixed(2)} USDC is secured in escrow. The seller cannot access it until you confirm delivery.</p>
                     </div>

                     <div className="rounded-3xl bg-white/5 p-6 space-y-4 ring-1 ring-white/10">
                        <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                          <span>Deal Reference</span>
                          <span className="text-white">#{dealId}</span>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Confirmation Link</p>
                           <div className="flex gap-2">
                             <div className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-xs font-mono text-emerald-400 truncate ring-1 ring-white/5">
                                safedeal.app/deal/{dealId}/confirm
                             </div>
                             <button 
                              onClick={copyLink}
                              className="size-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                             >
                               {copied ? <CheckCircle2 className="size-5 text-emerald-500" /> : <Copy className="size-5" />}
                             </button>
                           </div>
                        </div>
                     </div>

                     <GradientButton 
                      variant="variant"
                      className="w-full rounded-2xl py-5 font-bold italic-none"
                      onClick={() => setStep("confirm_delivery")}
                    >
                      Return to Deal
                    </GradientButton>
                   </div>
                )}
              </div>

               {/* CONFIRM DELIVERY SECTION */}
               {(step === "confirm_delivery" || step === "released" || step === "dispute_opened") && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border-2 border-emerald-500/20 bg-white p-8 shadow-xl shadow-emerald-500/5 space-y-8"
                >
                  {step === "confirm_delivery" ? (
                    <>
                      <div className="text-center space-y-3">
                        <h3 className="text-2xl font-bold text-slate-900 italic-none">Did you receive your item?</h3>
                        <p className="text-slate-500 text-sm">Once you confirm receipt, the funds will be released to {SELLER_DATA.name}.</p>
                      </div>

                      <div className="aspect-square w-48 mx-auto rounded-3xl bg-slate-100 overflow-hidden ring-4 ring-slate-50">
                        <img 
                          src={DEAL_DATA.image} 
                          alt={DEAL_DATA.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="grid gap-3">
                        <GradientButton 
                          className="w-full rounded-2xl py-5 text-lg font-bold italic-none"
                          onClick={() => setStep("released")}
                        >
                          Yes, I received it — Release Payment
                        </GradientButton>
                        <button 
                          onClick={() => setStep("dispute_opened")}
                          className="w-full rounded-2xl py-4 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 flex items-center justify-center gap-2"
                        >
                          <AlertTriangle className="size-4" />
                          No, I have a problem — Open Dispute
                        </button>
                      </div>
                    </>
                  ) : step === "released" ? (
                    <div className="text-center space-y-6 py-6 transition-all italic-none">
                       <div className="mx-auto size-24 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50 italic-none">
                          <CheckCircle2 className="size-12 italic-none" />
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-slate-900 italic-none">Money Released!</h3>
                          <p className="text-slate-500 italic-none">The seller has been paid. Thank you for using SafeDeal.</p>
                       </div>
                       <button 
                        onClick={() => setStep("pay")}
                        className="text-emerald-600 font-bold text-sm underline px-4 py-2 hover:bg-emerald-50 rounded-xl transition-colors"
                       >
                         Back to Start (Demo)
                       </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6 py-6">
                       <div className="mx-auto size-24 flex items-center justify-center rounded-full bg-red-100 text-red-600 ring-8 ring-red-50">
                          <AlertTriangle className="size-12" />
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-slate-900">Dispute Opened</h3>
                          <p className="text-slate-500">Our team will review your case and respond within 24 hours. Your funds remain locked and safe.</p>
                       </div>
                       <button 
                        onClick={() => setStep("confirm_delivery")}
                        className="text-slate-400 font-bold text-sm px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors"
                       >
                         Go Back
                       </button>
                    </div>
                  )}
                </motion.div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Mobile-first sticky tip */}
      {step === "pay" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:hidden">
          <div className="mx-auto max-w-lg rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-2xl text-center italic-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Mobile Payment</p>
          </div>
        </div>
      )}
    </div>
  );
}
