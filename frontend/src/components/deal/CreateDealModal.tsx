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
  ShoppingBag
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Step = 1 | 2 | 3;

const INR_PER_USDC = 83.5;

export function CreateDealModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [amountUsdc, setAmountUsdc] = useState<string>("0.00");
  const [category, setCategory] = useState("Jewelry");
  const [expiryPreset, setExpiryPreset] = useState("3d");
  const [copied, setCopied] = useState(false);

  const [finalDealId, setFinalDealId] = useState<string | null>(null);
  const [finalSlug, setFinalSlug] = useState<string | null>(null);

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

  const dealId = finalDealId ?? "#4822";
  const slug = finalSlug ?? "abc123";
  const dealUrl = `safedeal.app/deal/${slug}`;

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleConfirmCreate = () => {
    const rand = Math.floor(4000 + Math.random() * 1000);
    setFinalDealId(`#${rand}`);
    setFinalSlug(Math.random().toString(36).substring(2, 8));
    setStep(3);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl rounded-[2.5rem] bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 bg-slate-50/50">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <div className={cn("size-1.5 rounded-full transition-colors", step >= 1 ? "bg-emerald-500" : "bg-slate-200")} />
                <div className={cn("size-1.5 rounded-full transition-colors", step >= 2 ? "bg-emerald-500" : "bg-slate-200")} />
                <div className={cn("size-1.5 rounded-full transition-colors", step === 3 ? "bg-emerald-500" : "bg-slate-200")} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Step {step} of 3</span>
             </div>
             <h2 className="text-xl font-black text-slate-900">
                {step === 1 && "New Deal Details"}
                {step === 2 && "Final Review"}
                {step === 3 && "Deal is Live!"}
             </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors">
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
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Item Name</label>
                         <div className="relative">
                            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input 
                              type="text" 
                              value={itemName}
                              onChange={(e) => setItemName(e.target.value)}
                              placeholder="e.g. Handmade Silver Earrings"
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-all"
                            />
                         </div>
                      </div>

                      <div className="grid gap-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                         <textarea 
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           rows={3}
                           placeholder="Describe the item condition, size, etc."
                           className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-all resize-none"
                         />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                         <div className="grid gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount (USDC)</label>
                            <div className="relative">
                               <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                               <input 
                                 type="number"
                                 value={amountUsdc}
                                 onChange={(e) => setAmountUsdc(e.target.value)}
                                 className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-black text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition-all"
                               />
                            </div>
                            <p className="text-[10px] font-black text-emerald-600 ml-1 uppercase tracking-widest">≈ ₹{inrAmount.toLocaleString()}</p>
                         </div>
                         <div className="grid gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                            <div className="relative">
                               <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                               <select 
                                 value={category}
                                 onChange={(e) => setCategory(e.target.value)}
                                 className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition-all"
                               >
                                  {["Jewelry", "Clothing", "Electronics", "Art", "Services", "Food", "Other"].map(opt => (
                                    <option key={opt}>{opt}</option>
                                  ))}
                               </select>
                            </div>
                         </div>
                      </div>

                      <div className="grid gap-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deal Expiry</label>
                         <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <select 
                              value={expiryPreset}
                              onChange={(e) => setExpiryPreset(e.target.value)}
                              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition-all"
                            >
                               <option value="24h">24 hours</option>
                               <option value="3d">3 days</option>
                               <option value="7d">7 days</option>
                               <option value="14d">14 days</option>
                            </select>
                         </div>
                      </div>
                   </div>

                   <GradientButton className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-xs" onClick={handleNext}>
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
                   <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 space-y-6">
                      <div className="flex items-start justify-between">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Payout</p>
                            <h3 className="text-2xl font-black text-slate-900">{sellerCut.toFixed(2)} USDC</h3>
                         </div>
                         <div className="text-right space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buyer Total</p>
                            <p className="text-lg font-bold text-slate-600">{parsedAmount.toFixed(2)} USDC</p>
                         </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-slate-200/50">
                         <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">Item:</span>
                            <span className="text-slate-900">{itemName}</span>
                         </div>
                         <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">SafeDeal Fee (1%):</span>
                            <span className="text-emerald-600">-{safedealFee.toFixed(2)} USDC</span>
                         </div>
                         <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">Expiry:</span>
                            <span className="text-slate-900">{expiryLabel}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <button 
                        onClick={handleBack}
                        className="flex-1 rounded-2xl border border-slate-200 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                         <ArrowLeft className="inline-block mr-2 size-3.5" />
                         Back
                      </button>
                      <GradientButton className="flex-[2] rounded-2xl py-4 font-black uppercase tracking-widest text-xs" onClick={handleConfirmCreate}>
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
                      <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 ring-8 ring-emerald-50">
                         <Check className="size-8" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Success!</p>
                      <h3 className="text-2xl font-black text-slate-900">Deal ID: {dealId}</h3>
                   </div>

                   <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                         <QrCode className="size-32" />
                      </div>
                      
                      <div className="bg-white p-4 rounded-2xl shrink-0 shadow-xl">
                        <QRCode value={dealUrl} size={150} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-4">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shareable Link</p>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                               <span className="flex-1 truncate font-mono text-xs font-bold text-emerald-400">{dealUrl}</span>
                               <button 
                                 onClick={handleCopyLink}
                                 className="size-8 flex items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
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
                        className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/15 transition-all group"
                      >
                         <MessageCircle className="size-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                      </button>
                      <button 
                        onClick={handleCopyLink}
                        className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#E1306C]/10 border border-[#E1306C]/20 text-[#E1306C] hover:bg-[#E1306C]/15 transition-all group"
                      >
                         <Instagram className="size-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                      </button>
                      <button 
                        onClick={shareOnTelegram}
                        className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/15 transition-all group"
                      >
                         <Telegram className="size-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Telegram</span>
                      </button>
                   </div>

                   <div className="flex gap-4">
                      <button 
                        onClick={handleCopyLink}
                        className="flex-1 rounded-2xl border border-slate-200 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        <Copy className="inline-block mr-2 size-3.5" />
                        Copy Link
                      </button>
                      <GradientButton 
                        variant="variant"
                        className="flex-1 rounded-2xl py-4 font-black uppercase tracking-widest text-xs" 
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
