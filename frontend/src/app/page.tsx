"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Star,
  Shield,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { GradientButton } from "@/components/ui/gradient-button";
import { SparklesCore } from "@/components/ui/sparkles";
import { Hero } from "@/components/ui/animated-shader-hero";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "AI Fraud Shield",
    description: "Real-time scanning of wallet history to block known scammers before they pay.",
    icon: ShieldCheck,
  },
  {
    title: "Smart Escrow",
    description: "Funds are mathematically secured on Stellar until the physical item is delivered.",
    icon: Lock,
  },
  {
    title: "Seller Reputation",
    description: "Verified badges based on successful deal history and delivery speed.",
    icon: BadgeCheck,
  },
  {
    title: "Automatic Refunds",
    description: "If the seller doesn't ship within the countdown, funds return to you instantly.",
    icon: HandCoins,
  },
  {
    title: "Low 1% Fee",
    description: "Zero upfront costs. Professional escrow protection for the price of a coffee.",
    icon: Zap,
  },
  {
    title: "Dispute Support",
    description: "Our compliance team reviews evidence if something goes wrong with delivery.",
    icon: ThumbsUp,
  },
];

const steps = [
  {
    num: "01",
    title: "Seller Creates Deal",
    description: "Set item details and amount. Generate a secure payment link in 30 seconds.",
    icon: Smartphone,
  },
  {
    num: "02",
    title: "Buyer Locks Payment",
    description: "Buyer pays via any Stellar wallet. Funds are held securely in a vault.",
    icon: Lock,
  },
  {
    num: "03",
    title: "Ship & Get Paid",
    description: "Seller ships confidently. Once delivery is confirmed, funds release instantly.",
    icon: CheckCircle2,
  },
];

const badges = [
  { level: "New", minDeals: 0, color: "text-slate-400", bg: "bg-slate-50" },
  { level: "Rising", minDeals: 10, color: "text-blue-500", bg: "bg-blue-50" },
  { level: "Trusted", minDeals: 50, color: "text-orange-500", bg: "bg-orange-50" },
  { level: "Verified", minDeals: 200, color: "text-emerald-500", bg: "bg-emerald-50" },
];

export default function LandingPage() {
  const router = useRouter();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  return (
    <div className="bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans italic-none">

      {/* ── 1. HERO SECTION ── */}
      <Hero
        trustBadge={{
          text: "Stellar Testnet Node: Online",
          icons: ["📡"]
        }}
        headline={{
          line1: "Every Deal,",
          line2: "Guaranteed Safe"
        }}
        subtitle="The trusted middleman for WhatsApp and Instagram commerce. Stop losing money to fake screenshots and non-delivery."
        buttons={{
          primary: {
            text: "Get Started",
            onClick: () => router.push('/dashboard')
          },
          secondary: {
            text: "How it Works",
            onClick: () => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }}
      >
        {/* Animated Card Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: 2 }}
          transition={{ duration: 1.2 }}
          className="relative hidden lg:block"
        >
          <div className="rounded-[2.5rem] bg-white/10 backdrop-blur-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Escrow Transaction ID #4822</div>
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount Secured</p>
                  <p className="text-xl font-black text-white italic-none">12,400 USDC</p>
                </div>
                <Lock className="size-6 text-emerald-500" />
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Buyer Risk Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[12%] bg-emerald-500" />
                  </div>
                  <span className="text-xs font-black text-emerald-400 italic-none">12% — Safe</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="size-10 rounded-full bg-slate-800 border-2 border-[#1e1e1e]" />
                ))}
              </div>
              <p className="text-[10px] font-black text-slate-400 italic-none">JOINING 400+ MERCHANTS</p>
            </div>
          </div>
        </motion.div>
      </Hero>

      {/* ── 2. PROBLEM SECTION ── */}
      <section id="buyers" className="py-24 lg:py-32 bg-[#0f172a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-black mb-6 italic-none">The Social Commerce Trap</h2>
            <p className="text-slate-400 font-bold text-lg leading-relaxed italic-none">
              Buying and selling on WhatsApp should be easy, but trust is broken by bad actors.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldQuestion, title: "Fake Screenshots", desc: "Scammers use apps to fake payment proofs, tricking sellers into shipping for free." },
              { icon: Package, title: "Non-Delivery", desc: "Buyers pay upfront and never hear from the seller again. No way to get money back." },
              { icon: AlertTriangle, title: "No Bank Help", desc: "Banks and UPI apps don't offer protection for peer-to-peer commerce. Your loss is final." }
            ].map((p, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
              >
                <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                  <p.icon className="size-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 italic-none">{p.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed italic-none">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 lg:py-40 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 italic-none">3 Steps to Peace of Mind</h2>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs italic-none">Simple. Secure. Irreversible.</p>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-3 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-[100px] left-[300px] right-[300px] h-0.5 border-t-2 border-dashed border-slate-100" />

            {steps.map((s, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="text-center relative z-10"
              >
                <div className="size-20 rounded-[2rem] bg-slate-900 mx-auto mb-8 flex items-center justify-center text-white shadow-2xl shadow-slate-900/10 ring-8 ring-slate-50 transition-transform hover:scale-110 duration-500">
                  <s.icon className="size-8" />
                </div>
                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2 italic-none">{s.num}</div>
                <h3 className="text-xl font-black text-slate-900 mb-4 italic-none">{s.title}</h3>
                <p className="text-slate-500 font-bold leading-relaxed max-w-xs mx-auto italic-none">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURES GRID ── */}
      <section id="merchants" className="py-24 lg:py-32 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div {...fadeIn} className="max-w-3xl mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 italic-none">Built for High Volume Commerce</h2>
            <p className="text-lg text-slate-600 font-semibold italic-none">SafeDeal is engineered to scale with your business, whether you sell one ring a week or 500 orders a day.</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.article
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.05 }}
                className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm transition-all hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 group"
              >
                <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="size-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 italic-none">{f.title}</h3>
                <p className="text-slate-500 font-bold leading-relaxed italic-none">{f.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. TRUST BADGE PROGRESSION ── */}
      <section className="py-24 lg:py-40 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-8 leading-tight italic-none">A Reputation That<br />Actually Pays Off</h2>
              <p className="text-lg text-slate-600 font-bold leading-relaxed mb-10 italic-none">
                As you complete successful deals, you earn trust badges that show up on your public storefront. High-trust sellers convert 4x more customers on Instagram.
              </p>
              <div className="space-y-4 italic-none">
                {badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 transition-all hover:bg-white hover:border-slate-200">
                    <div className={cn("flex size-10 items-center justify-center rounded-xl bg-white shadow-sm italic-none", b.color)}>
                      <BadgeCheck className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 italic-none">{b.level} Badge</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic-none">{b.minDeals}+ Successful Deals</p>
                    </div>
                    <div className="ml-auto">
                      {i < 3 ? <div className="text-[8px] font-black uppercase text-slate-400">Locked</div> : <div className="text-[8px] font-black uppercase text-emerald-600">Premium</div>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeIn} className="relative">
              <div className="aspect-square rounded-[3rem] bg-emerald-600 p-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] overflow-hidden shadow-2xl shadow-emerald-500/20">
                <div className="h-full w-full rounded-[2.8rem] bg-[#0f172a] p-12 flex flex-col items-center justify-center text-center">
                  <BadgeCheck className="size-32 text-emerald-500 mb-8 animate-pulse" />
                  <h3 className="text-3xl font-black text-white mb-4 italic-none">VERIFIED MERCHANT</h3>
                  <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs mb-8 italic-none">Level 4 Trust Shield</p>
                  <div className="w-full h-1 bg-white/10 rounded-full mb-4">
                    <div className="h-full w-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                  </div>
                  <p className="text-slate-500 text-[10px] font-black italic-none">TOP 1% OF SAFE DEALERS NATIONWIDE</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 6. REAL STORY ── */}
      <section className="bg-slate-900 py-32 lg:py-48 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
        <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">
          <motion.div {...fadeIn} className="flex flex-col lg:flex-row items-center gap-16">
            <div className="size-56 lg:size-80 rounded-[3rem] overflow-hidden rotate-3 shrink-0 ring-[12px] ring-white/5 shadow-2xl relative">
              <Image
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop"
                alt="Priya"
                fill
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Priya from Nashik</p>
              </div>
            </div>
            <div>
              <div className="flex gap-1 text-amber-500 mb-8">
                {[...Array(5)].map((_, i) => <Star key={i} className="size-6 fill-current" />)}
              </div>
              <h2 className="text-3xl lg:text-4xl font-black leading-tight italic-none mb-8">
                &quot;I used to hold my breath every time I shipped an order. Now, if the money isn&apos;t on Stellar, I don&apos;t ship. It&apos;s that simple.&quot;
              </h2>
              <p className="text-xl text-slate-400 font-bold mb-8 italic-none">
                Priya sells custom jewelry on Instagram. She nearly shut down her business after a ₹12,000 fraud. SafeDeal gave her the confidence to start selling again.
              </p>
              <div className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Maanas Jewelry Design</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 7. STATS BAR ── */}
      <section id="pricing" className="bg-[#0f172a] py-24 relative overflow-hidden border-y border-white/5">
        <SparklesCore
          id="stats-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={80}
          className="absolute inset-0 w-full h-full"
          particleColor="#10b981"
          speed={0.8}
        />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 italic-none">
          <div className="grid gap-12 grid-cols-2 lg:grid-cols-4">
            {[
              { val: "₹4.8Cr", lbl: "Escrow Volume", sub: "Annualized" },
              { val: "5 Sec", lbl: "Finality", sub: "Stellar Network" },
              { val: "100%", lbl: "Fund Safety", sub: "No Custodial Risk" },
              { val: "2,400+", lbl: "Active Sellers", sub: "Verified Global" }
            ].map((s, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-4xl lg:text-5xl font-black text-white mb-2 italic-none">{s.val}</p>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1 italic-none">{s.lbl}</p>
                <p className="text-[10px] font-black text-slate-500 italic-none">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. CTA SECTION ── */}
      <section className="py-32 lg:py-48 bg-white text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 relative z-10">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tighter italic-none">Ready to reclaim your trust?</h2>
            <p className="text-xl lg:text-2xl text-slate-600 font-bold mb-12 italic-none">Join the next generation of social commerce. One secure deal at a time.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <GradientButton
                className="rounded-[1.5rem] px-12 py-6 text-xl font-black italic-none"
                onClick={() => router.push('/dashboard')}
              >
                Create a Deal
              </GradientButton>
              <GradientButton
                variant="variant"
                className="rounded-[1.5rem] px-12 py-6 text-xl font-black italic-none"
                onClick={() => router.push('/dashboard')}
              >
                Become a Merchant
              </GradientButton>
            </div>
            <p className="mt-12 text-xs font-black text-slate-400 uppercase tracking-widest italic-none flex items-center justify-center gap-2">
              <ShieldCheck className="size-4" /> 256-Bit Blockchain Encryption Standard
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 9. FOOTER ── */}
      <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-4 mb-20 italic-none">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <Shield className="size-6" />
                </div>
                <span className="text-2xl font-black tracking-tighter italic-none text-slate-900">SafeDeal</span>
              </div>
              <p className="text-slate-500 font-bold leading-relaxed italic-none">
                Building the trust layer for emerging market social commerce. Powering the Instagram entrepreneurs of tomorrow.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Platform</h4>
              <ul className="space-y-4">
                {["Create Deal", "How it Works", "Merchant Portal", "Pricing"].map(l => (
                  <li key={l}><a href="#" className="font-bold text-slate-600 hover:text-emerald-600 transition-colors text-sm italic-none">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Resources</h4>
              <ul className="space-y-4">
                {["Stellar Network", "Soroban Guide", "API Docs", "Fraud Database"].map(l => (
                  <li key={l}><a href="#" className="font-bold text-slate-600 hover:text-emerald-600 transition-colors text-sm italic-none">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Contact", "Privacy", "Terms"].map(l => (
                  <li key={l}><a href="#" className="font-bold text-slate-600 hover:text-emerald-600 transition-colors text-sm italic-none">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-slate-200 gap-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic-none">© 2026 SAFEDEAL PROTOCOL • STELLAR TESTNET DEPLOYMENT</p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 italic-none">
                <Globe className="size-3" /> Asia-Pacific / EMEA
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 italic-none">
                <div className="size-1.5 rounded-full bg-current animate-pulse" /> Live Status
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
