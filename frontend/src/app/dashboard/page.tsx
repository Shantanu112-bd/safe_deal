"use client";

import { useState } from "react";
import {
  Shield,
  LayoutDashboard,
  ShoppingBag,
  History,
  User,
  Settings,
  Plus,
  Link2,
  Eye,
  X,
  ChevronRight,
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { CreateDealModal } from "@/components/deal/CreateDealModal";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type DealStatus =
  | "Waiting for Payment"
  | "Payment Locked"
  | "Shipped"
  | "Completed"
  | "Disputed"
  | "Refunded";

type DealCard = {
  id: string;
  title: string;
  buyer: string;
  amount: string;
  status: DealStatus;
  createdAgo: string;
  expiresIn: string;
};

const activeDeals: DealCard[] = [
  {
    id: "4823",
    title: "Handmade Silver Earrings",
    buyer: "GCKF...WXQR",
    amount: "2,400 USDC",
    status: "Waiting for Payment",
    createdAgo: "2 hours ago",
    expiresIn: "5 days 22 hours",
  },
  {
    id: "4822",
    title: "Custom Kurti - Size M",
    buyer: "GDF9...12KD",
    amount: "1,800 USDC",
    status: "Payment Locked",
    createdAgo: "4 hours ago",
    expiresIn: "3 days 18 hours",
  },
  {
    id: "4821",
    title: "Vintage Camera Strap",
    buyer: "GB8K...PQ9Z",
    amount: "950 USDC",
    status: "Shipped",
    createdAgo: "8 hours ago",
    expiresIn: "2 days 6 hours",
  },
];

const statusStyles: Record<
  DealStatus,
  { label: string; dotClass: string; textClass: string; badgeClass: string }
> = {
  "Waiting for Payment": {
    label: "Waiting for Payment",
    dotClass: "bg-amber-400",
    textClass: "text-amber-700",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
  },
  "Payment Locked": {
    label: "Payment Locked",
    dotClass: "bg-emerald-400 animate-pulse",
    textClass: "text-emerald-700",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  Shipped: {
    label: "Shipped",
    dotClass: "bg-sky-400",
    textClass: "text-sky-700",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
  },
  Completed: {
    label: "Completed",
    dotClass: "bg-slate-400",
    textClass: "text-slate-700",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
  },
  Disputed: {
    label: "Disputed",
    dotClass: "bg-orange-400",
    textClass: "text-orange-700",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-700",
  },
  Refunded: {
    label: "Refunded",
    dotClass: "bg-red-400",
    textClass: "text-red-700",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
  },
};

const earnings7d = [
  { day: "Mon", amount: 240 },
  { day: "Tue", amount: 320 },
  { day: "Wed", amount: 180 },
  { day: "Thu", amount: 420 },
  { day: "Fri", amount: 360 },
  { day: "Sat", amount: 510 },
  { day: "Sun", amount: 295 },
];

const recentActivity = [
  {
    id: "activity-1",
    title: "Deal #4821 completed",
    description: "₹3,200 received",
    time: "2h ago",
  },
  {
    id: "activity-2",
    title: "Deal #4820 payment locked",
    description: "₹1,800 secured",
    time: "5h ago",
  },
  {
    id: "activity-3",
    title: "Deal #4819 dispute resolved",
    description: "₹2,400 released",
    time: "1d ago",
  },
];

export default function Dashboard() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
          <div className="flex items-center gap-2 px-2">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[#0f172a] text-white">
              <Shield className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#0f172a]">SafeDeal</p>
              <p className="text-xs text-slate-500">Merchant</p>
            </div>
          </div>

          <nav className="mt-8 flex-1 space-y-1 text-sm font-medium">
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-white"
            >
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100"
            >
              <ShoppingBag className="size-4" />
              <span>My Deals</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100"
            >
              <History className="size-4" />
              <span>History</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100"
            >
              <User className="size-4" />
              <span>My Profile</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100"
            >
              <Settings className="size-4" />
              <span>Settings</span>
            </a>
          </nav>

          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
              <span className="font-semibold">Stellar Testnet</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold">
                ORANGE
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Connected Wallet
              </p>
              <p className="mt-1 font-mono text-xs">GCKF...WXQR</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-2 lg:hidden">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#0f172a] text-white">
                  <Shield className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">
                    SafeDeal
                  </p>
                  <p className="text-xs text-slate-500">Merchant dashboard</p>
                </div>
              </div>

              <div className="hidden lg:block">
                <h1 className="text-lg font-semibold text-[#0f172a]">
                  Dashboard
                </h1>
                <p className="text-xs text-slate-500">
                  Overview of your deals and earnings
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium text-slate-500">
                    USDC Balance
                  </p>
                  <p className="text-sm font-semibold text-[#0f172a]">
                    248.50 USDC
                  </p>
                </div>
                <GradientButton
                  className="min-w-0 rounded-xl px-4 py-2 text-sm"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="mr-1 size-4" />
                  New Deal
                </GradientButton>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {/* Stats row */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Active Deals
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0f172a]">3</p>
                <p className="mt-1 text-xs text-slate-500">
                  Deals currently in progress
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Pending Payment
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0f172a]">
                  ₹12,400
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Across all open deals
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Completed This Month
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0f172a]">
                  47
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  With 0% fraud rate
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total Earned
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0f172a]">
                  ₹1,24,000
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Lifetime via SafeDeal
                </p>
              </article>
            </section>

            {/* Main grid */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
              {/* Active deals + chart */}
              <div className="space-y-6">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-[#0f172a]">
                        Active Deals
                      </h2>
                      <p className="text-xs text-slate-500">
                        Manage your open and in-progress deals
                      </p>
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      3 active
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {activeDeals.map((deal) => {
                      const status = statusStyles[deal.status];
                      return (
                        <div
                          key={deal.id}
                          className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 hover:bg-slate-50"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#0f172a]">
                                🛍️ {deal.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Buyer:{" "}
                                <span className="font-mono">{deal.buyer}</span>
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Amount: {deal.amount}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                <span>Created: {deal.createdAgo}</span>
                                <span>Expires: {deal.expiresIn}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${status.badgeClass}`}
                              >
                                <span
                                  className={`size-2 rounded-full ${status.dotClass}`}
                                />
                                <span className={status.textClass}>
                                  {status.label}
                                </span>
                              </span>

                              <div className="flex gap-2">
                                <GradientButton
                                  variant="variant"
                                  className="min-w-0 rounded-lg px-3 py-2 text-xs"
                                >
                                  <Link2 className="mr-1 size-3.5" />
                                  Share Link
                                </GradientButton>
                                <GradientButton className="min-w-0 rounded-lg px-3 py-2 text-xs">
                                  <Eye className="mr-1 size-3.5" />
                                  View
                                </GradientButton>
                                <button className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">
                                  <X className="mr-1 size-3" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[#0f172a]">
                        Earnings (last 7 days)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Daily earnings in USDC
                      </p>
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      Total: 2,325 USDC
                    </p>
                  </div>
                  <div className="mt-4 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={earnings7d}>
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 18px 45px rgba(15,23,42,0.14)",
                            fontSize: 12,
                          }}
                          formatter={(value) =>
                            value !== undefined
                              ? [`${value as number} USDC`, "Earnings"]
                              : ["", ""]
                          }
                        />
                        <Bar
                          dataKey="amount"
                          radius={[8, 8, 4, 4]}
                          fill="#10b981"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </article>
              </div>

              {/* Recent activity */}
              <aside className="space-y-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-[#0f172a]">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-slate-500">
                    Latest updates from your deals
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    {recentActivity.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3"
                      >
                        <div>
                          <p className="font-medium text-[#0f172a]">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.description}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Stellar escrow
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    Every deal is protected by on-chain escrow and AI fraud
                    checks.
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    Create a SafeDeal link for every new buyer and share it
                    directly in WhatsApp, Instagram, or Telegram.
                  </p>
                  <GradientButton
                    className="mt-4 w-full justify-center rounded-xl text-sm"
                    onClick={() => setShowCreate(true)}
                  >
                    <ChevronRight className="mr-1 size-4" />
                    Create New Deal
                  </GradientButton>
                </article>
              </aside>
            </section>
          </main>

          {/* Bottom tab bar (mobile) */}
          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-2 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] lg:hidden">
            <div className="mx-auto grid max-w-md grid-cols-4 gap-2 text-xs font-medium">
              <button className="flex flex-col items-center gap-1 text-[#0f172a]">
                <LayoutDashboard className="size-4" />
                <span>Dashboard</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-slate-500">
                <ShoppingBag className="size-4" />
                <span>Deals</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-slate-500">
                <History className="size-4" />
                <span>History</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-slate-500">
                <User className="size-4" />
                <span>Profile</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      <CreateDealModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

