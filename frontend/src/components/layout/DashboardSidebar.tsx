"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  History,
  User,
  Settings,
  Wallet,
  LogOut,
  ChevronRight,
  Home,
  FileText,
  Clock,
  BarChart3,
  Shield,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";

/* ── Sidebar Logo (same as Navbar) ── */
function SidebarLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white">
      <path d="M20 2L4 10v12c0 9.94 6.82 19.24 16 21.6C29.18 41.24 36 31.94 36 22V10L20 2z" fill="currentColor" opacity="0.15" />
      <path d="M20 2L4 10v12c0 9.94 6.82 19.24 16 21.6C29.18 41.24 36 31.94 36 22V10L20 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="18" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M18 21h4l1 7h-6l1-7z" fill="currentColor" opacity="0.6" />
      <path d="M14 18l4 4 8-8" stroke="url(#sideGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <defs>
        <linearGradient id="sideGrad" x1="14" y1="14" x2="26" y2="22">
          <stop stopColor="#06B6D4" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { publicKey, disconnect, xlmBalance, usdcBalance } = useWallet();

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Deals", href: "/dashboard/deals", icon: ShoppingBag },
    { label: "History", href: "/dashboard/history", icon: History },
    { label: "Metrics", href: "/dashboard/metrics", icon: BarChart3 },
    { label: "Security", href: "/dashboard/security", icon: Shield },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const tabs = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: FileText, label: "Deals", href: "/dashboard/deals" },
    { icon: Clock, label: "History", href: "/dashboard/history" },
    { icon: BarChart3, label: "Metrics", href: "/dashboard/metrics" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/[0.08] bg-[#0a0a0a] px-6 py-10 h-screen sticky top-0 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-12">
          <SidebarLogo />
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white tracking-tight uppercase italic-none">
              SafeDeal
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 group",
                  isActive
                    ? "bg-white/[0.08] text-white border border-white/[0.1]"
                    : "text-[#999] hover:bg-white/[0.04] hover:text-white border border-transparent"
                )}
              >
                <item.icon
                  className={cn(
                    "size-5",
                    isActive
                      ? "text-[#06B6D4]"
                      : "group-hover:scale-110 transition-transform duration-200"
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="ml-auto size-3 text-[#999]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Balances & Wallet */}
        <div className="mt-8 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">
                Your Balances
              </span>
              <Wallet className="size-3.5 text-[#06B6D4]" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">USDC</span>
                <span className="text-sm font-black accent-gradient-text">
                  {parseFloat(usdcBalance).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">XLM</span>
                <span className="text-sm font-black text-white">
                  {parseFloat(xlmBalance).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                Testnet Online
              </span>
            </div>
            <p className="text-[10px] font-bold font-mono text-[#999] truncate bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.08] italic-none">
              {publicKey}
            </p>
          </div>

          <button
            onClick={disconnect}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all duration-200 italic-none"
          >
            <LogOut className="size-5" />
            Disconnect
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/[0.08] flex items-center justify-around h-16 pb-safe">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-1",
              "py-2 px-3 rounded-lg flex-1 transition-colors duration-200",
              pathname === tab.href
                ? "text-[#06B6D4]"
                : "text-[#999] hover:text-white"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
