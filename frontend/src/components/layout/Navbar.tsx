"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { WalletModal } from "@/components/wallet/WalletModal";
import { useWallet } from "@/context/WalletContext";

/* ── PROPER SVG LOGO ── */
function SafeDealLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield body */}
      <path
        d="M20 2L4 10v12c0 9.94 6.82 19.24 16 21.6C29.18 41.24 36 31.94 36 22V10L20 2z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M20 2L4 10v12c0 9.94 6.82 19.24 16 21.6C29.18 41.24 36 31.94 36 22V10L20 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Inner lock keyhole */}
      <circle cx="20" cy="18" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M18 21h4l1 7h-6l1-7z"
        fill="currentColor"
        opacity="0.6"
      />
      {/* Check accent */}
      <path
        d="M14 18l4 4 8-8"
        stroke="url(#logoGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="logoGrad" x1="14" y1="14" x2="26" y2="22">
          <stop stopColor="#06B6D4" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, publicKey, disconnect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDashboard = pathname?.startsWith("/dashboard");

  const navLinks = [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/[0.08]"
        style={{ padding: "1rem 2rem" }}
      >
        <div className="max-w-[90rem] mx-auto flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <SafeDealLogo className="w-8 h-8 text-white group-hover:text-[#06B6D4] transition-colors duration-200" />
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white uppercase">
                SafeDeal
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />
            </div>
          </Link>

          {/* CENTER NAV (hidden on mobile & dashboard) */}
          {!isDashboard && (
            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* RIGHT: CTA */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 rounded-full glass px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:scale-[1.02] transition-transform duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={disconnect}
                  className="rounded-full glass px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-red-400 transition-colors duration-200"
                >
                  {publicKey?.slice(0, 4)}…{publicKey?.slice(-4)}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="accent-gradient rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:scale-[1.02] transition-transform duration-200"
              >
                Get Started
              </button>
            )}

            {/* Mobile hamburger */}
            {!isDashboard && (
              <button
                className="lg:hidden text-white p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        {mobileOpen && !isDashboard && (
          <div className="lg:hidden mt-4 rounded-2xl glass p-6 space-y-4 mx-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white py-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!isConnected && (
              <button
                onClick={() => { setModalOpen(true); setMobileOpen(false); }}
                className="w-full accent-gradient rounded-xl py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white mt-2"
              >
                Get Started
              </button>
            )}
          </div>
        )}
      </header>

      <WalletModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
