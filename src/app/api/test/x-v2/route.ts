import { NextResponse } from 'next/server';
import { xClient, testXClient } from '@/lib/x';

export async function GET() {
  try {
    const testResult = await testXClient();
    
    if (!testResult.success) {
      throw new Error(testResult.error || 'X client test failed');
    }

    // If successful, try a test tweet
    const tweet = await xClient.v2.tweet('Test tweet ' + new Date().toISOString());

    return NextResponse.json({
      success: true,
      accountInfo: testResult,
      tweet: tweet.data
    });
  } catch (error: any) {
    console.error('X test failed:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.data || 'No additional details'
    }, { 
      status: 500 
    });
  }
} 