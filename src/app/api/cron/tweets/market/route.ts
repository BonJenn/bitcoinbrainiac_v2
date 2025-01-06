import { NextResponse } from 'next/server';
import { xClient } from '@/lib/x';
import { getBitcoinPrice } from '@/lib/price';
import { generatePriceComment } from '@/lib/social';

export async function GET() {
  try {
    // Get current Bitcoin price data
    const bitcoinData = await getBitcoinPrice();
    
    // Generate and post price commentary
    const priceComment = await generatePriceComment(
      bitcoinData.price, 
      bitcoinData.change24h
    );
    const tweet = await xClient.v2.tweet(priceComment);

    return NextResponse.json({ 
      success: true, 
      tweetId: tweet.data.id,
      price: bitcoinData.price,
      change: bitcoinData.change24h
    });
  } catch (error: any) {
    console.error('Market tweet failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 