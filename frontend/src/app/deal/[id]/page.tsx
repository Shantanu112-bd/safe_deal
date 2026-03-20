"use client";

import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Timer,
  ArrowLeft,
  Shield,
  Smartphone,
  Info,
  ExternalLink,
  ChevronRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GradientButton } from "@/components/ui/gradient-button";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);
  const router = useRouter();

  // Dispute Modal States
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("Item not received");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);

  // Fetch deal from Soroban contract (on-chain) or localStorage (fallback)
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
        if (result.txHash) setPaymentTxHash(result.txHash);
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
      // Build dispute transaction
      const result = await raiseDispute(
        params.id,
        publicKey,
        disputeReason,
        ''  // evidence hash empty initially
      );

      toast.success("Dispute raised — funds frozen pending review");
      setShowDisputeModal(false);

      // Redirect to dispute page inside the frontend app 
      // result might be a standard string or object from invokeContract based on how we wrote raiseDispute
      // usually a txHash or something, but the prompt says result.disputeId. Let's just use params.id for now since we mapped deal->dispute
      // The prompt actually expects `result.disputeId`
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <Shield className="size-6 text-slate-900 fill-current" />
            <span className="text-lg font-black tracking-tighter">SafeDeal</span>
          </div>
          <Badge variant="outline" className="rounded-full border-orange-200 bg-orange-50 text-orange-600 font-black text-[10px] uppercase px-2 py-0.5 animate-pulse">
            Testnet
          </Badge>
        </header>

        <main className="mx-auto max-w-lg px-4 sm:px-6 py-8 space-y-6">

          <div className="flex items-center gap-2 text-slate-400">
            <button className="p-2 hover:bg-white rounded-full transition-colors" onClick={() => window.history.back()}>
              <ArrowLeft className="size-4" />
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Secure Checkout — Deal #{params.id}</span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="py-24 flex flex-col items-center text-center space-y-4">
              <Loader2 className="size-10 text-slate-300 animate-spin" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading deal...</p>
            </div>
          )}

          {/* DEAL NOT FOUND */}
          {!loading && (notFound || !deal) && (
            <div className="py-24 flex flex-col items-center text-center space-y-4">
              <div className="size-20 rounded-[2rem] bg-slate-100 flex items-center justify-center">
                <Package className="size-10 text-slate-300" />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Deal Not Found</h2>
              <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                Deal #{params.id} does not exist or has expired. Please check the link you received from the seller.
              </p>
            </div>
          )}

          {/* DEAL FOUND — interactive flow */}
          {!loading && deal && (
            <AnimatePresence mode="wait">
              {step === "locking" ? (
                <motion.div
                  key="locking"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center text-center"
                >
                  <div className="size-24 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin" />
                  <h2 className="text-2xl font-black mt-8">Securing Escrow</h2>
                  <p className="text-slate-500 font-bold mt-2 text-sm">
                    Locking {deal.amountUSDC.toFixed(2)} USDC on Stellar...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* DEAL DETAILS */}
                  <Card className="rounded-[2.5rem] bg-white border-slate-200 shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                      <Badge className="mb-4 bg-slate-100 text-slate-700 border-none font-black text-[10px]">#{deal.id}</Badge>
                      <h2 className="text-2xl font-black text-slate-900">{deal.title}</h2>
                      <p className="text-slate-500 font-bold leading-relaxed mt-3 mb-6 text-sm">{deal.description}</p>
                      <Separator className="mb-6" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Amount (USDC)</p>
                          <span className="text-3xl font-black text-slate-900">{deal.amountUSDC.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Seller</p>
                          <span className="text-xs font-mono text-slate-600">
                            {deal.sellerKey.slice(0, 8)}...{deal.sellerKey.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PROTECTION PILLARS */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: ShieldCheck, title: "Secured", desc: "No payout until ship", color: "text-emerald-500" },
                      { icon: Timer, title: "Countdown", desc: "Auto-refund if late", color: "text-orange-500" },
                      { icon: Package, title: "Verified", desc: "Item as described", color: "text-blue-500" },
                    ].map((g, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
                        <div className={cn("size-8 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-2", g.color)}>
                          <g.icon className="size-4" />
                        </div>
                        <p className="text-[10px] font-black uppercase mb-1">{g.title}</p>
                        <p className="text-[8px] font-bold text-slate-400">{g.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* FRAUD CHECK */}
                  {isConnected && (
                    <Card className="rounded-[2.5rem] bg-slate-900 text-white p-6 border-none">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="size-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Fraud Check</span>
                        </div>
                        <div className={cn("text-[10px] font-black", isBlocked ? "text-red-400" : "text-slate-500")}>
                          {fraudLevel?.toUpperCase()}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2 text-xs font-bold">
                          <span>Wallet Risk Level</span>
                          <span className={isBlocked ? "text-red-400" : "text-emerald-400"}>{fraudScore}% (Low)</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fraudScore}%` }}
                            className={cn("h-full rounded-full", isBlocked ? "bg-red-500" : "bg-emerald-500")}
                          />
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* WALLET & ACTION */}
                  <div className="space-y-4 pt-4">
                    {!isConnected ? (
                      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 text-center">
                        <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                          <Smartphone className="size-8 text-slate-200" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Unlock Checkout</h4>
                        <p className="text-slate-500 font-bold mb-8 text-sm">
                          Connect your Stellar wallet to lock and secure funds in escrow.
                        </p>
                        <div className="flex justify-center">
                          <WalletConnect />
                        </div>
                      </div>
                    ) : step === "pay" ? (
                      <div className="space-y-4">
                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 text-amber-700">
                          <Info className="size-5 shrink-0" />
                          <p className="text-[10px] font-bold leading-relaxed">
                            Funds will be locked in the <span className="font-black">SafeDeal Smart Escrow</span>. Only release when you receive the item. Auto-refunds trigger after 48h if no confirmation.
                          </p>
                        </div>
                        <GradientButton
                          className="w-full rounded-full py-6 text-xl font-black"
                          onClick={handlePay}
                          disabled={isBlocked}
                        >
                          Pay {deal.amountUSDC.toFixed(2)} USDC & Lock
                        </GradientButton>
                        {isBlocked && (
                          <p className="text-center text-xs font-black text-red-500">Your wallet is currently blacklisted.</p>
                        )}
                      </div>
                    ) : null}

                    {step === "success" && (
                      <div className="bg-white rounded-[2.5rem] border-2 border-emerald-500 p-8 text-center animate-in fade-in zoom-in">
                        <div className="size-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                          <CheckCircle2 className="size-10" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-2">Payment Locked!</h4>
                        <p className="text-slate-500 font-bold mb-8 text-sm">
                          The seller has been notified to ship your items. 48h countdown active.
                        </p>
                        <div className="bg-slate-50 rounded-2xl p-4 text-left">
                          <div className="flex items-center justify-between text-[10px] font-black text-slate-400 mb-1">
                            <span>ESCROW VAULT</span>
                            <span className="text-emerald-500">ACTIVE</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-slate-900">Auto-Refund Timer</span>
                            <span className="text-sm font-mono text-slate-900">{formatTime(timeLeft)}</span>
                          </div>
                        </div>
                        <GradientButton
                          variant="variant"
                          className="w-full rounded-full py-5 text-lg font-black mt-8"
                          onClick={() => setStep("confirm_delivery")}
                        >
                          Confirm Receipt
                        </GradientButton>
                      </div>
                    )}
                  </div>

                  {/* CONFIRM DELIVERY */}
                  {(step === "confirm_delivery" || step === "released" || step === "dispute_opened") && (
                    <Card className="rounded-[2.5rem] border-2 border-slate-900 bg-white shadow-2xl overflow-hidden">
                      <CardHeader className="bg-slate-900 text-white p-8">
                        <CardTitle className="text-2xl font-black">Release Payout?</CardTitle>
                        <CardDescription className="text-slate-400 font-bold">Confirm item condition to finalize the deal.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 space-y-8">
                        {step === "confirm_delivery" ? (
                          <>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                              <Package className="size-10 text-slate-300" />
                              <div>
                                <p className="text-sm font-black text-slate-900">{deal.title}</p>
                                <p className="text-xs font-bold text-slate-500">Ref: #{deal.id}</p>
                              </div>
                            </div>
                            <div className="grid gap-3">
                              <GradientButton className="w-full rounded-full py-5 text-lg font-black" onClick={handleConfirmDelivery}>
                                Yes, Release Funds Now
                              </GradientButton>
                              <button
                                className="w-full py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                onClick={() => setShowDisputeModal(true)}
                              >
                                Problem? Open Dispute
                              </button>
                            </div>
                          </>
                        ) : step === "released" ? (
                          <div className="text-center py-4">
                            <CheckCircle2 className="size-16 text-emerald-500 mx-auto mb-6" />
                            <h4 className="text-2xl font-black text-slate-900 mb-2">Deal Closed</h4>
                            <p className="text-slate-500 font-bold text-sm">Funds have been released to the seller. Thank you for using SafeDeal!</p>
                            <button
                              className="mt-8 text-xs font-black uppercase tracking-widest text-[#0b50da] flex items-center gap-2 mx-auto"
                              onClick={() => {
                                if (payoutTxHash) {
                                  window.open(`https://stellar.expert/explorer/testnet/tx/${payoutTxHash}`, "_blank");
                                } else {
                                  toast.error("Transaction hash not available");
                                }
                              }}
                            >
                              View on Stellar Expert <ExternalLink className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <AlertTriangle className="size-16 text-red-500 mx-auto mb-6" />
                            <h4 className="text-2xl font-black text-slate-900 mb-2">Dispute Active</h4>
                            <p className="text-slate-500 font-bold text-sm">The funds are frozen. Our compliance team will reach out to both parties shortly.</p>
                            <button className="mt-8 text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 mx-auto">
                              Case #SD-{deal.id}-DIS <ChevronRight className="size-3" />
                            </button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>

        {/* FOOTER NAV */}
        <footer className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 p-4 lg:hidden">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase text-slate-500">Secured Checkout</span>
            </div>
            <div className="text-[10px] font-black uppercase text-slate-400">Powered by Stellar</div>
          </div>
        </footer>
      </div>

      {/* DISPUTE MODAL */}
      <AnimatePresence>
        {showDisputeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShowDisputeModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                  <AlertTriangle className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Open Dispute</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Funds will be frozen</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Problem Type</label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                  >
                    <option>Item not received</option>
                    <option>Wrong item</option>
                    <option>Damaged item</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Describe the problem</label>
                  <textarea
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    placeholder="Provide details for the arbiter..."
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all resize-none min-h-[120px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <GradientButton
                    onClick={handleOpenDispute}
                    disabled={disputeLoading}
                    className="w-full rounded-2xl py-4 font-black"
                  >
                    {disputeLoading ? "Raising Dispute..." : "Submit Dispute"}
                  </GradientButton>
                  <button
                    onClick={() => setShowDisputeModal(false)}
                    className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
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
