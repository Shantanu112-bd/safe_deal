"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Shield, 
  Menu, 
  X, 
  LayoutDashboard,
  User,
  Settings
} from "lucide-react";
import { WalletModal } from "@/components/wallet/WalletModal";
import { useWallet } from "@/context/WalletContext";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isConnected, publicKey, disconnect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  const navLinks = [
    { label: "How it Works", href: "/#how-it-works" },
    { label: "For Merchants", href: "/#merchants" },
    { label: "For Buyers", href: "/#buyers" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-500/20 bg-[#030712] shadow-[0_4px_30px_rgba(99,102,241,0.1)]">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 text-white transition-transform group-hover:scale-105">
            <Shield className="size-6" />
          </div>
          <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">SafeDeal</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href}
              className="text-xs font-black uppercase tracking-widest text-slate-200 hover:text-indigo-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-black text-orange-400 border border-orange-500/20 italic-none">
             <div className="size-1.5 rounded-full bg-orange-400 animate-pulse" />
             TESTNET
          </div>
        </nav>

        {/* WALLET BUTTON */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full bg-white/5 border border-indigo-500/20 px-1.5 py-1.5 pr-4 text-white hover:border-indigo-400/50 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-[10px] shadow-inner">
                  {publicKey?.slice(0, 1)}
                </div>
                <span className="text-xs font-black font-mono tracking-tight">
                  {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-white/10 bg-[#0f0f1a] shadow-2xl backdrop-blur-xl text-slate-200">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] px-3 py-2 italic-none">Safe Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="p-0 focus:bg-white/5 rounded-xl cursor-pointer">
                  <Link href="/dashboard" className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0 focus:bg-white/5 rounded-xl cursor-pointer">
                  <Link href="/merchant/profile" className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                    <User className="size-4" /> Storefront
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0 focus:bg-white/5 rounded-xl cursor-pointer">
                  <Link href="/dashboard/settings" className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                    <Settings className="size-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={disconnect}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                >
                  <X className="size-4" /> Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setModalOpen(true)}
                className="hidden md:block px-4 py-2 text-xs font-bold text-slate-200 hover:text-indigo-400 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => setModalOpen(true)}
                className="rounded-xl px-6 py-2.5 text-xs font-black tracking-widest uppercase shadow-xl shadow-indigo-500/20 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 hover:scale-105 transition-all"
              >
                Get Started
              </button>
            </div>
          )}

          {/* MOBILE MENU */}
          <Sheet>
            <SheetTrigger className="lg:hidden rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-2.5 text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Menu className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] p-0 border-l border-white/10 bg-[#0f0f1a] text-white">
               <div className="flex h-full flex-col p-8">
                  <header className="flex items-center justify-between mb-12">
                     <div className="flex items-center gap-2.5">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                           <Shield className="size-6" />
                        </div>
                        <span className="text-xl font-black text-white">SafeDeal</span>
                     </div>
                  </header>

                  <nav className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.label} 
                        href={link.href}
                        className="text-lg font-black text-slate-300 hover:text-indigo-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto space-y-6">
                     <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="size-1.5 rounded-full bg-orange-400 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Stellar Testnet Node</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed italic-none">
                           All transactions are processed on the Stellar Testnet for maximum security and zero real cost.
                        </p>
                     </div>
                     
                     {!isConnected ? (
                        <button 
                           onClick={() => setModalOpen(true)}
                           className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                        >
                           Get Started
                        </button>
                     ) : (
                        <div className="grid grid-cols-2 gap-3">
                           <Link href="/dashboard" className="rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] bg-white/10 hover:bg-white/20 text-center transition-colors">
                              Dashboard
                           </Link>
                           <button onClick={disconnect} className="rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-black uppercase tracking-widest text-[10px] transition-colors">
                              Disconnect
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <WalletModal open={modalOpen} onOpenChange={setModalOpen} />
    </header>
  );
}
