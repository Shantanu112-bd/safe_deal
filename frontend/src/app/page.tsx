"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Menu,
  Shield,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Lock,
  Send,
  Package,
  HandCoins,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#for-merchants", label: "For Merchants" },
  { href: "#for-buyers", label: "For Buyers" },
  { href: "#pricing", label: "Pricing" },
];

const painPoints = [
  {
    title: "Fake Screenshots",
    description: "Scammers send fake payment proofs",
    icon: Shield,
  },
  {
    title: "Non-Delivery",
    description: "Sellers disappear after receiving money",
    icon: Package,
  },
  {
    title: "No Protection",
    description: "Banks and apps won't help you",
    icon: X,
  },
];

const trustFeatures = [
  {
    title: "AI Fraud Shield",
    description: "We scan every buyer for fraud history",
    icon: ShieldCheck,
  },
  {
    title: "Smart Escrow",
    description: "Funds locked on Stellar blockchain",
    icon: Lock,
  },
  {
    title: "Seller Badges",
    description: "Know who you're dealing with",
    icon: BadgeCheck,
  },
  {
    title: "Auto Refund",
    description: "Money back if seller doesn't deliver",
    icon: HandCoins,
  },
];

const steps = [
  {
    title: "Step 1 - Seller creates deal",
    description: "Share a SafeDeal link with your buyer in seconds",
  },
  {
    title: "Step 2 - Buyer locks payment",
    description: "Money goes into a secure vault - not to the seller yet",
  },
  {
    title: "Step 3 - Deliver and get paid",
    description: "Ship confidently. Money releases when buyer confirms.",
  },
];

const stats = [
  "5 second settlement on Stellar",
  "0% fraud for verified deals",
  "1% transaction fee only",
  "Works globally with USDC",
];

const badges = ["New", "Rising", "Trusted", "Verified"];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2 text-lg font-semibold text-[#0f172a]">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[#0f172a] text-white">
              <Shield className="size-5" />
            </span>
            SafeDeal
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-[#0f172a]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="outline" className="h-10 border-slate-300 px-4 text-slate-800">
              <Wallet className="mr-1 size-4" />
              Connect Wallet
            </Button>
            <Button className="h-10 bg-[#0f172a] px-4 text-white hover:bg-[#17253d]">
              Get Started
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-slate-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              <Button variant="outline" className="h-10 border-slate-300 text-slate-800">
                Connect Wallet
              </Button>
              <Button className="h-10 bg-[#0f172a] text-white hover:bg-[#17253d]">Get Started</Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <Sparkles className="size-3.5" />
                Trusted social commerce payments
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
                Every Deal, Guaranteed Safe
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                The trusted middleman for WhatsApp and Instagram commerce. Buyers pay safely. Sellers ship
                confidently. No more scams.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="h-11 bg-[#0f172a] px-5 text-white hover:bg-[#17253d]">
                  I&apos;m a Seller <ArrowRight className="ml-1 size-4" />
                </Button>
                <Button variant="outline" className="h-11 border-emerald-300 px-5 text-emerald-700 hover:bg-emerald-50">
                  I&apos;m a Buyer
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
              <p className="mb-6 text-sm font-semibold text-slate-500">Animated Secure Deal Flow</p>
              <div className="space-y-4">
                {[
                  { icon: Wallet, label: "Buyer", tone: "bg-blue-50 text-blue-700 border-blue-200" },
                  { icon: Lock, label: "Locks Payment", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { icon: Shield, label: "SafeDeal Vault", tone: "bg-[#e7ebf3] text-[#0f172a] border-slate-300" },
                  { icon: Send, label: "Seller Ships", tone: "bg-amber-50 text-amber-700 border-amber-200" },
                  { icon: CheckCircle2, label: "Buyer Confirms", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { icon: HandCoins, label: "Money Released", tone: "bg-[#e7ebf3] text-[#0f172a] border-slate-300" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="relative">
                      <div
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${item.tone} animate-pulse`}
                        style={{ animationDelay: `${index * 220}ms` }}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Icon className="size-4" />
                          {item.label}
                        </div>
                        {index < 5 && <ChevronRight className="size-4 opacity-70" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0f172a] py-20 text-white">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Millions lose money to online scams every day
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {painPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <article key={point.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <Icon className="size-6 text-[#f59e0b]" />
                    <h3 className="mt-4 text-lg font-semibold">{point.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{point.description}</p>
                  </article>
                );
              })}
            </div>
            <p className="mt-8 text-base text-[#f59e0b]">₹2,400 crore lost to online fraud in India 2023</p>
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">How it Works</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((step, idx) => (
                <article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-semibold text-[#10b981]">0{idx + 1}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#0f172a]">{step.title}</h3>
                  <p className="mt-3 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="for-buyers" className="bg-slate-50 py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">Trust Features</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trustFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                    <Icon className="size-6 text-[#10b981]" />
                    <h3 className="mt-4 font-semibold text-[#0f172a]">{feature.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="for-merchants" className="bg-white py-20">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">Built for WhatsApp sellers</h2>
              <ul className="mt-8 space-y-4 text-slate-700">
                {[
                  "Generate link in 30 seconds",
                  "Share on WhatsApp, Instagram, Telegram",
                  "Get paid in USDC or convert to INR via UPI",
                  "Build your verified seller reputation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#10b981]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-lg shadow-slate-900/5">
              <div className="mx-auto max-w-sm rounded-[2rem] border-8 border-[#0f172a] bg-white p-4">
                <div className="rounded-2xl bg-slate-100 p-3">
                  <p className="text-xs font-semibold text-slate-500">WhatsApp Chat</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="w-fit rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-slate-600 shadow-sm">
                      Here&apos;s your SafeDeal payment link ✅
                    </div>
                    <div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-[#0f172a] px-3 py-2 text-white">
                      Paid and locked. Shipping now 🚚
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#10b981]">Real Example</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
              Meet Priya. She sells handmade jewelry on WhatsApp.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
              Last month a buyer sent a fake screenshot and she lost ₹4,000. With SafeDeal, that can never happen.
              The money is locked before she ships. Always.
            </p>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">Trust Badge Progression</h2>
            <p className="mt-3 text-slate-600">Every completed deal builds your reputation</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {badges.map((badge, index) => (
                <article key={badge} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-[#0f172a] text-white">
                    <BadgeCheck className="size-6" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[#0f172a]">{badge}</p>
                  {index < badges.length - 1 && <p className="mt-1 text-sm text-slate-500">Next badge unlocks after more deals</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-y border-slate-200 bg-[#0f172a] py-12 text-white">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 text-center sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((stat) => (
              <p key={stat} className="text-base font-medium">
                {stat}
              </p>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-b from-white to-slate-50 py-20">
          <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-lg shadow-slate-900/5 sm:px-10">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">Start protecting your deals today</h2>
            <p className="mt-4 text-lg text-slate-600">Free to join. 1% only when you get paid.</p>
            <div className="mt-8">
              <Button className="h-12 bg-[#10b981] px-7 text-base font-semibold text-white hover:bg-[#0ea674]">
                Create Your First Deal
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-[#0f172a]">
            <Shield className="size-4" /> SafeDeal
          </div>
          <div className="flex flex-wrap gap-5 text-slate-600">
            {[
              { label: "About", href: "#" },
              { label: "How it Works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
              { label: "Docs", href: "#" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="hover:text-[#0f172a]">
                {item.label}
              </a>
            ))}
          </div>
          <div className="text-slate-500">Powered by Stellar blockchain. Built for social commerce.</div>
        </div>
      </footer>
    </div>
  );
}
