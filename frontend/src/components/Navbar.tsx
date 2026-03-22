"use client";

import Link from "next/link";
import { Shield, LayoutDashboard, Store, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WalletConnect } from "./wallet/WalletConnect";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-[60] border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20 text-white group-hover:scale-105 transition-transform">
              <Shield className="size-5 fill-emerald-100/20" />
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight tracking-tight text-slate-900 italic-none">SafeDeal</h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic-none">Secure Escrow</span>
                <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-orange-700 italic-none">
                  Testnet
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link href="/merchant/demo" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              <Store className="size-4" />
              Storefront
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <WalletConnect />
        </div>

        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex items-center justify-center p-2 text-slate-500 hover:text-slate-900">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] z-[100]">
              <div className="flex flex-col gap-6 py-4">
                <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
                <Link href="/merchant/demo" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  <Store className="size-4" />
                  Storefront
                </Link>
                <div className="mt-4">
                  <WalletConnect />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
