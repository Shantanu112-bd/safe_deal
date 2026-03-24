"use client";

import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Lock,
  Package,
  HandCoins,
  AlertTriangle,
  Smartphone,
  Zap,
  ThumbsUp,
  ShieldQuestion,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "AI Fraud Shield",
    description: "Real-time scanning of wallet history to block known scammers before they pay.",
    icon: ShieldCheck,
    color: "text-[#6366f1]"
  },
  {
    title: "Smart Escrow",
    description: "Funds are mathematically secured on Stellar until the physical item is delivered.",
    icon: Lock,
    color: "text-[#06b6d4]"
  },
  {
    title: "Seller Reputation",
    description: "Verified badges based on successful deal history and delivery speed.",
    icon: BadgeCheck,
    color: "text-[#10b981]"
  },
  {
    title: "Automatic Refunds",
    description: "If the seller doesn't ship within the countdown, funds return to you instantly.",
    icon: HandCoins,
    color: "text-[#f59e0b]"
  },
  {
    title: "Low 1% Fee",
    description: "Zero upfront costs. Professional escrow protection for the price of a coffee.",
    icon: Zap,
    color: "text-[#a855f7]"
  },
  {
    title: "Dispute Support",
    description: "Our compliance team reviews evidence if something goes wrong with delivery.",
    icon: ThumbsUp,
    color: "text-[#8b5cf6]"
  },
];

const steps = [
  {
    num: "1",
    title: "Create Deal",
    description: "Set item details and amount. Generate a secure payment link in 30 seconds.",
    icon: Smartphone,
  },
  {
    num: "2",
    title: "Lock Payment",
    description: "Buyer pays via any Stellar wallet. Funds are held safely.",
    icon: Lock,
  },
  {
    num: "3",
    title: "Ship & Earn",
    description: "Seller ships confidently. Funds release instantly on delivery.",
    icon: CheckCircle2,
  },
];

const badges = [
  { level: "New", minDeals: 0, glow: "shadow-[0_0_15px_rgba(148,163,184,0.4)]", color: "text-slate-400" },
  { level: "Rising", minDeals: 10, glow: "shadow-[0_0_15px_rgba(59,130,246,0.4)]", color: "text-blue-400" },
  { level: "Trusted", minDeals: 50, glow: "shadow-[0_0_15px_rgba(16,185,129,0.4)]", color: "text-[#10b981]" },
];

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  return (
    <div className="bg-[#030712] min-h-screen text-[#f8fafc] font-sans selection:bg-[#6366f1]/30 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a] to-[#030712]" />
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,#030712_0%,#6366f1_25%,#8b5cf6_50%,#030712_75%,#030712_100%)] opacity-20 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-0 bg-[#030712]/80 backdrop-blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1.1
            }}
            className="mb-8"
          >
            Every Deal,<br/>Guaranteed Safe
          </motion.h1>
          <motion.p {...fadeIn} className="text-[#94a3b8] text-lg lg:text-xl max-w-2xl mx-auto mb-12 font-medium">
            The AI-protected escrow platform for WhatsApp merchants in India. Don&apos;t lose money to fake screenshots and non-delivery ever again.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link 
              href="/dashboard/deals"
              className="px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 rounded-2xl font-black text-white text-lg shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all hover:scale-105"
            >
              Create a Deal
            </Link>
            <Link 
              href="/docs"
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold text-white text-lg transition-all"
            >
              Read Documentation
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: "🔒", title: "0% Fraud", desc: "on verified deals" },
              { icon: "⚡", title: "5s Settlement", desc: "on Stellar blockchain" },
              { icon: "💰", title: "1% Fee Only", desc: "when you earn" }
            ].map((stat, i) => (
              <div 
                key={i} 
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "16px",
                  padding: "24px"
                }}
                className="flex items-center gap-4 text-left"
              >
                <div className="text-3xl">{stat.icon}</div>
                <div>
                  <div className="font-bold text-white text-lg">{stat.title}</div>
                  <div className="text-[#94a3b8] text-sm">{stat.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Problems We Solve</h2>
            <p className="text-[#94a3b8]">Why you need an escrow for social commerce.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div {...fadeIn} transition={{ delay: 0.1 }} style={{ borderLeft: "4px solid #ef4444" }} className="bg-[#0f0f1a] p-8 rounded-xl border border-white/5 border-l-[#ef4444]">
              <AlertTriangle className="text-[#ef4444] w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Fake Screenshots</h3>
              <p className="text-[#94a3b8] text-sm">Scammers fake payment receipts. You ship goods for free.</p>
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.2 }} style={{ borderLeft: "4px solid #f59e0b" }} className="bg-[#0f0f1a] p-8 rounded-xl border border-white/5 border-l-[#f59e0b]">
              <Package className="text-[#f59e0b] w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Non-Delivery</h3>
              <p className="text-[#94a3b8] text-sm">Buyers pay and get ghosted. No protection on direct UPI.</p>
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.3 }} style={{ borderLeft: "4px solid #6366f1" }} className="bg-[#0f0f1a] p-8 rounded-xl border border-white/5 border-l-[#6366f1]">
              <ShieldQuestion className="text-[#6366f1] w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Protection</h3>
              <p className="text-[#94a3b8] text-sm">Banks won&apos;t help you reverse a scam transaction.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-24 relative z-10 bg-[#0f0f1a]/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-20">
            <h2 className="text-3xl font-bold mb-4">How SafeDeal Works</h2>
            <p className="text-[#94a3b8]">Three simple steps.</p>
          </motion.div>
          
          <div className="relative grid md:grid-cols-3 gap-12 text-center">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[24px] left-[15%] right-[15%] pointer-events-none" style={{ borderTop: "2px dashed rgba(99,102,241,0.3)", zIndex: 0 }} />

            {steps.map((step, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="relative z-10 flex flex-col items-center">
                <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", width: 48, height: 48, borderRadius: "50%", color: "white", fontWeight: 800, fontSize: 20 }} className="flex items-center justify-center shadow-lg mb-6 ring-4 ring-[#030712]">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-[#94a3b8] text-sm max-w-xs">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-[#94a3b8]">Powerful features out of the box.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.05 }}
                className="group cursor-default transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: "20px",
                  padding: "28px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 20px 60px rgba(99,102,241,0.2)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
                }}
              >
                <feature.icon className={`w-8 h-8 mb-6 ${feature.color}`} />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRUST BADGES */}
      <section className="py-24 relative z-10 bg-[#0f0f1a]/50">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes verifiedPulse {
            0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4) }
            70% { box-shadow: 0 0 0 20px rgba(245,158,11,0) }
            100% { box-shadow: 0 0 0 0 rgba(245,158,11,0) }
          }
          .animate-verified-pulse {
            animation: verifiedPulse 2s infinite;
          }
        `}} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl font-bold mb-6">Build Trust, Sell More</h2>
              <p className="text-[#94a3b8] mb-8">Earn trust badges as you complete deals. Buyers pay 40% faster to verified merchants.</p>
              <div className="grid gap-4">
                {badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className={`p-2 rounded-lg bg-slate-900 ${b.glow}`}><BadgeCheck className={`w-6 h-6 ${b.color}`} /></div>
                    <div>
                      <div className="font-bold">{b.level} Badge</div>
                      <div className="text-xs text-[#94a3b8]">{b.minDeals}+ Deals</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeIn} className="flex justify-center">
              <div className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] animate-verified-pulse">
                <div className="bg-[#030712] rounded-[31px] p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#f59e0b]/5 blur-3xl rounded-full" />
                  <BadgeCheck className="w-24 h-24 text-[#f59e0b] mx-auto mb-6 relative z-10" />
                  <h3 className="text-2xl font-bold text-[#f59e0b] uppercase tracking-widest mb-2 relative z-10">Verified</h3>
                  <p className="text-xs text-[#94a3b8] relative z-10">PREMIUM SELLER</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. STATS BAR */}
      <section style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)", padding: "48px" }} className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: "$1.2M+", l: "Secured" },
            { v: "0.01s", l: "Wait Time" },
            { v: "100%", l: "Safety" },
            { v: "5,400+", l: "Merchants" }
          ].map((s, i) => (
            <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}>
              <div className="text-3xl md:text-5xl font-black text-white mb-2">{s.v}</div>
              <div className="text-white/80 font-medium uppercase tracking-wider text-sm">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
