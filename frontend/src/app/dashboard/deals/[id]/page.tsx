"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Clock,
  Send,
  FileText,
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

type DealTimelineStatus =
  | "waiting_payment"
  | "payment_locked"
  | "shipped"
  | "disputed"
  | "completed"
  | "refunded";

const currentStatus: DealTimelineStatus = "payment_locked";

export default function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "4822";

  const statusLabel = useMemo(() => {
    switch (currentStatus) {
      case "waiting_payment":
        return "Waiting for Payment";
      case "payment_locked":
        return "Payment Locked";
      case "shipped":
        return "Shipped";
      case "disputed":
        return "Disputed";
      case "completed":
        return "Completed";
      case "refunded":
        return "Refunded";
      default:
        return "Waiting for Payment";
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#0f172a]"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </a>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              <Shield className="size-3.5" />
              SafeDeal Escrow
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Deal
            </p>
            <h1 className="text-xl font-semibold text-[#0f172a]">
              Handmade Silver Earrings
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Deal ID: <span className="font-mono text-slate-700">#{id}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500">Current status</p>
            <p className="mt-0.5 text-sm font-semibold text-[#0f172a]">
              {statusLabel}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0f172a]">
            Deal Timeline
          </h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-[#0f172a]">
                  Deal Created — March 13, 2:30 PM
                </p>
                <p className="text-xs text-slate-500">
                  Seller created this SafeDeal link and shared it with the
                  buyer.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-[#0f172a]">
                  Payment Locked — March 13, 3:45 PM
                </p>
                <p className="text-xs text-slate-500">
                  Buyer{" "}
                  <span className="font-mono text-slate-700">
                    GCKF...WXQR
                  </span>{" "}
                  locked{" "}
                  <span className="font-semibold text-[#0f172a]">
                    2,400 USDC
                  </span>{" "}
                  into escrow.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Clock className="size-4 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-[#0f172a]">
                  Awaiting Delivery Confirmation
                </p>
                <p className="text-xs text-slate-500">
                  Buyer will confirm delivery or open a dispute from their
                  payment page.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 opacity-50">
              <div className="mt-0.5">
                <Lock className="size-4 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-500">Payment Released</p>
                <p className="text-xs text-slate-400">
                  Funds will be released to you once the buyer confirms
                  delivery or after a successful dispute resolution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Risk + actions */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0f172a]">
              Buyer Risk Assessment
            </h2>
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Score:{" "}
                <span className="text-base font-bold text-emerald-700">
                  23/100
                </span>{" "}
                — <span className="text-emerald-700">Safe</span>
              </p>
              <p className="mt-1 text-xs text-emerald-800">
                Wallet passed SafeDeal&apos;s fraud checks. No disputes or scam
                reports found.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Wallet age
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  847 days
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Total deals
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  34
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Disputes
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  0
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Buyer wallet
                </p>
                <p className="mt-1 font-mono text-xs text-[#0f172a]">
                  GCKF...WXQR
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0f172a]">
              Actions
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Choose what to do next based on the stage of this deal.
            </p>

            <div className="mt-4 space-y-3">
              {currentStatus === "waiting_payment" && (
                <>
                  <GradientButton className="w-full justify-center text-sm">
                    Share Link Again
                  </GradientButton>
                  <button className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Cancel Deal
                  </button>
                </>
              )}

              {currentStatus === "payment_locked" && (
                <>
                  <GradientButton className="w-full justify-center text-sm">
                    <Send className="mr-1 size-4" />
                    Mark as Shipped
                  </GradientButton>
                  <button className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Cancel &amp; Refund
                  </button>
                </>
              )}

              {currentStatus === "shipped" && (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  Waiting for the buyer to confirm delivery or open a dispute.
                  Funds remain locked in escrow.
                </div>
              )}

              {currentStatus === "disputed" && (
                <>
                  <GradientButton className="w-full justify-center text-sm">
                    <FileText className="mr-1 size-4" />
                    Submit Evidence
                  </GradientButton>
                  <button className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    View Dispute
                  </button>
                </>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

