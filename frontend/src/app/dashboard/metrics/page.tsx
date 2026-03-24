"use client";

import { Users, CreditCard, DollarSign, Activity, Wallet } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import ErrorBoundary from "@/components/ErrorBoundary";

// Dummy Data
const dauData = [
  ...Array.from({ length: 30 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    users: Math.floor(10 + Math.random() * 24),
  }))
];

const txVolumeData = [
  ...Array.from({ length: 14 }).map((_, i) => ({
    date: `Mar ${i + 1}`,
    volume: Math.floor(50 + Math.random() * 200),
  }))
];

const statusData = [
  { name: 'Completed', value: 85, color: '#10b981' },
  { name: 'Active', value: 30, color: '#3b82f6' },
  { name: 'Disputed', value: 8, color: '#f59e0b' },
  { name: 'Refunded', value: 4, color: '#ef4444' }
];

const topMerchantsData = [
  { name: 'GBX4...7R9', volume: 1450 },
  { name: 'GDOQ...3T2', volume: 980 },
  { name: 'GBTW...9OP', volume: 640 },
  { name: 'GAL2...X45', volume: 420 },
  { name: 'GCD9...71Z', volume: 290 },
];

export default function MetricsDashboard() {
  return (
    <ErrorBoundary>
      <div className="flex-1 min-w-0 bg-[#0f0f1a] min-h-screen text-slate-200 p-8 font-sans">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-white">Platform Metrics</h1>
          <p className="text-[#94a3b8] mt-1 text-sm font-bold">Analytics for SafeDeal Protocol (Testnet)</p>
        </header>

        {/* Row 1 - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Daily Active Users", value: "34", icon: Users, color: "#a855f7" },
            { label: "Total Transactions", value: "127", icon: CreditCard, color: "#3b82f6" },
            { label: "Total Volume", value: "$1,247", icon: DollarSign, color: "#10b981" },
            { label: "Avg Deal Size", value: "$9.82", icon: Activity, color: "#f59e0b" },
          ].map((metric, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start">
                <p className="text-xs uppercase tracking-widest text-[#94a3b8] font-bold">{metric.label}</p>
                <metric.icon className="w-5 h-5 opacity-50" style={{ color: metric.color }} />
              </div>
              <p className="text-3xl font-black text-white mt-4">{metric.value}</p>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-20" style={{ background: metric.color }} />
            </div>
          ))}
        </div>

        {/* Row 2 - Main Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* DAU Chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-6">30-Day Active Users (DAU)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dauData} margin={{ left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#030712", border: "1px solid #1e293b", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="users" stroke="#a855f7" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume Chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-6">Daily Transaction Volume (USDC)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txVolumeData} margin={{ left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`}/>
                  <Tooltip contentStyle={{ background: "#030712", border: "1px solid #1e293b", borderRadius: "8px" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                  <Bar dataKey="volume" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3 - User Metrics */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Retention */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-bold text-white mb-6 w-full text-left">User Retention (D7)</h3>
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="351.8" strokeDashoffset={351.8 * (1 - 0.67)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <span className="text-3xl font-black text-white">67%</span>
            </div>
            <p className="text-xs text-[#94a3b8] font-bold">Of users create &gt;1 deal per week</p>
          </div>

          {/* Wallets Table */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold text-white mb-6">Active Connected Wallets</h3>
            <div className="flex-1 overflow-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-[#94a3b8]">
                    <th className="pb-3 font-bold">Wallet</th>
                    <th className="pb-3 font-bold">Deals</th>
                    <th className="pb-3 font-bold">Volume</th>
                    <th className="pb-3 font-bold">Last Active</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { w: "GA2R...9XQ1", d: 12, v: "$840", a: "2 mins ago" },
                    { w: "GBX4...7R90", d: 8, v: "$1,450", a: "15 mins ago" },
                    { w: "GDOQ...3T2Z", d: 15, v: "$980", a: "1 hour ago" },
                    { w: "GBTW...9OPM", d: 4, v: "$640", a: "2 hours ago" },
                    { w: "GAL2...X45K", d: 2, v: "$420", a: "5 hours ago" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 text-white font-mono">{row.w}</td>
                      <td className="py-3 text-[#94a3b8]">{row.d}</td>
                      <td className="py-3 text-[#10b981] font-bold">{row.v}</td>
                      <td className="py-3 text-[#94a3b8] text-xs">{row.a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Row 4 - Deal Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-6">Deal Status Breakdown</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#030712", border: "1px solid #1e293b", borderRadius: "8px" }} itemStyle={{ color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-[#94a3b8]">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-6">Top Merchants by Volume</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMerchantsData} layout="vertical" margin={{ left: 0, bottom: 0, right: 20 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} width={80} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "#030712", border: "1px solid #1e293b", borderRadius: "8px" }} />
                  <Bar dataKey="volume" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}
