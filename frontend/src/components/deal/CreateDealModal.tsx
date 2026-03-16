"use client";

import { useMemo, useState } from "react";
import { X, ChevronRight, Copy, Check } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import QRCode from "react-qr-code";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Step = 1 | 2 | 3;

const INR_PER_USDC = 83.5;

export function CreateDealModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [itemName, setItemName] = useState("Handmade Silver Earrings");
  const [description, setDescription] = useState(
    "925 silver, handcrafted, size 2cm"
  );
  const [amountUsdc, setAmountUsdc] = useState<string>("24.00");
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
      case "24h":
        return 24;
      case "3d":
        return 72;
      case "7d":
        return 168;
      case "14d":
        return 336;
      default:
        return 72;
    }
  }, [expiryPreset]);

  const expiryDate = useMemo(() => {
    const d = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    return d;
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
  const dealUrl = `https://safedeal.app/deal/${slug}`;

  const canContinueStep1 =
    itemName.trim().length > 0 && parsedAmount > 0 && description.trim().length > 0;

  const handleNextFromDetails = () => {
    if (!canContinueStep1) return;
    setStep(2);
  };

  const handleConfirmCreate = () => {
    const rand = Math.floor(4800 + Math.random() * 200);
    const newId = `#${rand}`;
    const newSlug = Math.random().toString(36).slice(2, 8);
    setFinalDealId(newId);
    setFinalSlug(newSlug);
    setStep(3);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(dealUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const whatsappMessage = `Hi! I've created a SafeDeal payment link for your order. Your payment will be secured in escrow until you confirm delivery. Pay here: ${dealUrl}`;

  const openWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
  };

  const openTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      dealUrl
    )}&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {step === 1 && "Step 1 of 3"}
              {step === 2 && "Step 2 of 3"}
              {step === 3 && "Step 3 of 3"}
            </p>
            <h2 className="text-lg font-semibold text-[#0f172a]">
              {step === 1 && "Deal Details"}
              {step === 2 && "Review & Confirm"}
              {step === 3 && "Deal Created"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4 px-6 py-5 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Item Name
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Handmade Silver Earrings"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="925 silver, handcrafted, size 2cm"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Amount in USDC
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amountUsdc}
                  onChange={(e) => setAmountUsdc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]"
                />
                <p className="mt-1 text-xs text-slate-500">
                  ≈ ₹{inrAmount.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]"
                >
                  <option>Jewelry</option>
                  <option>Clothing</option>
                  <option>Electronics</option>
                  <option>Art</option>
                  <option>Services</option>
                  <option>Food</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Expiry
              </label>
              <select
                value={expiryPreset}
                onChange={(e) => setExpiryPreset(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#0f172a]"
              >
                <option value="24h">24 hours</option>
                <option value="3d">3 days</option>
                <option value="7d">7 days</option>
                <option value="14d">14 days</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <GradientButton
                className="flex-1 justify-center text-sm"
                onClick={handleNextFromDetails}
                disabled={!canContinueStep1}
              >
                <ChevronRight className="mr-1 size-4" />
                Review Deal
              </GradientButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 px-6 py-5 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Item
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                {itemName}
              </p>
              <p className="mt-1 text-xs text-slate-600">{description}</p>
              <p className="mt-1 text-xs text-slate-500">Category: {category}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Amount & Fees
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Amount</span>
                  <span>
                    {parsedAmount.toFixed(2)} USDC (≈ ₹
                    {inrAmount.toLocaleString("en-IN")})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>SafeDeal fee (1%)</span>
                  <span>{safedealFee.toFixed(2)} USDC</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-sm font-semibold text-[#0f172a]">
                  <span>Your cut</span>
                  <span>{sellerCut.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Expiry
              </p>
              <p className="mt-1 text-sm text-[#0f172a]">{expiryLabel}</p>
              <p className="mt-1 text-xs text-slate-500">
                After this time, the deal will auto-expire and funds will be
                auto-refunded if payment was locked.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <GradientButton
                className="flex-1 justify-center text-sm"
                onClick={handleConfirmCreate}
              >
                <ChevronRight className="mr-1 size-4" />
                Confirm &amp; Create Deal
              </GradientButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 px-6 py-6 text-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
              <Check className="size-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#0f172a]">
                Your deal is live
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Share this link with your buyer on WhatsApp, Instagram, or
                Telegram.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <QRCode value={dealUrl} size={120} />
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <p className="font-mono text-slate-500">
                  Deal ID:{" "}
                  <span className="font-semibold text-[#0f172a]">
                    {dealId}
                  </span>
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="flex-1 truncate font-mono text-[11px] text-slate-700">
                    {dealUrl}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center rounded-lg bg-[#0f172a] px-2.5 py-1 text-[11px] font-semibold text-white"
                  >
                    <Copy className="mr-1 size-3.5" />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <GradientButton
                className="w-full justify-center text-xs"
                onClick={openWhatsApp}
              >
                📱 Share on WhatsApp
              </GradientButton>
              <GradientButton
                variant="variant"
                className="w-full justify-center text-xs"
                onClick={handleCopyLink}
              >
                📸 Share on Instagram
              </GradientButton>
              <GradientButton
                className="w-full justify-center text-xs"
                onClick={openTelegram}
              >
                💬 Share on Telegram
              </GradientButton>
            </div>

            <div className="mt-2 flex gap-3">
              <GradientButton
                variant="variant"
                className="flex-1 justify-center text-sm"
                onClick={handleCopyLink}
              >
                <Copy className="mr-1 size-4" />
                Copy Link
              </GradientButton>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

