"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Zap,
  BadgeCheck,
  ArrowRight,
  Check,
} from "lucide-react";

/* ─── ANIMATION CONFIG ─── */
const cinBezier = [0.16, 1, 0.3, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: cinBezier },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const letterReveal = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: cinBezier },
  },
};

/* ─── DATA ─── */
const features = [
  {
    title: "AI Fraud Shield",
    desc: "Real-time wallet scanning blocks scammers before they transact.",
    icon: ShieldCheck,
  },
  {
    title: "Smart Escrow",
    desc: "Funds stay locked on Stellar until delivery is confirmed.",
    icon: Lock,
  },
  {
    title: "Instant Settlement",
    desc: "5-second finality. No waiting, no chargebacks.",
    icon: Zap,
  },
  {
    title: "Verified Badges",
    desc: "Build trust with reputation earned from completed deals.",
    icon: BadgeCheck,
  },
];

const caseStudies = [
  {
    title: "WhatsApp Commerce",
    tag: "FRAUD PREVENTION",
    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Instagram Sellers",
    tag: "ESCROW PROTECTION",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "P2P Marketplace",
    tag: "DISPUTE RESOLUTION",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    desc: "For individual sellers getting started",
    features: ["Up to 10 deals/month", "Basic fraud scan", "Email support", "Stellar Testnet"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$29",
    desc: "For growing merchants and brands",
    features: [
      "Unlimited deals",
      "AI fraud shield",
      "Priority support",
      "Custom storefront",
      "Analytics dashboard",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For platforms and high-volume sellers",
    features: [
      "Volume API access",
      "White-label escrow",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
    ],
    highlighted: false,
  },
];

/* ─── PRICE CALCULATOR ─── */
function PriceCalculator() {
  const [deals, setDeals] = useState(50);
  const cost = Math.round(deals * 1.25);

  return (
    <div className="rounded-[2rem] p-8 md:p-12 mt-16" style={{ background: "#1A0B2E" }}>
      <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-6">
        Fee Estimator
      </h4>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 w-full">
          <input
            type="range"
            min="10"
            max="500"
            value={deals}
            onChange={(e) => setDeals(Number(e.target.value))}
            className="cin-slider w-full"
          />
          <div className="flex justify-between mt-3 text-xs text-white/40 font-bold tracking-widest uppercase">
            <span>10 Deals</span>
            <span>500 Deals</span>
          </div>
        </div>
        <div className="text-center md:text-right flex-shrink-0">
          <p className="text-5xl md:text-6xl font-black text-white">${cost}</p>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em] mt-2">
            /month est. for {deals} deals
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════ */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgTextOpacity = useTransform(scrollYProgress, [0, 0.5], [0.04, 0.01]);

  const heroTitle = "SAFEDEAL".split("");

  return (
    <div className="bg-[#050505] text-white overflow-hidden">
      {/* ░░░ 1. HERO ░░░ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        id="hero"
      >
        {/* Massive background text */}
        <motion.div
          style={{ opacity: bgTextOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="text-[30vw] font-black tracking-tighter text-white whitespace-nowrap">
            SECURE
          </span>
        </motion.div>

        {/* 3D Cube */}
        <div className="cube-perspective relative z-10 w-[50vh] h-[50vh] mx-auto">
          <div className="cube-wrapper relative w-full h-full">
            {[
              { face: "front", title: "PROTECT", img: caseStudies[0].img },
              { face: "bottom", title: "VERIFY", img: caseStudies[1].img },
              { face: "back", title: "SETTLE", img: caseStudies[2].img },
              { face: "top", title: "TRUST", img: caseStudies[0].img },
            ].map((f) => (
              <div
                key={f.face}
                className={`cube-face cube-face--${f.face} rounded-2xl overflow-hidden`}
              >
                <Image
                  src={f.img}
                  alt={f.title}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white uppercase">
                    {f.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-12 z-20">
          <div className="max-w-[90rem] mx-auto">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex justify-center mb-8"
            >
              {heroTitle.map((char, i) => (
                <motion.span
                  key={i}
                  variants={letterReveal}
                  className="text-[12vw] font-black leading-[0.85] tracking-tighter uppercase"
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <p className="text-sm md:text-lg font-light text-[#999] max-w-lg">
                The AI-protected escrow platform for social commerce.
                Zero fraud. Instant settlement. Built on Stellar.
              </p>
              <Link
                href="/dashboard"
                className="accent-gradient rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white hover:scale-[1.02] transition-transform duration-200 flex items-center gap-3"
              >
                Launch App
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ░░░ 2. HOW IT WORKS / FEATURES ░░░ */}
      <section className="py-32 px-8" id="how-it-works">
        <div className="max-w-[90rem] mx-auto">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20"
          >
            <h2 className="text-[10vw] font-black tracking-tighter uppercase leading-[0.85]">
              HOW IT
              <br />
              WORKS
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="glass-card rounded-2xl p-8 hover:border-white/20 transition-all duration-200 group"
              >
                <f.icon className="w-8 h-8 text-[#06B6D4] mb-6 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-lg font-bold uppercase tracking-tight mb-3">
                  {f.title}
                </h3>
                <p className="text-sm font-light text-[#999] leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░░ 3. CASE STUDIES ░░░ */}
      <section className="py-32 px-8" id="features">
        <div className="max-w-[90rem] mx-auto">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20"
          >
            <h2 className="text-[10vw] font-black tracking-tighter uppercase leading-[0.85]">
              USE
              <br />
              CASES
            </h2>
          </motion.div>

          {/* Featured case (full-width) */}
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
              {/* macOS traffic lights */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="aspect-video overflow-hidden">
                <Image
                  src={caseStudies[0].img}
                  alt={caseStudies[0].title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4] mb-2">
                  {caseStudies[0].tag}
                </p>
                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
                  {caseStudies[0].title}
                </h3>
              </div>
            </div>
          </motion.div>

          {/* Sub-projects grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caseStudies.slice(1).map((cs, i) => (
              <motion.div
                key={i}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="relative rounded-2xl overflow-hidden border border-white/10 group"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    src={cs.img}
                    alt={cs.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EC4899] mb-2">
                    {cs.tag}
                  </p>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    {cs.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░░ 4. PRICING ░░░ */}
      <section
        className="py-32 px-8 relative"
        id="pricing"
        style={{ background: "#0B0216" }}
      >
        {/* Purple glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full purple-glow pointer-events-none" />

        <div className="max-w-[90rem] mx-auto relative z-10">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-[10vw] font-black tracking-tighter uppercase leading-[0.85] mb-6">
              PRICING
            </h2>
            <p className="text-lg font-light text-[#999] max-w-xl mx-auto">
              Transparent pricing. Only pay when you earn.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className={`rounded-2xl p-8 transition-transform duration-200 ${
                  plan.highlighted
                    ? "bg-white text-[#111] scale-105 shadow-2xl"
                    : "glass-card text-white"
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${
                    plan.highlighted ? "text-[#7C3AED]" : "text-[#06B6D4]"
                  }`}
                >
                  {plan.name}
                </p>
                <p className="text-4xl font-black mb-2">{plan.price}</p>
                <p
                  className={`text-sm font-light mb-8 ${
                    plan.highlighted ? "text-[#666]" : "text-[#999]"
                  }`}
                >
                  {plan.desc}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 ${
                          plan.highlighted ? "text-[#7C3AED]" : "text-[#06B6D4]"
                        }`}
                      />
                      <span className={plan.highlighted ? "text-[#333]" : "text-[#ccc]"}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={`block w-full text-center rounded-xl py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-transform hover:scale-[1.02] duration-200 ${
                    plan.highlighted
                      ? "accent-gradient text-white"
                      : "border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>

          <PriceCalculator />
        </div>
      </section>

      {/* ░░░ 5. STATS BAR ░░░ */}
      <section className="py-20 px-8 border-y border-white/10">
        <div className="max-w-[90rem] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: "$1.2M+", l: "Secured" },
            { v: "0.01s", l: "Settlement" },
            { v: "100%", l: "Safety" },
            { v: "5,400+", l: "Merchants" },
          ].map((s, i) => (
            <motion.div
              key={i}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="text-3xl md:text-5xl font-black accent-gradient-text mb-2">
                {s.v}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#999]">
                {s.l}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ░░░ 6. EDITORIAL FOOTER ░░░ */}
      <footer className="pt-32 pb-12 px-8 bg-[#050505]">
        <div className="max-w-[90rem] mx-auto">
          {/* Giant text */}
          <motion.h2
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-[15vw] font-black tracking-tighter uppercase leading-[0.85] mb-24 accent-gradient-text"
          >
            BUILD
            <br />
            TRUST.
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
            {/* Left — CTA */}
            <div className="lg:col-span-5">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
                Start Securing Deals
              </h3>
              <p className="text-[#999] font-light mb-8 leading-relaxed">
                Join thousands of merchants protecting their business with
                blockchain-powered escrow.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 accent-gradient rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white hover:scale-[1.02] transition-transform duration-200"
              >
                Launch Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right — Links */}
            <div className="lg:col-span-6 lg:col-start-7 grid grid-cols-2 md:grid-cols-3 gap-8 text-[11px] font-bold uppercase tracking-[0.2em]">
              <div className="flex flex-col gap-5">
                <span className="text-[#999] mb-2">Product</span>
                <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors duration-200">
                  Dashboard
                </Link>
                <Link href="/docs" className="text-white/70 hover:text-white transition-colors duration-200">
                  Documentation
                </Link>
                <Link href="/dashboard/deals" className="text-white/70 hover:text-white transition-colors duration-200">
                  Deals
                </Link>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[#999] mb-2">Company</span>
                <Link href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  About
                </Link>
                <Link href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  Blog
                </Link>
                <Link href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[#999] mb-2">Social</span>
                <Link href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  Twitter
                </Link>
                <Link href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  Discord
                </Link>
                <Link href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  GitHub
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/10 pt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <p>&copy; 2026 SafeDeal. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white/60 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-white/60 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
