"use client";

import { useMemo, useState } from "react";
import { 
  X, 
  ChevronRight, 
  Copy, 
  Check, 
  QrCode, 
  MessageCircle, 
  Instagram, 
  Send as Telegram,
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  ShoppingBag,
  Plus
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createEscrowTransaction } from "@/lib/stellar";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";
import { monitor } from "@/lib/monitoring";

type Props = {
  open: boolean;
  onClose: () => void;
  onDealCreated?: () => void;
};

type Step = 1 | 2 | 3;

const INR_PER_USDC = 83.5;

export function CreateDealModal({ open, onClose, onDealCreated }: Props) {
  const { publicKey, walletType } = useWallet();
  const [step, setStep] = useState<Step>(1);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [amountUsdc, setAmountUsdc] = useState<string>("0.00");
  const [category, setCategory] = useState("Jewelry");
  const [expiryPreset, setExpiryPreset] = useState("3d");
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [finalDealId, setFinalDealId] = useState<string | null>(null);

  const parsedAmount = useMemo(
    () => (amountUsdc ? Number.parseFloat(amountUsdc) || 0 : 0),
    [amountUsdc]
  );

  const inrAmount = useMemo(
    () => Math.round(parsedAmount * INR_PER_USDC),
    [parsedAmount]
  );

  const safedealFee = parsedAmount * 0.01;
  const sellerCut = parsedAmount - safedealFee;

  const expiryHours = useMemo(() => {
    switch (expiryPreset) {
      case "24h": return 24;
      case "3d": return 72;
      case "7d": return 168;
      case "14d": return 336;
      default: return 72;
    }
  }, [expiryPreset]);

  const expiryDate = useMemo(() => {
    return new Date(Date.now() + expiryHours * 60 * 60 * 1000);
  }, [expiryHours]);

  const expiryLabel = useMemo(
    () =>
      expiryDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [expiryDate]
  );

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      if (window.location.hostname === "localhost") {
        return "https://safe-deal-ten.vercel.app";
      }
      return window.location.origin;
    }
    return "https://safe-deal-ten.vercel.app";
  };

  const dealId = finalDealId ?? "pending";
  const dealUrl = finalDealId
    ? `${getBaseUrl()}/deal/${finalDealId}`
    : `${getBaseUrl()}/deal/pending`;

  const handleNext = () => {
    if (!itemName.trim()) {
      toast.error("Please enter an item name.");
      return;
    }
    if (parsedAmount <= 0) {
      toast.error("Please enter a valid USDC amount.");
      return;
    }
    setStep(2);
  };
  const handleBack = () => setStep(1);

  const handleConfirmCreate = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createEscrowTransaction(
        publicKey,
        parsedAmount,
        expiryHours,
        walletType,
        { itemName: itemName.trim(), description: description.trim(), category }
      );

      if (result.success) {
        setFinalDealId(result.dealId);
        setStep(3);
        onDealCreated?.();
        toast.success(`Deal #${result.dealId} created successfully!`);
        monitor.dealCreated(result.dealId, parsedAmount, category);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create deal.";
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const shareText = `Hi! I've created a SafeDeal payment link for your order. Your payment will be secured in escrow until you confirm delivery. Pay here: ${dealUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dealUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareOnTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(dealUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareOnInstagram = () => {
    navigator.clipboard.writeText(shareText);
    toast.success("Message copied! Ready to paste in Instagram.", {
      description: "Opening Instagram in a moment...",
    });
    setTimeout(() => {
      window.open("https://www.instagram.com/direct/inbox/", "_blank");
    }, 1500);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full sm:max-w-lg max-sm:fixed max-sm:bottom-0 max-sm:inset-x-0 max-sm:top-auto max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:translate-y-0 bg-[#111] border border-white/[0.08] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.08] px-8 py-6 bg-[#111]/80 backdrop-blur-md">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <div className={cn("size-1.5 rounded-full transition-colors", step >= 1 ? "bg-[#06B6D4]" : "bg-white/[0.1]")} />
                <div className={cn("size-1.5 rounded-full transition-colors", step >= 2 ? "bg-[#06B6D4]" : "bg-white/[0.1]")} />
                <div className={cn("size-1.5 rounded-full transition-colors", step === 3 ? "bg-[#06B6D4]" : "bg-white/[0.1]")} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] ml-2">Step {step} of 3</span>
             </div>
             <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {step === 1 && "Deal Details"}
                {step === 2 && "Final Review"}
                {step === 3 && "Deal is Live!"}
             </h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-[#999] hover:bg-white/[0.05] transition-colors flex items-center justify-center">
            <X className="size-6" />
          </button>
        </div>

        <div className="p-8">
           <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                    <div className="space-y-4">
                      <div className="grid gap-2">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] ml-1">Item Name</label>
                         <div className="relative">
                            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#999]" />
                            <input 
                              type="text" 
                              value={itemName}
                              onChange={(e) => setItemName(e.target.value)}
                              placeholder="e.g. Handmade Silver Earrings"
                              className="w-full rounded-xl border border-white/[0.08] bg-[#050505] pl-11 pr-4 py-3.5 text-sm font-bold text-white placeholder:text-[#444] focus:border-[#06B6D4] focus:outline-none transition-all"
                            />
                         </div>
                      </div>

                      <div className="grid gap-2">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] ml-1">Description</label>
                         <textarea 
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           rows={3}
                           placeholder="Describe the item condition, size, etc."
                           className="w-full rounded-xl border border-white/[0.08] bg-[#050505] px-4 py-3.5 text-sm font-bold text-white placeholder:text-[#444] focus:border-[#06B6D4] focus:outline-none transition-all resize-none"
                         />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                         <div className="grid gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] ml-1">Amount (USDC)</label>
                            <div className="relative">
                               <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#999]" />
                               <input 
                                 type="number"
                                 value={amountUsdc}
                                 onChange={(e) => setAmountUsdc(e.target.value)}
                                 className="w-full rounded-xl border border-white/[0.08] bg-[#050505] pl-11 pr-4 py-3.5 text-sm font-black text-white focus:border-[#06B6D4] focus:outline-none transition-all"
                               />
                            </div>
                            <p className="text-[10px] font-bold text-emerald-400 ml-1 uppercase tracking-[0.2em]">≈ ₹{inrAmount.toLocaleString()}</p>
                         </div>
                         <div className="grid gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] ml-1">Category</label>
                            <div className="relative">
                               <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#999]" />
                               <select 
                                 value={category}
                                 onChange={(e) => setCategory(e.target.value)}
                                 className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#050505] pl-11 pr-4 py-3.5 text-sm font-bold text-white focus:border-[#06B6D4] focus:outline-none transition-all"
                               >
                                  {["Jewelry", "Clothing", "Electronics", "Art", "Services", "Food", "Other"].map(opt => (
                                    <option key={opt}>{opt}</option>
                                  ))}
                               </select>
                            </div>
                         </div>
                      </div>

                      <div className="grid gap-2">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] ml-1">Deal Expiry</label>
                         <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#999]" />
                            <select 
                              value={expiryPreset}
                              onChange={(e) => setExpiryPreset(e.target.value)}
                              className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#050505] pl-11 pr-4 py-3.5 text-sm font-bold text-white focus:border-[#06B6D4] focus:outline-none transition-all"
                            >
                               <option value="24h">24 hours</option>
                               <option value="3d">3 days</option>
                               <option value="7d">7 days</option>
                               <option value="14d">14 days</option>
                            </select>
                         </div>
                      </div>

                       <div className="grid gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] ml-1">Item Photo (Optional)</label>
                          <div className="flex items-center justify-center w-full">
                             <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/[0.08] border-dashed rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                   <div className="size-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                      <Plus className="size-5 text-[#999]" />
                                   </div>
                                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Upload JPG, PNG</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" />
                             </label>
                          </div>
                       </div>
                    </div>

                   <GradientButton className="w-full rounded-xl py-4 font-black uppercase tracking-widest text-xs" onClick={handleNext}>
                      Continue to Review
                      <ChevronRight className="ml-2 size-4" />
                   </GradientButton>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-6">
                      <div className="flex items-start justify-between">
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Merchant Payout</p>
                            <h3 className="text-2xl font-black text-white">{sellerCut.toFixed(2)} USDC</h3>
                         </div>
                         <div className="text-right space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Buyer Total</p>
                            <p className="text-lg font-bold text-[#999]">{parsedAmount.toFixed(2)} USDC</p>
                         </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-white/[0.08]">
                         <div className="flex justify-between text-xs font-bold">
                            <span className="text-[#999]">Item:</span>
                            <span className="text-white">{itemName}</span>
                         </div>
                         <div className="flex justify-between text-xs font-bold">
                            <span className="text-[#999]">SafeDeal Fee (1%):</span>
                            <span className="text-emerald-400">-{safedealFee.toFixed(2)} USDC</span>
                         </div>
                         <div className="flex justify-between text-xs font-bold">
                            <span className="text-[#999]">Expiry:</span>
                            <span className="text-white">{expiryLabel}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={handleBack}
                        className="flex-1 rounded-xl border border-white/[0.08] py-4 text-xs font-black uppercase tracking-widest text-[#999] hover:bg-white/[0.05] transition-colors"
                      >
                         <ArrowLeft className="inline-block mr-2 size-3.5" />
                         Back
                      </button>
                      <GradientButton 
                        className="flex-[2] rounded-xl py-4 font-black uppercase tracking-widest text-xs" 
                        onClick={handleConfirmCreate}
                        disabled={isCreating}
                      >
                         {isCreating ? (
                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                         ) : null}
                         Confirm & Create Deal
                      </GradientButton>
                   </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                   <div className="flex flex-col items-center text-center">
                      <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 ring-8 ring-emerald-500/5">
                         <Check className="size-8" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4] mb-1">Success!</p>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Deal ID: {dealId}</h3>
                   </div>

                   <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-2xl bg-[#050505] text-white border border-white/[0.08] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                         <QrCode className="size-32" />
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl shrink-0 shadow-xl">
                        <QRCode value={dealUrl} size={150} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-4 w-full">
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Shareable Link</p>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                               <span className="flex-1 truncate font-mono text-xs font-bold text-[#06B6D4]">{dealUrl}</span>
                               <button 
                                 onClick={handleCopyLink}
                                 className="size-10 flex items-center justify-center rounded-lg accent-gradient text-white shadow-lg"
                               >
                                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button 
                        onClick={shareOnWhatsApp}
                        className="flex items-center sm:flex-col justify-center gap-2.5 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/15 transition-all group min-h-[44px]"
                      >
                         <MessageCircle className="size-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                      </button>
                      <button 
                        onClick={shareOnInstagram}
                        className="flex items-center sm:flex-col justify-center gap-2.5 p-4 rounded-2xl bg-[#E1306C]/10 border border-[#E1306C]/20 text-[#E1306C] hover:bg-[#E1306C]/15 transition-all group min-h-[44px]"
                      >
                         <Instagram className="size-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                      </button>
                      <button 
                        onClick={shareOnTelegram}
                        className="flex items-center sm:flex-col justify-center gap-2.5 p-4 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/15 transition-all group min-h-[44px]"
                      >
                         <Telegram className="size-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Telegram</span>
                      </button>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={handleCopyLink}
                        className="flex-1 rounded-xl border border-white/[0.08] py-4 text-xs font-black uppercase tracking-widest text-[#999] hover:bg-white/[0.05] transition-colors"
                      >
                        <Copy className="inline-block mr-2 size-3.5" />
                        Copy Link
                      </button>
                      <GradientButton 
                        variant="variant"
                        className="flex-1 rounded-xl py-4 font-black uppercase tracking-widest text-xs" 
                        onClick={onClose}
                      >
                        Back to Dashboard
                      </GradientButton>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
