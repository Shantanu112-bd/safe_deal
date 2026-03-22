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
import { GradientButton } from "@/components/ui/gradient-button";
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
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 shadow-xl text-white transition-transform group-hover:scale-105">
            <Shield className="size-6" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tighter">SafeDeal</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href}
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black text-orange-600 border border-orange-100 italic-none">
             <div className="size-1.5 rounded-full bg-orange-400 animate-pulse" />
             TESTNET
          </div>
        </nav>

        {/* WALLET BUTTON */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full bg-slate-900 px-1.5 py-1.5 pr-4 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-[10px]">
                  {publicKey?.slice(0, 1)}
                </div>
                <span className="text-xs font-black font-mono tracking-tight">
                  {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-200">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2 italic-none">Safe Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <Link href="/dashboard" className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-900 focus:bg-slate-50">
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link href="/merchant/profile" className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-900 focus:bg-slate-50">
                    <User className="size-4" /> Storefront
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link href="/settings" className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-900 focus:bg-slate-50">
                    <Settings className="size-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={disconnect}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 focus:bg-red-50 focus:text-red-600"
                >
                  <X className="size-4" /> Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <GradientButton 
                onClick={() => setModalOpen(true)}
                className="rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10"
              >
                Connect Wallet
              </GradientButton>
            </>
          )}

          {/* MOBILE MENU */}
          <Sheet>
            <SheetTrigger className="lg:hidden rounded-xl bg-slate-50 p-2.5 text-slate-600 hover:bg-slate-100 transition-all">
              <Menu className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] p-0 border-none">
               <div className="flex h-full flex-col bg-white p-8">
                  <header className="flex items-center justify-between mb-12">
                     <div className="flex items-center gap-2.5">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                           <Shield className="size-6" />
                        </div>
                        <span className="text-xl font-black text-slate-900">SafeDeal</span>
                     </div>
                  </header>

                  <nav className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.label} 
                        href={link.href}
                        className="text-lg font-black text-slate-900 hover:text-emerald-500 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto space-y-6">
                     <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="size-1.5 rounded-full bg-orange-400 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stellar Testnet Node</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed italic-none">
                           All transactions are processed on the Stellar Testnet for maximum security and zero real cost.
                        </p>
                     </div>
                     
                     {!isConnected ? (
                        <GradientButton 
                           onClick={() => setModalOpen(true)}
                           className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-xs"
                        >
                           Connect Wallet
                        </GradientButton>
                     ) : (
                        <div className="grid grid-cols-2 gap-3">
                           <GradientButton variant="variant" className="rounded-2xl py-4 font-black uppercase tracking-widest text-[10px]">
                              <Link href="/dashboard">Dashboard</Link>
                           </GradientButton>
                           <button onClick={disconnect} className="rounded-2xl border border-red-100 bg-red-50 text-red-500 font-black uppercase tracking-widest text-[10px]">
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
