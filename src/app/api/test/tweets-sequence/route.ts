import { NextResponse } from 'next/server';
import { postDailyTweets } from '@/lib/social';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET() {
  try {
    console.log('Testing full tweet sequence...');

    // Get latest newsletter
    await connectToDatabase();
    const latestNewsletter = await Newsletter.findOne()
      .sort({ sentAt: -1 })
      .limit(1);

    if (!latestNewsletter) {
      throw new Error('No newsletter found');
    }

    // Use the articles from the latest newsletter
    const articles = [
      {
        title: "Bitcoin Continues Strong Performance in 2024",
        url: "https://bitcoinbrainiac.net/news",
        source: "Bitcoin Brainiac"
      }
    ];

    // Override the wait times for testing
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (fn: any, ms: number) => originalSetTimeout(fn, ms / 120); // Make delays 120x faster

    // Post the tweets with shortened delays
    const result = await postDailyTweets(latestNewsletter, articles);

    // Restore original setTimeout
    global.setTimeout = originalSetTimeout;

    return NextResponse.json({
      success: true,
      result,
      debug: {
        newsletterId: latestNewsletter.id,
        bitcoinPrice: latestNewsletter.bitcoinPrice,
        article: articles[0]
      }
    });
  } catch (error: any) {
    console.error('Tweet sequence test failed:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.data || 'No additional details',
      stack: error.stack
    }, { 
      status: 500 
    });
  }
} 