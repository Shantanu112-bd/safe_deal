"use client";

import { useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { 
  BookOpen, HelpCircle, Shield, 
  CreditCard, Tag, Star, Scale, 
  RefreshCw, Smartphone, Package,
  ChevronDown, CheckCircle2, ChevronRight
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

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#030712] font-sans text-slate-200">
        
        {/* Navbar */}
        <header className="sticky top-0 z-40 bg-[#0f0f1a]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
               <Shield className="text-indigo-500 w-6 h-6" />
            </Link>
            <span className="text-white font-black text-lg hidden sm:block tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">SafeDeal Documentation</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile dropdown trigger */}
            <button 
              className="md:hidden flex items-center gap-2 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 px-4 py-2 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              Menu <ChevronDown className="w-4 h-4" />
            </button>
            <Link href="/" className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white transition-colors">
              Back to App
            </Link>
          </div>
        </header>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden fixed z-30 left-0 right-0 top-16 bg-[#0f0f1a] border-b border-white/10 p-4 max-h-[70vh] overflow-y-auto shadow-2xl"
            >
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left mb-2",
                    activeSection === s.id 
                      ? "bg-indigo-500/20 text-indigo-400" 
                      : "text-slate-400 hover:bg-white/5"
                  )}
                >
                  <s.icon className="w-5 h-5" />
                  {s.title}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto flex items-start relative">
          
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-72 shrink-0 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-white/5 space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 px-3">User Guide</h3>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left",
                  activeSection === s.id 
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <s.icon className="w-4 h-4 shrink-0" />
                {s.title}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-4xl space-y-24 scroll-smooth">
            
            <Section id="introduction" title="1. Introduction">
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold text-lg">What is SafeDeal</h3>
                  <p>SafeDeal is a decentralized escrow platform specifically built for social commerce (WhatsApp, Instagram, Telegram). It acts as a trusted middleman replacing risky UPI and bank transfers with a secure payment link where both buyer and seller are fully protected by Smart Contracts.</p>
                </div>
                <div>
                   <h3 className="text-white font-bold text-lg mb-2">How it works in 3 steps</h3>
                   <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-[#0f0f1a] border border-white/10 p-4 rounded-2xl">
                         <span className="text-indigo-400 font-black text-xl mb-1 block">1</span>
                         <p className="font-bold text-white text-sm">Merchant Creates Link</p>
                         <p className="text-xs text-slate-400 mt-1">Sellers generate a secure USDC payment link and send it via WhatsApp.</p>
                      </div>
                      <div className="bg-[#0f0f1a] border border-white/10 p-4 rounded-2xl">
                         <span className="text-emerald-400 font-black text-xl mb-1 block">2</span>
                         <p className="font-bold text-white text-sm">Buyer Pays Securely</p>
                         <p className="text-xs text-slate-400 mt-1">Funds are instantly locked on-chain safely away from either party.</p>
                      </div>
                      <div className="bg-[#0f0f1a] border border-white/10 p-4 rounded-2xl">
                         <span className="text-[#06b6d4] font-black text-xl mb-1 block">3</span>
                         <p className="font-bold text-white text-sm">Item Delivered</p>
                         <p className="text-xs text-slate-400 mt-1">Buyer confirms receipt, or time runs out, releasing funds to the seller.</p>
                      </div>
                   </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Who it is for</h3>
                  <p>It is perfect for independent sellers, thrift stores, and social media boutiques who want to offer professional buyer protection without paying 5-10% marketplace fees.</p>
                </div>
              </div>
            </Section>

            <Section id="getting-started" title="2. Getting started for merchants">
              <div className="space-y-6">
                <ol className="list-decimal leading-relaxed text-slate-400 space-y-4 pl-5 marker:text-indigo-400 marker:font-black">
                  <li>
                    <strong className="text-white">Step 1: Install Freighter wallet</strong>
                    <p className="mt-1 text-sm">Download the Freighter browser extension from the Chrome Web Store. Create a new wallet and save your 12-word seed phrase securely.</p>
                  </li>
                  <li>
                    <strong className="text-white">Step 2: Get testnet USDC</strong>
                    <p className="mt-1 text-sm">Since SafeDeal runs natively on Stellar, you need Testnet Lumens (XLM) and USDC to pay network fees. You can fund your wallet via the Stellar Laboratory.</p>
                  </li>
                  <li>
                    <strong className="text-white">Step 3: Connect wallet to SafeDeal</strong>
                    <p className="mt-1 text-sm">Click <span className="text-indigo-400">"Get Started"</span> in the navbar and approve the connection in Freighter.</p>
                  </li>
                  <li>
                    <strong className="text-white">Step 4: Complete your profile</strong>
                    <p className="mt-1 text-sm">Update your public alias and view your starting Trust Badge in your Profile Dashboard.</p>
                  </li>
                  <li>
                    <strong className="text-white">Step 5: Create your first deal</strong>
                    <p className="mt-1 text-sm">You are now ready to hit "Create Deal" located at the top right of the dashboard map!</p>
                  </li>
                </ol>
              </div>
            </Section>

            <Section id="creating-deals" title="3. Creating deals">
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold text-lg">How to fill the deal form</h3>
                  <p>Open the Deal Modal. Enter an accurate item name and detailed description because this is what your buyer will see when they click your link.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Setting the right amount</h3>
                  <p>Transactions are strictly handled in USDC. The form will show you an approximate INR conversion rate (≈ ₹83.50). Always confirm the USDC amount matches the exact final price including shipping.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Choosing expiry time</h3>
                  <p>We provide 24h, 3d, 7d, and 14d presets. Set yours according to how fast you intend to ship. If the time expires without anyone clicking 'Dispute', the funds automatically release to you.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">WhatsApp message template</h3>
                  <div className="bg-[#0f0f1a] rounded-xl border border-white/10 p-4 font-mono text-sm text-indigo-300 mt-3 whitespace-pre-wrap">
                    {`Hi! I've created a SafeDeal payment link for your order. Your payment will be secured in escrow until you confirm delivery. Pay here: https://safe-deal-ten.vercel.app/deal/...`}
                  </div>
                </div>
              </div>
            </Section>

            <Section id="managing-deals" title="4. Managing your deals">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-white font-bold text-lg mb-2">Understanding deal statuses</h3>
                    <ul className="space-y-2 text-sm">
                       <li><span className="inline-block w-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Pending</span> — You created the link, but the buyer hasn't paid.</li>
                       <li><span className="inline-block w-20 text-emerald-400 font-bold uppercase tracking-widest text-xs">Locked</span> — The buyer has secured funds on-chain. Safe to ship!</li>
                       <li><span className="inline-block w-20 text-cyan-400 font-bold uppercase tracking-widest text-xs">Released</span> — The buyer received the item and funds are in your wallet.</li>
                       <li><span className="inline-block w-20 text-red-400 font-bold uppercase tracking-widest text-xs">Disputed</span> — The buyer opened a ticket. Wait for arbitration.</li>
                    </ul>
                 </div>
                 <div>
                  <h3 className="text-white font-bold text-lg">What to do when payment is locked</h3>
                  <p>Once the status marks as <strong>Locked</strong>, it means the buyer's USDC is officially trapped in the Smart Contract. You are now 100% safe to ship the item.</p>
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
                  <p>Connect your wallet, verify the deal terms, and tap "Pay Securely". Your funds will leave your wallet but <strong>will not</strong> enter the seller's wallet until delivery.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">How to confirm delivery</h3>
                  <p>Once you unpack the item and verify it's accurate, simply click "I Received My Item". The funds mathematically unlock and forward precisely to the seller.</p>
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
                  <p>Only press the red "Open Dispute" button if the item received was wildly incorrect, damaged, or if the delivery window passed with no tracking provided.</p>
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
                  <p>SafeDeal natively integrates Stellar Anchors (SEP-24). You can directly access the "Withdraw" module to off-ramp your USDC balance back straight to local currency fiat accounts via UPI or NEFT.</p>
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
                  <p>SafeDeal's backend <code>fraud-detection</code> Smart Contract analyzes every single connected wallet. If your wallet throws a High Risk Flag (due to wallet age, scam reporting, or anomalous velocity), the platform actively prevents you from finalizing malicious transactions.</p>
                </div>
              </div>
            </Section>

            <Section id="faq" title="10. FAQ">
               <div className="space-y-4">
                  <div className="bg-[#0f0f1a] border border-white/5 p-5 rounded-2xl">
                     <p className="font-bold text-white mb-1">What happens if a buyer ghosts?</p>
                     <p className="text-sm text-slate-400">If a buyer locks payment but never confirms delivery, don't panic. Wait for the Expiry Timer you set during Deal Creation to end. The contract will trigger an Auto-Refund directly into your wallet.</p>
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
    </ErrorBoundary>
  );
}

function Section({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-black text-white mb-8 pb-4 border-b border-white/5">
        {title}
      </h2>
      <div className="text-slate-400 leading-relaxed text-base">
        {children}
      </div>
    </section>
  )
}
