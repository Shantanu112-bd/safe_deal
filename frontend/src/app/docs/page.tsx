"use client";

import { useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BookOpen, HelpCircle, Shield, CreditCard, PlayCircle, Star, Scale, Lock, RefreshCw, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const sections = [
  { id: "getting-started", title: "1. Getting Started", icon: PlayCircle },
  { id: "create-deal", title: "2. Creating Your First Deal", icon: CreditCard },
  { id: "sharing-links", title: "3. Sharing Payment Links", icon: Smartphone },
  { id: "buyer-guide", title: "4. For Buyers — How to Pay", icon: HelpCircle },
  { id: "trust-badges", title: "5. Trust Badges", icon: Star },
  { id: "disputes", title: "6. Dispute Resolution", icon: Scale },
  { id: "withdrawals", title: "7. Fiat Withdrawal", icon: RefreshCw },
  { id: "security", title: "8. Security & Privacy", icon: Shield },
  { id: "faq", title: "9. FAQ", icon: HelpCircle },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#030712] font-sans text-slate-200">
        
        {/* Navbar */}
        <header className="sticky top-0 z-40 bg-[#0f0f1a]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center px-6">
          <div className="flex items-center gap-2 mr-8">
            <BookOpen className="text-indigo-500 w-6 h-6" />
            <span className="text-white font-black text-lg">SafeDeal Docs</span>
          </div>
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
            Back to Home
          </Link>
        </header>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start relative">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 p-6 md:sticky top-16 md:h-[calc(100vh-4rem)] overflow-y-auto border-r border-white/5 space-y-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 px-3">User Guide</h3>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all text-left",
                  activeSection === s.id 
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <s.icon className="w-4 h-4" />
                {s.title.split('. ')[1]}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-4xl space-y-16">
            
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Documentation</h1>
              <p className="text-slate-400 text-lg">Everything you need to know to buy and sell securely on SafeDeal.</p>
            </div>

            <Section id="getting-started" title="1. Getting Started for Merchants">
              <p>Welcome to SafeDeal. SafeDeal replaces risky UPI and bank transfers with a secure, trustable escrow link that guarantees you get paid while ensuring your customer's money is safe until delivery.</p>
              <div className="my-6 rounded-2xl bg-white/5 border border-white/10 p-1 flex items-center justify-center aspect-video">
                <span className="text-slate-600 font-bold tracking-widest uppercase text-sm flex items-center gap-2"><PlayCircle /> Explainer Video Placeholder</span>
              </div>
              <h4 className="text-white font-bold mt-6 mb-2">Requirements</h4>
              <ul className="list-disc leading-relaxed text-slate-400 space-y-2 pl-5">
                <li>A Stellar-compatible Web3 wallet (Albedo, Freighter).</li>
                <li>A profile name or brand identity for the storefront.</li>
              </ul>
            </Section>

            <Section id="create-deal" title="2. Creating Your First Deal">
              <p>Creating a deal takes less than 30 seconds.</p>
              <ol className="list-decimal leading-relaxed text-slate-400 space-y-2 pl-5 mb-4">
                <li>Navigate to the <Link href="/dashboard" className="text-indigo-400 hover:underline">Merchant Dashboard</Link>.</li>
                <li>Click the "Create Deal" button in the top right.</li>
                <li>Enter the item description, total amount in USDC, and buyer details (optional).</li>
                <li>Submit to generate your unique Escrow Link.</li>
              </ol>
              <div className="bg-[#0f0f1a] rounded-xl border border-white/10 p-4 font-mono text-sm text-indigo-300">
                <span className="text-slate-500">// Example payload</span><br/>
                {`{
  "title": "Vintage Leather Jacket",
  "amount": 45.00,
  "currency": "USDC",
  "expiry": "48h"
}`}
              </div>
            </Section>

            <Section id="sharing-links" title="3. Sharing Payment Links">
              <p>Once a deal is generated, copy the URL and send it to your customer on WhatsApp or Instagram.</p>
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-200 mt-4 mb-4">
                💡 <b>Pro Tip:</b> Use the auto-generated WhatsApp button in the dashboard to send a professionally formatted message with your link.
              </div>
            </Section>

            <Section id="buyer-guide" title="4. For Buyers — How to Pay">
              <p>Buyers do not need to download a standalone app. The payment link opens a mobile-optimized checkout.</p>
              <ul className="list-disc leading-relaxed text-slate-400 space-y-2 pl-5">
                <li>The buyer connects a wallet or uses a sponsored gasless transaction.</li>
                <li>They approve the payment, locking the USDC in a secure Smart Escrow.</li>
                <li>After confirming receipt of the physical item, the buyer clicks "I Received My Item" to instantly release the funds.</li>
              </ul>
            </Section>

            <Section id="trust-badges" title="5. Trust Badges Explained">
              <p>Sellers earn platform trust through continuous successful deliveries.</p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { title: "New", desc: "< 10 deals", color: "text-slate-400" },
                  { title: "Rising", desc: "10+ deals", color: "text-blue-400" },
                  { title: "Verified", desc: "50+ deals", color: "text-emerald-500" },
                ].map(b => (
                  <div key={b.title} className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                    <p className={cn("font-black mb-1", b.color)}>{b.title}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{b.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="disputes" title="6. Dispute Resolution">
              <p>If an item arrives damaged or is not delivered, buyers can click "Open Dispute".</p>
              <p className="mt-2 text-slate-400">This freezes the funds indefinitely. SafeDeal compliance will contact both parties to request chat logs and tracking IDs before ruling on the payout.</p>
            </Section>

            <Section id="withdrawals" title="7. Fiat Withdrawal Guide">
              <p>SafeDeal natively uses USDC on the Stellar network for fast settlement.</p>
              <ol className="list-decimal leading-relaxed text-slate-400 space-y-2 pl-5">
                <li>Send your accumulated USDC to an exchange like Binance or Coinbase.</li>
                <li>Sell the USDC for your local fiat currency via spot markets or P2P.</li>
                <li>Withdraw to your bank account.</li>
              </ol>
            </Section>

            <Section id="security" title="8. Security & Privacy">
              <p>SafeDeal's smart contracts are deployed on the Soroban network.</p>
              <ul className="list-disc leading-relaxed text-slate-400 space-y-2 pl-5">
                <li>No custodial risk — SafeDeal cannot freeze your wallet or steal your funds.</li>
                <li>End-to-end HTTPS encryption on the frontend.</li>
                <li>AI Fraud detection to protect against historically flagged addresses.</li>
              </ul>
            </Section>

            <Section id="faq" title="9. FAQ">
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-bold">How much does it cost?</h4>
                  <p className="text-slate-400 text-sm mt-1">SafeDeal takes a flat 1% success fee upon payout execution.</p>
                </div>
                <div>
                  <h4 className="text-white font-bold">What is a gasless transaction?</h4>
                  <p className="text-slate-400 text-sm mt-1">Buyers do not need native XLM to pay for transaction fees. SafeDeal wraps and sponsors the network fee allowing 0-balance wallets to checkout.</p>
                </div>
              </div>
            </Section>

            <div className="pt-12 border-t border-white/5 pb-20 text-center">
              <p className="text-slate-500 text-sm font-bold">Still have questions? Reach out to support.</p>
            </div>
            
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

function Section({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
        {title}
      </h2>
      <div className="text-slate-400 leading-relaxed text-base space-y-4 bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem]">
        {children}
      </div>
    </section>
  )
}
