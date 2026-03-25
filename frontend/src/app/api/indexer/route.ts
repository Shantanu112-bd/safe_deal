import { NextResponse } from 'next/server';
import { getSellerDeals, getBuyerDeals, DealData } from '@/lib/stellar'; // We will reuse the core RPC logic but isolate it server-side

// In-memory cache for serverless (Will persist per lambda / worker until cold start)
// For a deeper persistence layer, replace this object with PostgreSQL or Vercel KV.
const INDEX_CACHE: Record<string, { timestamp: number; data: DealData[] }> = {};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get('publicKey');
    const role = searchParams.get('role'); // "seller" | "buyer"

    if (!publicKey) {
      return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
    }

    const cacheKey = `${role}_${publicKey}`;
    const CACHE_TTL = 15000; // 15 seconds cache expiration mimicking a real-time event-driven indexer

    // Return cached indexed data if available and fresh
    if (INDEX_CACHE[cacheKey] && Date.now() - INDEX_CACHE[cacheKey].timestamp < CACHE_TTL) {
      console.log(`[Indexer API] Serving freshly cached data for ${cacheKey}`);
      return NextResponse.json({
        success: true,
        source: 'indexer-cache',
        deals: INDEX_CACHE[cacheKey].data,
      });
    }

    // Otherwise, simulate the "Sync Worker" by fetching directly from Soroban testnet
    console.log(`[Indexer API] Cache missed for ${cacheKey}, indexing from Soroban Contract...`);
    
    let deals: DealData[] = [];
    if (role === 'seller') {
      deals = await getSellerDeals(publicKey);
    } else if (role === 'buyer') {
      deals = await getBuyerDeals(publicKey);
    }

    // Save back to the indexer store
    INDEX_CACHE[cacheKey] = {
      timestamp: Date.now(),
      data: deals,
    };

    return NextResponse.json({
      success: true,
      source: 'live-contract',
      deals,
    });
  } catch (error) {
    console.error('[Indexer API] Failed to index deals', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
