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
  Clock
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
    { label: "My Profile", href: "/merchant/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const tabs = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: FileText, label: 'Deals', href: '/dashboard/deals' },
    { icon: Clock, label: 'History', href: '/dashboard/history' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white px-6 py-10 h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xl">
            <Shield className="size-6" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight italic-none">SafeDeal</span>
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
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("size-5", isActive ? "text-emerald-400" : "group-hover:scale-110 transition-transform")} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto size-3 text-slate-500" />}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM STATS & WALLET */}
        <div className="mt-8 space-y-4">
           <div className="rounded-[2rem] bg-slate-50 border border-slate-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Balances</span>
                <Wallet className="size-3.5 text-slate-300" />
              </div>
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">USDC</span>
                    <span className="text-sm font-black text-slate-900">{parseFloat(usdcBalance).toFixed(2)}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">XLM</span>
                    <span className="text-sm font-black text-slate-900">{parseFloat(xlmBalance).toFixed(1)}</span>
                 </div>
              </div>
           </div>

           <div className="px-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Testnet Online</span>
              </div>
              <p className="text-[10px] font-black font-mono text-slate-400 truncate bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 italic-none">
                {publicKey}
              </p>
           </div>

           <button 
             onClick={disconnect}
             className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all italic-none"
           >
             <LogOut className="size-5" />
             Disconnect
           </button>
        </div>
      </aside>

      {/* NEW — Mobile bottom tab bar only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111827] border-t border-[#1e293b] flex items-center justify-around h-16">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-1",
              "py-2 px-3 rounded-lg",
              pathname === tab.href
                ? "text-emerald-500"
                : "text-slate-400"
            )}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">
              {tab.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
