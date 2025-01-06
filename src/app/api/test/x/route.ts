import { NextResponse } from 'next/server';
import { xClient } from '@/lib/x';

export async function GET() {
  try {
    const tweet = await xClient.v2.tweet('Hello from Bitcoin Brainiac!');
    
    return NextResponse.json({
      success: true,
      tweetId: tweet.data.id
    });
  } catch (error: any) {
    console.error('Tweet failed:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.data || 'No additional details'
    }, { 
      status: 500 
    });
  }
} 