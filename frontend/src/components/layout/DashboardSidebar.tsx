"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
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
  ShieldCheck
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { publicKey, disconnect, xlmBalance, usdcBalance } = useWallet();

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Deals", href: "/dashboard/deals", icon: ShoppingBag },
    { label: "History", href: "/dashboard/history", icon: History },
    { label: "Metrics", href: "/dashboard/metrics", icon: BarChart3 },
    { label: "Security Audit", href: "/dashboard/security", icon: ShieldCheck },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const tabs = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: FileText, label: 'Deals', href: '/dashboard/deals' },
    { icon: Clock, label: 'History', href: '/dashboard/history' },
    { icon: BarChart3, label: 'Metrics', href: '/dashboard/metrics' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-[#0f0f1a] px-6 py-10 h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
            <Shield className="size-6" />
          </div>
          <span className="text-xl font-black text-white tracking-tight italic-none">SafeDeal</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 group",
                  isActive 
                    ? "bg-white/10 text-white border border-white/10 shadow-lg shadow-black/20" 
                    : "text-[#94a3b8] hover:bg-white/5 hover:text-white border border-transparent"
                )}
              >
                <item.icon className={cn("size-5", isActive ? "text-indigo-400" : "group-hover:scale-110 transition-transform")} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto size-3 text-[#94a3b8]" />}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM STATS & WALLET */}
        <div className="mt-8 space-y-4">
           <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Your Balances</span>
                <Wallet className="size-3.5 text-indigo-400" />
              </div>
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">USDC</span>
                    <span className="text-sm font-black text-emerald-400">{parseFloat(usdcBalance).toFixed(2)}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">XLM</span>
                    <span className="text-sm font-black text-white">{parseFloat(xlmBalance).toFixed(1)}</span>
                 </div>
              </div>
           </div>

           <div className="px-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Testnet Online</span>
              </div>
              <p className="text-[10px] font-black font-mono text-[#94a3b8] truncate bg-black/40 rounded-lg px-3 py-2 border border-white/5 italic-none">
                {publicKey}
              </p>
           </div>

           <button 
             onClick={disconnect}
             className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all italic-none"
           >
             <LogOut className="size-5" />
             Disconnect
           </button>
        </div>
      </aside>

      {/* NEW — Mobile bottom tab bar only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-md border-t border-white/10 flex items-center justify-around h-16 pb-safe">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-1",
              "py-2 px-3 rounded-lg flex-1 transition-colors",
              pathname === tab.href
                ? "text-indigo-400"
                : "text-[#94a3b8] hover:text-white"
            )}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold">
              {tab.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
