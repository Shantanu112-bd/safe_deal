"use client";

import { useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { 
  BookOpen, HelpCircle, Shield, 
  CreditCard, Star, Scale, 
  RefreshCw, Smartphone, Package,
  ChevronDown, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: "introduction", title: "1. Introduction", icon: BookOpen },
  { id: "getting-started", title: "2. Getting started for merchants", icon: CheckCircle2 },
  { id: "creating-deals", title: "3. Creating deals", icon: CreditCard },
  { id: "managing-deals", title: "4. Managing your deals", icon: Package },
  { id: "for-buyers", title: "5. For buyers", icon: Smartphone },
  { id: "trust-badges", title: "6. Trust badges explained", icon: Star },
  { id: "disputes", title: "7. Dispute resolution", icon: Scale },
  { id: "fiat", title: "8. Fiat withdrawal", icon: RefreshCw },
  { id: "security", title: "9. Security and privacy", icon: Shield },
  { id: "faq", title: "10. FAQ", icon: HelpCircle },
];

function Section({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24 mb-16">
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
        {title}
      </h2>
      <div className="text-slate-400 leading-relaxed text-sm sm:text-base selection:bg-indigo-500/30">
        {children}
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0a0f] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
        {/* HEADER SECTION */}
        <div className="relative border-b border-white/5 bg-[#0f0f1a]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Shield className="size-5" />
              </div>
              <span className="text-lg font-black text-white tracking-tight italic-none group-hover:translate-x-0.5 transition-transform">SafeDeal Docs</span>
            </Link>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              <ChevronDown className={cn("w-5 h-5 transition-transform", isMobileMenuOpen && "rotate-180")} />
            </button>

            <div className="hidden lg:flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Go to Dashboard</Link>
              <div className="h-4 w-px bg-white/10"></div>
              <Link href="/deal/demo" className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-colors">LIVE DEMO</Link>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden border-t border-white/5 bg-[#0f0f1a] overflow-hidden"
              >
                <div className="p-4 grid grid-cols-2 gap-2">
                  {sections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        scrollTo(s.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl text-left text-xs transition-all",
                        activeSection === s.id ? "bg-indigo-500 text-white font-black" : "bg-white/5 text-slate-400"
                      )}
                    >
                      <s.icon className="w-4 h-4" />
                      {s.title.split('. ')[1]}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* DESKTOP SIDEBAR NAV */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 space-y-1">
                {sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                      activeSection === s.id 
                        ? "bg-gradient-to-r from-indigo-500/20 to-transparent border-l-4 border-indigo-500 text-white font-black" 
                        : "text-slate-500 hover:text-slate-200 hover:bg-white/5 border-l-4 border-transparent"
                    )}
                  >
                    <s.icon className={cn("w-4 h-4 transition-colors", activeSection === s.id ? "text-indigo-400" : "group-hover:text-indigo-400")} />
                    <span className="text-sm">{s.title}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* DOCUMENTATION CONTENT */}
            <main className="flex-1 max-w-3xl">
              
            <Section id="introduction" title="1. Introduction">
              <div className="space-y-4">
                <p className="text-lg text-white font-medium">SafeDeal is the world&apos;s first AI-protected decentralized escrow platform designed specifically for WhatsApp, Telegram, and Instagram merchants.</p>
                <p>We believe every online deal should be guaranteed safe. No more &quot;payment first&quot; anxiety for buyers, and no more payment chargeback fraud for sellers.</p>
                
                <div className="grid sm:grid-cols-3 gap-4 mt-8">
                  {[
                    { title: "Connect", desc: "Link your Stellar wallet in 2 taps." },
                    { title: "Create", desc: "Generate a secure payment link." },
                    { title: "Close", desc: "Funds release only on delivery." }
                  ].map((step, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                      <p className="text-indigo-400 font-black mb-1">STEP {i+1}</p>
                      <p className="text-white font-bold text-sm mb-1">{step.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section id="getting-started" title="2. Getting started for merchants">
              <div className="bg-[#0f0f1a] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-8">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 font-black text-sm">1</div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Install Freighter Wallet</h3>
                    <p className="text-sm">Download the Freighter extension. This is your vault. It keeps your USDC and identity safe. <strong>Never</strong> share your recovery phrase with anyone.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 font-black text-sm">2</div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Get Testnet USDC</h3>
                    <p className="text-sm">Access the Stellar Laboratory or built-in faucet to fund your test wallet. In the real world, you can bridge funds from any bank account.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 font-black text-sm">3</div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Complete your Profile</h3>
                    <p className="text-sm">Head to the <Link href="/dashboard/profile" className="text-indigo-400 hover:underline">Profile</Link> tab. Enter your business name and contact details so SafeDeal AI can verify your merchant status.</p>
                  </div>
                </div>
              </div>
            </Section>

            <Section id="creating-deals" title="3. Creating deals">
              <p className="mb-6">Deals are single-use payment links. They are mathematically locked to you and your buyer.</p>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-white font-bold text-sm mb-2">WhatsApp Message Template</p>
                  <pre className="text-xs bg-black/40 p-4 rounded-xl text-indigo-300 overflow-x-auto">
                    {`Hey! Let's use SafeDeal for this. 
Your funds stay in escrow until you verify delivery.

Deal ID: #SD-901
Link: https://safedeal.app/deal/901`}
                  </pre>
                </div>
                <ul className="grid sm:grid-cols-2 gap-3 text-xs">
                  <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Set clear expiry times (e.g., 48h)</li>
                  <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Always include item description</li>
                  <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Set amount in USDC</li>
                  <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Share via WhatsApp or DM</li>
                </ul>
              </div>
            </Section>

            <Section id="managing-deals" title="4. Managing your deals">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-white font-bold text-lg mb-2">Understanding deal statuses</h3>
                    <ul className="space-y-2 text-sm">
                       <li><span className="inline-block w-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Pending</span> — You created the link, but the buyer hasn&apos;t paid.</li>
                       <li><span className="inline-block w-20 text-emerald-400 font-bold uppercase tracking-widest text-xs">Locked</span> — The buyer has secured funds on-chain. Safe to ship!</li>
                       <li><span className="inline-block w-20 text-cyan-400 font-bold uppercase tracking-widest text-xs">Released</span> — The buyer received the item and funds are in your wallet.</li>
                       <li><span className="inline-block w-20 text-red-400 font-bold uppercase tracking-widest text-xs">Disputed</span> — The buyer opened a ticket. Wait for arbitration.</li>
                    </ul>
                 </div>
                 <div>
                  <h3 className="text-white font-bold text-lg">What to do when payment is locked</h3>
                  <p>Once the status marks as <strong>Locked</strong>, it means the buyer&apos;s USDC is officially trapped in the Smart Contract. You are now 100% safe to ship the item.</p>
                </div>
              </div>
            </Section>

            <Section id="for-buyers" title="5. For buyers">
              <div className="space-y-6">
                 <div>
                  <h3 className="text-white font-bold text-lg">How to open a payment link</h3>
                  <p>When a seller sends you a URL, tapping it brings up a mobile-optimized checkout highlighting exactly what you are paying for.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Understanding the seller trust card</h3>
                  <p>Before you pay, look at the Seller Trust Badge. SafeDeal AI aggregates their transaction history. A green checkmark ensures they are an established merchant, a red warning advises you to proceed carefully. </p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">How to lock payment</h3>
                  <p>Connect your wallet, verify the deal terms, and tap &quot;Pay Securely&quot;. Your funds will leave your wallet but <strong>will not</strong> enter the seller&apos;s wallet until delivery.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">How to confirm delivery</h3>
                  <p>Once you unpack the item and verify it&apos;s accurate, simply click &quot;I Received My Item&quot;. The funds mathematically unlock and forward precisely to the seller.</p>
                </div>
              </div>
            </Section>

            <Section id="trust-badges" title="6. Trust badges explained">
               <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: "New Seller", desc: "Just starting out. < 10 deals.", color: "text-slate-400 border-slate-400/20" },
                    { title: "Rising", desc: "10+ successful deliveries.", color: "text-blue-400 border-blue-400/20" },
                    { title: "Trusted", desc: "50+ successful deliveries.", color: "text-emerald-400 border-emerald-400/20" },
                    { title: "Verified", desc: "KYC Verified Merchant.", color: "text-purple-400 border-purple-400/20" },
                    { title: "Flagged", desc: "Unusually high dispute rate.", color: "text-red-400 border-red-400/20" },
                  ].map(b => (
                    <div key={b.title} className={cn("bg-[#0f0f1a] border p-4 rounded-xl", b.color)}>
                      <p className="font-black mb-1 text-sm tracking-wide">{b.title}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest leading-relaxed">{b.desc}</p>
                    </div>
                  ))}
               </div>
            </Section>

            <Section id="disputes" title="7. Dispute resolution">
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold text-lg">When to open a dispute</h3>
                  <p>Only press the red &quot;Open Dispute&quot; button if the item received was wildly incorrect, damaged, or if the delivery window passed with no tracking provided.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">What evidence to submit</h3>
                  <p>SafeDeal moderators will contact you via your authorized email. Both the Buyer and Seller must submit full chat screenshots, courier tracking IDs, and unboxing videos.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">How auto-resolution works</h3>
                  <p>If neither party presses Dispute and the strict time window runs out entirely, the Smart Contract defaults the funds to the Seller assuming successful delivery.</p>
                </div>
              </div>
            </Section>

            <Section id="fiat" title="8. Fiat withdrawal">
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold text-lg">How to withdraw to INR</h3>
                  <p>SafeDeal natively integrates Stellar Anchors (SEP-24). You can directly access the &quot;Withdraw&quot; module to off-ramp your USDC balance back straight to local currency fiat accounts via UPI or NEFT.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Processing times</h3>
                  <p>Because the network runs natively at lighting speeds, most anchor partners process withdrawals into your bank account within 3 to 15 minutes.</p>
                </div>
              </div>
            </Section>

            <Section id="security" title="9. Security and privacy">
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold text-lg">What SafeDeal can and cannot access</h3>
                  <p>SafeDeal has absolutely zero access to your private key. We only require you to authorize specific payment payloads that you manually approve via your secure wallet adapter.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Fraud detection explained</h3>
                  <p>SafeDeal&apos;s backend <code>fraud-detection</code> Smart Contract analyzes every single connected wallet. If your wallet throws a High Risk Flag (due to wallet age, scam reporting, or anomalous velocity), the platform actively prevents you from finalizing malicious transactions.</p>
                </div>
              </div>
            </Section>

            <Section id="faq" title="10. FAQ">
               <div className="space-y-4">
                  <div className="bg-[#0f0f1a] border border-white/5 p-5 rounded-2xl">
                     <p className="font-bold text-white mb-1">What happens if a buyer ghosts?</p>
                     <p className="text-sm text-slate-400">If a buyer locks payment but never confirms delivery, don&apos;t panic. Wait for the Expiry Timer you set during Deal Creation to end. The contract will trigger an Auto-Refund directly into your wallet.</p>
                  </div>
                  <div className="bg-[#0f0f1a] border border-white/5 p-5 rounded-2xl">
                     <p className="font-bold text-white mb-1">Do buyers need crypto to use it?</p>
                     <p className="text-sm text-slate-400">Not specifically. While the backend runs on USDC, buyers can connect using gasless features. SafeDeal sponsors (bumps) the Stellar network fee taking out 99% of typical friction!</p>
                  </div>
               </div>
            </Section>

            <div className="pt-12 border-t border-white/5 pb-20 flex items-center justify-between text-slate-500 text-sm font-bold">
              <p>End of Guide.</p>
              <button 
                onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                Back to Top
              </button>
            </div>

            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
