export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Networks, TransactionBuilder, Transaction, Keypair } from '@stellar/stellar-sdk';

export async function POST(req: Request) {
  try {
    const { signedXdr } = await req.json();
    if (!signedXdr) {
      return NextResponse.json({ error: 'Missing signedXdr' }, { status: 400 });
    }

    // Must be set in Vercel to work in production
    const sponsorSecret = process.env.FEE_SPONSOR_SECRET_KEY;
    if (!sponsorSecret) {
      return NextResponse.json({ error: 'FEE_SPONSOR_SECRET_KEY not configured on backend' }, { status: 500 });
    }

    const sponsorKeypair = Keypair.fromSecret(sponsorSecret);
    const innerTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET) as Transaction;
    
    // Convert base fee to string (e.g. 100000 stroops = 0.01 XLM)
    const tx = TransactionBuilder.buildFeeBumpTransaction(
      sponsorKeypair.publicKey(),
      String(1000000), // generously bump fee to ensure completion
      innerTx,
      Networks.TESTNET
    );

    // Sponsor authenticates and signs the fee bump wrapper
    tx.sign(sponsorKeypair);

    return NextResponse.json({ 
      success: true, 
      sponsoredXdr: tx.toEnvelope().toXDR('base64'),
      sponsorAddress: sponsorKeypair.publicKey()
    });
  } catch (err) {
    console.error('Sponsor API error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
