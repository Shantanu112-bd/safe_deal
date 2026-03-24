"use client"
import { useEffect, useState } from 'react'
import { monitor } from '@/lib/monitoring'
import { getAccountTransactions } from '@/lib/indexer'
import { 
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
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
  const [txs, setTxs] = useState<any[]>([])

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold 
          text-white">Metrics Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Live SafeDeal usage analytics
        </p>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 
        lg:grid-cols-4 gap-4">
        
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 
          rounded-xl">
          <div className="flex items-center 
            gap-3 mb-2">
            <Users className="text-indigo-400 
              w-5 h-5"/>
            <p className="text-slate-400 text-sm">
              Daily Active Users
            </p>
          </div>
          <p className="text-3xl font-bold 
            text-white">{dau}</p>
          <p className="text-indigo-400 text-xs 
            mt-1 flex items-center gap-1">
            <ArrowUp className="w-3 h-3"/>
            Today
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 
          rounded-xl">
          <div className="flex items-center 
            gap-3 mb-2">
            <Activity className="text-emerald-400 
              w-5 h-5"/>
            <p className="text-slate-400 text-sm">
              Total Transactions
            </p>
          </div>
          <p className="text-3xl font-bold 
            text-white">{totalTx}</p>
          <p className="text-emerald-400 text-xs 
            mt-1">All time</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-5 
          rounded-xl">
          <div className="flex items-center 
            gap-3 mb-2">
            <DollarSign className="text-amber-400 
              w-5 h-5"/>
            <p className="text-slate-400 text-sm">
              Total Volume
            </p>
          </div>
          <p className="text-3xl font-bold 
            text-white">
            ${totalVolume.toFixed(2)}
          </p>
          <p className="text-amber-400 text-xs 
            mt-1">USDC all time</p>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/20 p-5 
          rounded-xl">
          <div className="flex items-center 
            gap-3 mb-2">
            <TrendingUp className="text-cyan-400 
              w-5 h-5"/>
            <p className="text-slate-400 text-sm">
              Avg Deal Size
            </p>
          </div>
          <p className="text-3xl font-bold 
            text-white">
            ${totalTx > 0 
              ? (totalVolume/totalTx).toFixed(2) 
              : '0'}
          </p>
          <p className="text-cyan-400 text-xs 
            mt-1">USDC per deal</p>
        </div>
      </div>

      {/* DAU Chart */}
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-xl p-6">
        <h2 className="text-white font-semibold 
          mb-4">Daily Active Users — Last 30 Days
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={dauData}>
            <defs>
              <linearGradient id="dauGrad" 
                x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" 
                  stopColor="#6366f1" 
                  stopOpacity={0.3}/>
                <stop offset="95%" 
                  stopColor="#6366f1" 
                  stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.05)"/>
            <XAxis dataKey="date" 
              stroke="#64748b" 
              tick={{fontSize: 11}}
              interval={6}/>
            <YAxis stroke="#64748b" 
              tick={{fontSize: 11}}/>
            <Tooltip 
              contentStyle={{
                background: '#1a2235',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#fff'
              }}/>
            <Area 
              type="monotone" 
              dataKey="users" 
              stroke="#6366f1" 
              strokeWidth={2}
              fill="url(#dauGrad)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-xl p-6">
        <h2 className="text-white font-semibold 
          mb-4">Transaction Volume — Last 30 Days
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={volumeData}>
            <defs>
              <linearGradient id="volGrad" 
                x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" 
                  stopColor="#06b6d4" 
                  stopOpacity={0.8}/>
                <stop offset="95%" 
                  stopColor="#06b6d4" 
                  stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"/>
            <XAxis dataKey="date" 
              stroke="#64748b"
              tick={{fontSize: 11}}
              interval={6}/>
            <YAxis stroke="#64748b"
              tick={{fontSize: 11}}/>
            <Tooltip
              contentStyle={{
                background: '#1a2235',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#fff'
              }}/>
            <Bar dataKey="volume" 
              fill="url(#volGrad)" 
              radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User wallets table */}
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-xl p-6">
        <h2 className="text-white font-semibold 
          mb-4">Connected User Wallets
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Wallets that have connected to SafeDeal
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b 
                border-[#1e293b]">
                <th className="text-left py-3 
                  text-slate-400 font-medium">
                  #
                </th>
                <th className="text-left py-3 
                  text-slate-400 font-medium">
                  Wallet Address
                </th>
                <th className="text-left py-3 
                  text-slate-400 font-medium">
                  First Seen
                </th>
                <th className="text-left py-3 
                  text-slate-400 font-medium">
                  Stellar Explorer
                </th>
              </tr>
            </thead>
            <tbody id="wallet-table-body">
              {monitor.getEvents()
                .filter(e => 
                  e.event === 'user_connected')
                .reduce((acc: any[], e) => {
                  if (!acc.find(a => 
                    a.wallet === e.data.wallet)) {
                    acc.push({
                      wallet: e.data.wallet,
                      firstSeen: e.timestamp
                    })
                  }
                  return acc
                }, [])
                .map((user, i) => (
                  <tr key={i} className="border-b 
                    border-[#1e293b]/50 
                    hover:bg-white/[0.02]">
                    <td className="py-3 
                      text-slate-400">
                      {i + 1}
                    </td>
                    <td className="py-3 
                      text-white font-mono 
                      text-xs">
                      {user.wallet}
                    </td>
                    <td className="py-3 
                      text-slate-400 text-xs">
                      {new Date(user.firstSeen)
                        .toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <a 
                        href={`https://stellar.expert/explorer/testnet/account/${user.wallet}`}
                        target="_blank"
                        className="text-indigo-400 
                          text-xs hover:underline">
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
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-xl p-6">
        <h2 className="text-white font-semibold mb-4">On-chain Transaction Index</h2>
        <p className="text-slate-400 text-sm mb-4">
          Last 20 transactions from Stellar Network (Escrow Contract)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left py-3 text-slate-400 font-medium">Tx Hash</th>
                <th className="text-left py-3 text-slate-400 font-medium">Date & Time</th>
                <th className="text-left py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 text-slate-400 font-medium">Explorer</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx, i) => (
                <tr key={i} className="border-b border-[#1e293b]/50 hover:bg-white/[0.02]">
                  <td className="py-3 text-white font-mono text-xs">
                    {tx.hash.slice(0, 16)}...
                  </td>
                  <td className="py-3 text-slate-400 text-xs">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.successful ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {tx.successful ? 'Successful' : 'Failed'}
                    </span>
                  </td>
                  <td className="py-3">
                    <a href={tx.explorerUrl} target="_blank" className="text-indigo-400 text-xs hover:underline cursor-pointer">
                      View →
                    </a>
                  </td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                    No transactions indexed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
