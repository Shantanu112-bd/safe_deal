"use client"
import { useEffect, useState } from 'react'
import { monitor } from '@/lib/monitoring'
import { getAccountTransactions } from '@/lib/indexer'
import { 
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts'
import { 
  Users, TrendingUp, DollarSign, 
  Activity, ArrowUp 
} from 'lucide-react'

export default function MetricsPage() {
  const [dau, setDau] = useState(0)
  const [totalTx, setTotalTx] = useState(0)
  const [totalVolume, setTotalVolume] = useState(0)
  const [dauData, setDauData] = useState<{date: string, users: number}[]>([])
  const [volumeData, setVolumeData] = useState<{date: string, volume: number}[]>([])
  const [txs, setTxs] = useState<{hash: string, createdAt: string, successful: boolean, explorerUrl: string}[]>([])

  useEffect(() => {
    setDau(monitor.getDAU())
    setTotalTx(monitor.getTotalTransactions())
    setTotalVolume(monitor.getTotalVolume())
    setDauData(monitor.getLast30DaysDAU())
    setVolumeData(monitor.getLast30DaysVolume())

    const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID
    if (contractId) {
      getAccountTransactions(contractId, 20).then(setTxs)
    }
  }, [])

  return (
    <div className="flex-1 min-w-0 bg-[#050505] min-h-screen text-white pb-20 font-sans">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-md px-6 lg:px-10 h-20 flex items-center">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">Metrics</h1>
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] mt-0.5">
            Live SafeDeal usage analytics
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-10 py-10 space-y-6">
        {/* Key metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card rounded-2xl p-6" style={{ borderLeft: "2px solid #06B6D4" }}>
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-[#06B6D4] w-5 h-5"/>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">
                Daily Active Users
              </p>
            </div>
            <p className="text-3xl font-black text-white">{dau}</p>
            <p className="text-[#06B6D4] text-xs font-bold mt-2 flex items-center gap-1 uppercase tracking-wider">
              <ArrowUp className="w-3 h-3"/>
              Today
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6" style={{ borderLeft: "2px solid #10b981" }}>
            <div className="flex items-center gap-3 mb-3">
              <Activity className="text-emerald-500 w-5 h-5"/>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">
                Total Transactions
              </p>
            </div>
            <p className="text-3xl font-black text-white">{totalTx}</p>
            <p className="text-emerald-500 text-xs font-bold mt-2 uppercase tracking-wider">All time</p>
          </div>

          <div className="glass-card rounded-2xl p-6" style={{ borderLeft: "2px solid #f59e0b" }}>
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="text-amber-500 w-5 h-5"/>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">
                Total Volume
              </p>
            </div>
            <p className="text-3xl font-black text-white">
              ${totalVolume.toFixed(2)}
            </p>
            <p className="text-amber-500 text-xs font-bold mt-2 uppercase tracking-wider">USDC all time</p>
          </div>

          <div className="glass-card rounded-2xl p-6" style={{ borderLeft: "2px solid #EC4899" }}>
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="text-[#EC4899] w-5 h-5"/>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">
                Avg Deal Size
              </p>
            </div>
            <p className="text-3xl font-black text-white">
              ${totalTx > 0 
                ? (totalVolume/totalTx).toFixed(2) 
                : '0'}
            </p>
            <p className="text-[#EC4899] text-xs font-bold mt-2 uppercase tracking-wider">USDC per deal</p>
          </div>
        </div>

        {/* DAU Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
            Daily Active Users — Last 30 Days
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dauData}>
              <defs>
                <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="date" stroke="#999" tick={{fontSize: 11}} interval={6}/>
              <YAxis stroke="#999" tick={{fontSize: 11}}/>
              <Tooltip 
                contentStyle={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}/>
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#06B6D4" 
                strokeWidth={2}
                fill="url(#dauGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
            Transaction Volume — Last 30 Days
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="date" stroke="#999" tick={{fontSize: 11}} interval={6}/>
              <YAxis stroke="#999" tick={{fontSize: 11}}/>
              <Tooltip
                contentStyle={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}/>
              <Bar dataKey="volume" fill="url(#volGrad)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User wallets table */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
            Connected User Wallets
          </h2>
          <p className="text-[#999] text-sm mb-4 font-light">
            Wallets that have connected to SafeDeal
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-3 text-[#999] text-[10px] font-bold uppercase tracking-[0.2em]">#</th>
                  <th className="text-left py-3 text-[#999] text-[10px] font-bold uppercase tracking-[0.2em]">Wallet Address</th>
                  <th className="text-left py-3 text-[#999] text-[10px] font-bold uppercase tracking-[0.2em]">First Seen</th>
                  <th className="text-left py-3 text-[#999] text-[10px] font-bold uppercase tracking-[0.2em]">Explorer</th>
                </tr>
              </thead>
              <tbody id="wallet-table-body">
                {monitor.getEvents()
                  .filter(e => e.event === 'user_connected')
                  .reduce((acc: {wallet: string, firstSeen: string}[], e) => {
                    if (!acc.find(a => a.wallet === String(e.data.wallet))) {
                      acc.push({
                        wallet: String(e.data.wallet),
                        firstSeen: e.timestamp
                      })
                    }
                    return acc
                  }, [])
                  .map((user, i) => (
                    <tr key={i} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                      <td className="py-3 text-[#999]">{i + 1}</td>
                      <td className="py-3 text-white font-mono text-xs">{user.wallet}</td>
                      <td className="py-3 text-[#999] text-xs">{new Date(user.firstSeen).toLocaleDateString()}</td>
                      <td className="py-3">
                        <a 
                          href={`https://stellar.expert/explorer/testnet/account/${user.wallet}`}
                          target="_blank"
                          className="text-[#06B6D4] text-xs hover:underline">
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* On-chain Transaction Index */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">On-chain Transaction Index</h2>
          <p className="text-[#999] text-sm mb-4 font-light">
            Last 20 transactions from Stellar Network (Escrow Contract)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-3 text-[#999] text-[10px] font-bold uppercase tracking-[0.2em]">Tx Hash</th>
                  <th className="text-left py-3 text-[#999] text-[10px] font-bold uppercase tracking-[0.2em]">Date & Time</th>
                  <th className="text-left py-3 text-[#999] text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
                  <th className="text-left py-3 text-[#999] text-[10px] font-bold uppercase tracking-[0.2em]">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx, i) => (
                  <tr key={i} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                    <td className="py-3 text-white font-mono text-xs">
                      {tx.hash.slice(0, 16)}...
                    </td>
                    <td className="py-3 text-[#999] text-xs">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.successful ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {tx.successful ? 'Successful' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3">
                      <a href={tx.explorerUrl} target="_blank" className="text-[#06B6D4] text-xs hover:underline cursor-pointer">
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
                {txs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#999] text-sm font-light">
                      No transactions indexed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
