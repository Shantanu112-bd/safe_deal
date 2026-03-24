"use client";

import { CheckCircle2, Download, ShieldCheck, Lock, Server, Users } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

const checklist = [
  {
    category: "Smart Contract Security",
    icon: Lock,
    items: [
      { desc: "Reentrancy protection implemented", proof: "contracts/safe-deal/src/lib.rs#L42" },
      { desc: "Integer overflow checks in place", proof: "Cargo.toml overflow-checks=true" },
      { desc: "Access control on admin functions", proof: "contracts/safe-deal/src/admin.rs" },
      { desc: "Event emissions for all state changes", proof: "contracts/safe-deal/src/events.rs" },
      { desc: "Contract initialization protection", proof: "contracts/safe-deal/src/lib.rs#L18" },
      { desc: "Token transfer validation", proof: "contracts/safe-deal/src/transfer.rs" },
      { desc: "Escrow expiry mechanism working", proof: "contracts/safe-deal/src/time.rs" },
      { desc: "Emergency pause function available", proof: "contracts/safe-deal/src/admin.rs#L89" },
    ]
  },
  {
    category: "Frontend Security",
    icon: ShieldCheck,
    items: [
      { desc: "No private keys stored in browser", proof: "src/context/WalletContext.tsx" },
      { desc: "All API calls use HTTPS", proof: "next.config.mjs" },
      { desc: "Environment variables not exposed", proof: ".env.production" },
      { desc: "XSS protection in place", proof: "React default DOM escaping" },
      { desc: "Content Security Policy configured", proof: "middleware.ts" },
      { desc: "Wallet connection permission scoped", proof: "src/lib/stellar.ts" },
    ]
  },
  {
    category: "Operational Security",
    icon: Server,
    items: [
      { desc: "GitHub secrets properly configured", proof: ".github/workflows/deploy.yml" },
      { desc: "Contract IDs in environment variables", proof: "vercel.json" },
      { desc: "No hardcoded credentials in code", proof: "src/lib/constants.ts" },
      { desc: "CI/CD pipeline secured", proof: ".github/workflows/test.yml" },
      { desc: "Vercel deployment protected", proof: "Vercel Dashboard Settings" },
    ]
  },
  {
    category: "User Security",
    icon: Users,
    items: [
      { desc: "Wallet address validation", proof: "src/lib/stellar.ts#validateAddress" },
      { desc: "Transaction amount validation", proof: "src/components/deal/CreateDealModal.tsx" },
      { desc: "Fraud detection on buyer wallets", proof: "src/context/WalletContext.tsx#fraudCheck" },
      { desc: "Dispute resolution mechanism", proof: "contracts/safe-deal/src/dispute.rs" },
      { desc: "Auto-refund on expiry", proof: "contracts/safe-deal/src/refund.rs" },
    ]
  }
];

export default function SecurityChecklistPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <ErrorBoundary>
      <div className="flex-1 min-w-0 bg-[#0f0f1a] min-h-screen text-slate-200 p-8 font-sans pb-24 lg:pb-8 selection:bg-[#10b981]/30 text-sm">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <ShieldCheck className="text-[#10b981] w-8 h-8" /> Security Audit
            </h1>
            <p className="text-[#94a3b8] mt-2 font-bold max-w-xl">
              Comprehensive security checklist for SafeDeal protocol. Validating smart contract safety, frontend protections, and operational security.
            </p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Download Report PDF
          </button>
        </header>

        <div className="grid gap-8 max-w-5xl">
          {checklist.map((section, idx) => (
            <section key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <section.icon className="w-6 h-6 text-[#06b6d4]" />
                <h2 className="text-xl font-black text-white">{section.category}</h2>
                <div className="ml-auto px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" /> Passed
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-bold mb-1">{item.desc}</p>
                      <p className="text-xs text-[#94a3b8] font-mono mt-1 pt-1 border-t border-white/5 inline-block">
                        Proof: {item.proof}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

      </div>
    </ErrorBoundary>
  );
}
