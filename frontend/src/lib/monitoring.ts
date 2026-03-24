type EventType = 
  | 'user_connected'
  | 'deal_created' 
  | 'payment_locked'
  | 'payment_released'
  | 'dispute_raised'
  | 'page_view'
  | 'error'

interface MonitorEvent {
  event: EventType
  timestamp: string
  data: Record<string, string | number | boolean | null | undefined>
}

const STORAGE_KEY = 'safedeal_events'

function saveEvent(event: MonitorEvent) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    )
    existing.push(event)
    // Keep last 1000 events only
    const trimmed = existing.slice(-1000)
    localStorage.setItem(
      STORAGE_KEY, 
      JSON.stringify(trimmed)
    )
    // Also log to console for Vercel logs
    console.log('[SafeDeal]', JSON.stringify(event))
  } catch (err) {
    console.error('Monitor error:', err)
  }
}

export const monitor = {
  userConnected: (wallet: string) => saveEvent({
    event: 'user_connected',
    timestamp: new Date().toISOString(),
    data: { wallet: wallet.slice(0,8) + '...' }
  }),

  dealCreated: (dealId: string, amount: number, 
    category: string) => saveEvent({
    event: 'deal_created',
    timestamp: new Date().toISOString(),
    data: { dealId, amount, category }
  }),

  paymentLocked: (dealId: string, 
    amount: number) => saveEvent({
    event: 'payment_locked',
    timestamp: new Date().toISOString(),
    data: { dealId, amount }
  }),

  paymentReleased: (dealId: string, 
    amount: number) => saveEvent({
    event: 'payment_released',
    timestamp: new Date().toISOString(),
    data: { dealId, amount }
  }),

  pageView: (page: string) => saveEvent({
    event: 'page_view',
    timestamp: new Date().toISOString(),
    data: { page }
  }),

  error: (page: string, message: string) => {
    saveEvent({
      event: 'error',
      timestamp: new Date().toISOString(),
      data: { page, message }
    })
    console.error('[SafeDeal Error]', page, message)
  },

  getEvents: (): MonitorEvent[] => {
    try {
      if (typeof window === 'undefined') return []
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      )
    } catch { return [] }
  },

  getDAU: (): number => {
    const events = monitor.getEvents()
    const today = new Date().toDateString()
    const uniqueWallets = new Set(
      events
        .filter(e => 
          e.event === 'user_connected' &&
          new Date(e.timestamp).toDateString() === today
        )
        .map(e => String(e.data.wallet || ''))
    )
    return uniqueWallets.size
  },

  getTotalTransactions: (): number => {
    return monitor.getEvents()
      .filter(e => e.event === 'payment_locked')
      .length
  },

  getTotalVolume: (): number => {
    return monitor.getEvents()
      .filter(e => e.event === 'payment_released')
      .reduce((sum, e) => sum + (Number(e.data.amount) || 0), 0)
  },

  getLast30DaysDAU: (): {date: string, users: number}[] => {
    const events = monitor.getEvents()
    const result = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      const uniqueWallets = new Set(
        events
          .filter(e => 
            e.event === 'user_connected' &&
            new Date(e.timestamp).toDateString() === dateStr
          )
          .map(e => String(e.data.wallet || ''))
      )
      result.push({
        date: date.toLocaleDateString('en-US', 
          { month: 'short', day: 'numeric' }),
        users: uniqueWallets.size
      })
    }
    return result
  },

  getLast30DaysVolume: (): {date: string, volume: number}[] => {
    const events = monitor.getEvents()
    const result = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      const volume = events
        .filter(e => 
          e.event === 'payment_locked' &&
          new Date(e.timestamp).toDateString() === dateStr
        )
        .reduce((sum, e) => sum + (Number(e.data.amount) || 0), 0)
      result.push({
        date: date.toLocaleDateString('en-US',
          { month: 'short', day: 'numeric' }),
        volume: Number(volume.toFixed(2))
      })
    }
    return result
  }
}
