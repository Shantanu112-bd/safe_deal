export const monitor = {
  dealCreated: (dealId: string, amount: number) => {
    console.log(JSON.stringify({
      event: 'deal_created',
      dealId,
      amount,
      timestamp: new Date().toISOString()
    }))
  },
  
  paymentLocked: (dealId: string, buyer: string) => {
    console.log(JSON.stringify({
      event: 'payment_locked',
      dealId,
      buyer: buyer.slice(0,8) + '...',
      timestamp: new Date().toISOString()
    }))
  },
  
  paymentReleased: (dealId: string, amount: number) => {
    console.log(JSON.stringify({
      event: 'payment_released',
      dealId,
      amount,
      timestamp: new Date().toISOString()
    }))
  },
  
  userConnected: (wallet: string) => {
    console.log(JSON.stringify({
      event: 'user_connected',
      wallet: wallet.slice(0,8) + '...',
      timestamp: new Date().toISOString()
    }))
  },
  
  error: (page: string, error: string) => {
    console.error(JSON.stringify({
      event: 'error',
      page,
      error,
      timestamp: new Date().toISOString()
    }))
  }
}
