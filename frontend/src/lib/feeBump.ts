import { 
  TransactionBuilder,
  Networks,
  Keypair,
  BASE_FEE
} from '@stellar/stellar-sdk'

const SAFEDEAL_FEE_ACCOUNT = 
  process.env.NEXT_PUBLIC_FEE_SPONSOR_PUBLIC_KEY || ''

export async function wrapWithFeeBump(
  innerTransactionXDR: string
): Promise<string> {
  try {
    const { TransactionBuilder } = 
      await import('@stellar/stellar-sdk')
    
    const innerTx = TransactionBuilder.fromXDR(
      innerTransactionXDR,
      Networks.TESTNET
    )
    
    const feeBumpTx = TransactionBuilder
      .buildFeeBumpTransaction(
        SAFEDEAL_FEE_ACCOUNT,
        String(Number(BASE_FEE) * 10),
        innerTx as any,
        Networks.TESTNET
      )
    
    return feeBumpTx.toEnvelope().toXDR('base64')
  } catch (error) {
    console.error('Fee bump error:', error)
    throw error
  }
}

export function isFeeSponsorshipEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FEE_SPONSOR_PUBLIC_KEY
  )
}
