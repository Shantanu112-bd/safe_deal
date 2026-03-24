import { 
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Transaction
} from '@stellar/stellar-sdk'

export async function createFeeBumpTransaction(
  innerTransactionXDR: string,
  feeSourcePublicKey: string
): Promise<string> {
  const innerTx = TransactionBuilder
    .fromXDR(innerTransactionXDR, Networks.TESTNET)
  
  const feeBumpTx = TransactionBuilder
    .buildFeeBumpTransaction(
      feeSourcePublicKey,
      (Number(BASE_FEE) * 10).toString(),
      innerTx as Transaction,
      Networks.TESTNET
    )
  
  return feeBumpTx.toXDR()
}

export async function submitFeeBumpTransaction(
  feeBumpXDR: string,
  _signedInnerXDR?: string // Added unused parameter just to match the signature in the prompt
): Promise<string> {
  const response = await fetch(
    'https://horizon-testnet.stellar.org/transactions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `tx=${encodeURIComponent(feeBumpXDR)}`
    }
  )
  
  const result = await response.json()
  return result.hash
}
