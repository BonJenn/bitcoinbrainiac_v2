import { NextResponse } from 'next/server';
import { generateNewsComment, generatePriceComment } from '@/lib/social';
import { getBitcoinPrice } from '@/lib/price';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET() {
  try {
    console.log('Generating tweet previews...');

    // Get latest newsletter
    await connectToDatabase();
    const latestNewsletter = await Newsletter.findOne()
      .sort({ sentAt: -1 })
      .limit(1);

    if (!latestNewsletter) {
      throw new Error('No newsletter found');
    }

    // Get fresh articles and price data
    const [articles, bitcoinData] = await Promise.all([
      scrapeBitcoinNews(),
      getBitcoinPrice()
    ]);

    // Generate all three tweets
    const newsletterTweet = `📰 ${latestNewsletter.title}\n\nRead today's newsletter: https://bitcoinbrainiac.net/newsletters/${latestNewsletter.id}`;
    const newsComment = await generateNewsComment(articles[0]);
    const priceComment = await generatePriceComment(bitcoinData.price, bitcoinData.change24h);

    return NextResponse.json({
      success: true,
      tweets: {
        newsletter: {
          text: newsletterTweet,
          time: 'Immediately after newsletter'
        },
        news: {
          text: newsComment,
          headline: articles[0].title,
          time: '2 hours after newsletter'
        },
        price: {
          text: priceComment,
          price: `$${bitcoinData.price.toLocaleString()}`,
          change: `${bitcoinData.change24h}%`,
          time: '4 hours after newsletter'
        }
      },
      debug: {
        newsletterId: latestNewsletter.id,
        articleCount: articles.length,
        currentPrice: bitcoinData.price
      }
    });
  } catch (error: any) {
    console.error('Tweet preview generation failed:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.data || 'No additional details'
    }, { 
      status: 500 
    });
  }
} 