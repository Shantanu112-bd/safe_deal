"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useWallet } from "@/context/WalletContext";
import { 
  Wallet, 
  CheckCircle2, 
  XCircle,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "choose" | "connecting" | "success";

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const [step, setStep] = useState<Step>("choose");
  const { connectFreighter, connectAlbedo } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (type: "freighter" | "albedo") => {
    setStep("connecting");
    setError(null);
    try {
      if (type === "freighter") {
        await connectFreighter();
      } else {
        await connectAlbedo();
      }
      setStep("success");
      setTimeout(() => {
        onOpenChange(false);
        setStep("choose");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setStep("choose");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-[#111] px-8 py-10 text-white relative border border-white/[0.08] rounded-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Wallet className="size-32" />
          </div>

          <AnimatePresence mode="wait">
            {step === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <DialogTitle className="text-3xl font-black italic-none">Secure Connect</DialogTitle>
                  <DialogDescription className="text-[#999] font-bold italic-none">
                    Select your preferred Stellar wallet to continue.
                  </DialogDescription>
                </div>

                <div className="grid gap-4">
                  <button
                    onClick={() => handleConnect("freighter")}
                    className="flex items-center justify-between group rounded-2xl glass p-5 transition-all duration-200 hover:border-[#06B6D4]/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
                         <div className="size-6 bg-white/20 rounded flex items-center justify-center font-black text-[10px]">F</div>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-white italic-none">Freighter</p>
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#999] italic-none">Safe Browser Extension</p>
                      </div>
                    </div>
                    <ArrowRight className="size-5 text-[#999] group-hover:text-[#06B6D4] group-hover:translate-x-1 transition-all duration-200" />
                  </button>

                  <button
                    onClick={() => handleConnect("albedo")}
                    className="flex items-center justify-between group rounded-2xl glass p-5 transition-all duration-200 hover:border-[#06B6D4]/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
                         <div className="size-6 bg-white/20 rounded flex items-center justify-center font-black text-[10px]">A</div>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-white italic-none">Albedo</p>
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#999] italic-none">Web Browser Wallet</p>
                      </div>
                    </div>
                    <ArrowRight className="size-5 text-[#999] group-hover:text-[#06B6D4] group-hover:translate-x-1 transition-all duration-200" />
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 p-4 border border-red-500/20 text-red-400 text-xs font-bold italic-none">
                    <XCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 pt-4 opacity-40">
                   <div className="flex items-center gap-1.5 grayscale">
                      <ShieldCheck className="size-3" />
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em]">End-to-End Encryption</span>
                   </div>
                   <div className="flex items-center gap-1.5 grayscale">
                      <Zap className="size-3" />
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Instant Settlement</span>
                   </div>
                </div>
              </motion.div>
            )}

            {step === "connecting" && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center justify-center py-10 space-y-6"
              >
                <div className="relative">
                   <div className="size-24 rounded-full border-4 border-white/5 border-t-[#06B6D4] animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Wallet className="size-8 text-white" />
                   </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black italic-none">Verifying Account</h3>
                  <p className="text-[#999] font-bold italic-none">Waiting for signature on Stellar...</p>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 space-y-6"
              >
                <div className="size-24 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40">
                   <CheckCircle2 className="size-12" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black italic-none">Secured & Linked</h3>
                  <p className="text-[#999] font-bold italic-none">Your wallet is ready for SafeDeal.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
