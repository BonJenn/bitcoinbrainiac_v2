import { NextResponse } from 'next/server';
import { postDailyTweets } from '@/lib/social';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET() {
  try {
    // Get latest newsletter
    await connectToDatabase();
    const latestNewsletter = await Newsletter.findOne()
      .sort({ sentAt: -1 })
      .limit(1);

    if (!latestNewsletter) {
      throw new Error('No newsletter found');
    }

    // Get fresh articles
    const articles = await scrapeBitcoinNews();

    // Post the tweets with 1-minute delays for testing
    const result = await postDailyTweets(latestNewsletter, articles);

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Live tweet test failed:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.data || 'No additional details'
    }, { 
      status: 500 
    });
  }
} 