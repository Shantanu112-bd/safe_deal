import { Horizon } from '@stellar/stellar-sdk'

const server = new Horizon.Server(
  'https://horizon-testnet.stellar.org'
)

export interface IndexedDeal {
  id: string
  seller: string
  amount: number
  status: string
  createdAt: string
  txHash: string
}

export async function indexSellerDeals(
  sellerPublicKey: string
): Promise<IndexedDeal[]> {
  try {
    const transactions = await server
      .transactions()
      .forAccount(sellerPublicKey)
      .order('desc')
      .limit(50)
      .call()
    
    const deals: IndexedDeal[] = []
    
    for (const tx of transactions.records) {
      if (tx.memo && 
          tx.memo.toString().startsWith('DEAL:')) {
        deals.push({
          id: tx.memo.toString().replace('DEAL:', ''),
          seller: sellerPublicKey,
          amount: 0,
          status: 'Unknown',
          createdAt: tx.created_at,
          txHash: tx.hash
        })
      }
    }
    
    return deals
  } catch (error) {
    console.error('Indexer error:', error)
    return []
  }
}

export async function getAccountTransactions(
  publicKey: string,
  limit: number = 20
) {
  try {
    const txs = await server
      .transactions()
      .forAccount(publicKey)
      .order('desc')
      .limit(limit)
      .call()
    
    return txs.records.map((tx) => ({
      hash: tx.hash,
      createdAt: tx.created_at,
      memo: tx.memo,
      successful: tx.successful,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${tx.hash}`
    }))
  } catch {
    return []
  }
}
