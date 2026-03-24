"use client";

import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Timer,
  ArrowLeft,
  Shield,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Loader2,
  Lock,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWallet } from "@/context/WalletContext";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  lockPayment,
  confirmDelivery as confirmOnChain,
  getDeal as fetchDealFromStore,
  raiseDispute,
  type DealData
} from "@/lib/stellar";
import ErrorBoundary from "@/components/ErrorBoundary";

// Mock toggle component for the gasless transaction step later
function GaslessToggle({ onToggle }: { onToggle?: (v: boolean) => void }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <div 
      className="flex items-center gap-3 p-4 rounded-xl mb-6 cursor-pointer border transition-colors"
      style={{
        background: enabled ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.05)",
        borderColor: enabled ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)"
      }}
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        onToggle?.(next);
      }}
    >
      <Zap className={cn("w-5 h-5", enabled ? "text-indigo-400" : "text-slate-400")}/>
      <div className="flex-1">
        <p className="text-[#f8fafc] text-sm font-medium">
          Gasless Transaction
        </p>
        <p className="text-[#94a3b8] text-xs">
          SafeDeal covers your network fee
        </p>
      </div>
      <div className={cn(
        "text-xs px-3 py-1 rounded-full font-bold",
        enabled ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-400"
      )}>
        FREE
      </div>
    </div>
  )
}

type PageStep = "pay" | "locking" | "success" | "confirm_delivery" | "released" | "dispute_opened";

export default function BuyerPaymentPage({ params }: { params: { id: string } }) {
  const { isConnected, walletType, fraudScore, fraudLevel, publicKey } = useWallet();

  const isBlocked = fraudLevel === "Blocked";

  const [step, setStep] = useState<PageStep>("pay");
  const [deal, setDeal] = useState<DealData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(172800); // 48 hours
  const [payoutTxHash, setPayoutTxHash] = useState<string | null>(null);
  const router = useRouter();

  // Dispute Modal States
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("Item not received");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const dealData = await fetchDealFromStore(params.id);
        if (!dealData) {
          setNotFound(true);
        } else {
          setDeal(dealData);
          const secondsLeft = Math.max(0, Math.floor((dealData.expiresAt - Date.now()) / 1000));
          setTimeLeft(secondsLeft);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [params.id]);

  useEffect(() => {
    if (timeLeft > 0 && step === "success") {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handlePay = async () => {
    if (!deal) return;
    setStep("locking");
    try {
      const result = await lockPayment(params.id, deal.amountUSDC, walletType, publicKey || undefined);
      if (result.success) {
        setStep("success");
        toast.success("Payment locked in escrow!");
      }
    } catch (err) {
      setStep("pay");
      const msg = err instanceof Error ? err.message : "Stellar transaction failed. Check your wallet.";
      toast.error(msg);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      const result = await confirmOnChain(params.id, walletType, publicKey || undefined);
      if (result.success) {
        if (result.txHash) setPayoutTxHash(result.txHash);
        setStep("released");
        toast.success("Funds released to seller. Thank you!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to release funds on-chain.";
      toast.error(msg);
    }
  };

  const handleOpenDispute = async () => {
    if (!publicKey || !deal) return;
    setDisputeLoading(true);

    try {
      const result = await raiseDispute(
        params.id,
        publicKey,
        disputeReason,
        ''
      );

      toast.success("Dispute raised — funds frozen pending review");
      setShowDisputeModal(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dId = result && (result as any).disputeId ? (result as any).disputeId : `DISP-${params.id}`;
      router.push(`/dashboard/disputes/${dId}`);
    } catch (error) {
      toast.error("Failed to raise dispute");
      console.error(error);
    } finally {
      setDisputeLoading(false);
    }
  };

  // Convert fraud level to UI style
  let trustStyle = {};
  if (isBlocked) {
    trustStyle = { border: "2px solid #ef4444", background: "rgba(239,68,68,0.05)" };
  } else if (fraudScore < 20) {
    trustStyle = {
      border: "2px solid transparent",
      background: "linear-gradient(#0f0f1a, #0f0f1a) padding-box, linear-gradient(135deg, #10b981, #06b6d4) border-box"
    };
  } else {
    trustStyle = { border: "2px solid rgba(148,163,184,0.3)" };
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#030712] text-[#f8fafc] font-sans pb-20 selection:bg-[#10b981]/30">

        <header className="sticky top-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <Shield className="size-6 text-[#10b981] fill-current" />
            <span className="text-lg font-black tracking-tighter">SafeDeal Checkout</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 text-[#94a3b8] text-xs font-bold border border-white/10">
            TESTNET
          </div>
        </header>

        <main className="max-w-md mx-auto p-4 pt-8 shrink-0">
          <button className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors mb-6 text-sm font-bold" onClick={() => window.history.back()}>
            <ArrowLeft className="size-4" /> Back
          </button>

          {loading ? (
            <div className="py-24 flex flex-col items-center text-center space-y-4">
              <Loader2 className="size-10 text-slate-500 animate-spin" />
              <p className="text-sm font-bold text-[#94a3b8]">Loading escrow vault...</p>
            </div>
          ) : notFound || !deal ? (
            <div className="py-24 flex flex-col items-center text-center space-y-4">
              <div className="size-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Package className="size-10 text-slate-500" />
              </div>
              <h2 className="text-xl font-black text-white">Deal Not Found</h2>
              <p className="text-sm font-bold text-[#94a3b8]">This payment link may have expired or is invalid.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === "locking" ? (
                <motion.div
                  key="locking"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center text-center"
                >
                  <div className="size-24 rounded-full border-4 border-white/10 border-t-[#10b981] animate-spin" />
                  <h2 className="text-2xl font-black mt-8 text-white">Securing Funds</h2>
                  <p className="text-[#94a3b8] font-bold mt-2 text-sm">
                    Locking {deal.amountUSDC.toFixed(2)} USDC in smart contract...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* SELLER TRUST CARD */}
                  <div style={trustStyle} className="rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <ShieldCheck className={cn("w-6 h-6", isBlocked ? "text-red-500" : "text-[#10b981]")} />
                    </div>
                    <div>
                      <p className="text-[#f8fafc] font-black text-lg">
                        {deal.sellerKey.slice(0, 6)}...{deal.sellerKey.slice(-4)}
                      </p>
                      <p className={cn("text-xs font-bold uppercase tracking-widest", isBlocked ? "text-red-400" : "text-[#10b981]")}>
                        {isBlocked ? "High Risk Seller" : "Verified Merchant"}
                      </p>
                    </div>
                  </div>

                  {/* WHITE CARD CONTAINER */}
                  <div className="bg-white rounded-[2rem] p-6 text-slate-900 shadow-xl overflow-hidden relative">
                    {/* Background decor */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="text-center mb-8">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">You are paying</p>
                      <div className="py-2">
                        <p style={{
                          background: "linear-gradient(135deg, #10b981, #06b6d4)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: "3rem",
                          fontWeight: 800,
                          lineHeight: 1.1
                        }}>
                          {deal.amountUSDC.toFixed(2)} <span className="text-2xl">USDC</span>
                        </p>
                        <p className="text-[#94a3b8] text-[1.1rem] mt-2 font-medium">
                          ≈ ₹{(deal.amountUSDC * 83.5).toFixed(0)} at today's rate
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-8 text-center">
                      <p className="font-bold text-slate-800 text-lg">{deal.title}</p>
                      <p className="text-slate-500 text-sm">{deal.description}</p>
                    </div>

                    {/* PROTECTION BADGES */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                      {["Funds Locked", "Auto-Refund in 48h", "Verified Escrow"].map((b, i) => (
                        <div key={i} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }} className="rounded-full px-4 py-2 text-[#10b981] text-[13px] font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> {b}
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      {!isConnected ? (
                        <div className="text-center">
                          <p className="text-slate-500 font-bold mb-4 text-sm">
                            Connect your wallet to lock funds.
                          </p>
                          <div className="flex justify-center">
                            <WalletConnect />
                          </div>
                        </div>
                      ) : step === "pay" ? (
                        <>
                          <div className="-mx-6 px-6 relative z-10">
                            <GaslessToggle />
                            
                            <button
                              disabled={isBlocked}
                              onClick={handlePay}
                              className="w-full text-white rounded-2xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                              style={{
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                boxShadow: "0 0 40px rgba(16,185,129,0.3)",
                                height: "60px",
                                fontSize: "18px",
                                fontWeight: 700
                              }}
                            >
                              <Lock className="w-5 h-5" /> Pay Securely
                            </button>
                            {isBlocked && (
                              <p className="text-center text-xs font-black text-red-500 mt-4">Transaction blocked for safety.</p>
                            )}
                          </div>
                        </>
                      ) : null}
                      
                      {/* Success / Release Step */}
                      {(step === "success" || step === "confirm_delivery" || step === "released" || step === "dispute_opened") && (
                        <div className="text-center">
                           {step === "success" || step === "confirm_delivery" ? (
                             <>
                              <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Lock className="size-8" />
                              </div>
                              <h4 className="text-xl font-black text-slate-900 mb-2">Funds Secured</h4>
                              <p className="text-slate-500 text-sm mb-6">Your money is safe in escrow. The seller has been notified to ship.</p>
                              <button 
                                onClick={handleConfirmDelivery}
                                className="w-full bg-[#10b981] text-white rounded-xl py-4 font-bold text-lg mb-3 hover:bg-[#059669] transition-colors"
                              >
                                I Received My Item
                              </button>
                              <button 
                                onClick={() => setShowDisputeModal(true)}
                                className="text-xs text-red-500 font-bold uppercase tracking-widest hover:underline"
                              >
                                Problem? Open Dispute
                              </button>
                             </>
                           ) : step === "released" ? (
                             <>
                              <CheckCircle2 className="size-16 text-[#10b981] mx-auto mb-4" />
                              <h4 className="text-2xl font-black text-slate-900 mb-2">Deal Closed</h4>
                              <p className="text-slate-500 font-bold text-sm">Payment released to seller.</p>
                             </>
                           ) : (
                             <>
                              <AlertTriangle className="size-16 text-red-500 mx-auto mb-4" />
                              <h4 className="text-2xl font-black text-slate-900 mb-2">Dispute Active</h4>
                              <p className="text-slate-500 font-bold text-sm">Funds are frozen pending review.</p>
                             </>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* DISPUTE MODAL */}
      <AnimatePresence>
        {showDisputeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712]/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#0f0f1a] rounded-[2rem] p-8 shadow-2xl relative border border-white/5"
            >
              <button
                onClick={() => setShowDisputeModal(false)}
                className="absolute top-6 right-6 p-2 text-[#94a3b8] hover:text-white rounded-full transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <AlertTriangle className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Open Dispute</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Funds will be frozen</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Problem Type</label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
                  >
                    <option>Item not received</option>
                    <option>Wrong item</option>
                    <option>Damaged item</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Describe the problem</label>
                  <textarea
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    placeholder="Provide details..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all resize-none min-h-[120px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleOpenDispute}
                    disabled={disputeLoading}
                    className="w-full rounded-xl py-4 font-black bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    {disputeLoading ? "Raising Dispute..." : "Submit Dispute"}
                  </button>
                  <button
                    onClick={() => setShowDisputeModal(false)}
                    className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[#94a3b8] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
