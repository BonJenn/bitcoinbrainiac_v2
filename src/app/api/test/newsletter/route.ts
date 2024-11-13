import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { getBitcoinPrice } from '@/lib/price';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  try {
    console.log('Starting newsletter test...');
    
    // Set timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), 50000)
    );

    const resultPromise = Promise.all([
      scrapeBitcoinNews(),
      getBitcoinPrice(),
    ]);

    const [articles, bitcoinPrice] = await Promise.race([
      resultPromise,
      timeoutPromise
    ]);

    if (!bitcoinPrice) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    console.log('Generating newsletter content...');
    const content = await generateNewsletter(articles, bitcoinPrice);
    
    return NextResponse.json({ 
      success: true,
      content,
      articleCount: articles.length,
      bitcoinPrice
    });
  } catch (error: any) {
    console.error('Newsletter generation failed:', error);
    return NextResponse.json({ 
      error: 'Failed to generate newsletter',
      details: error.message,
      stack: error.stack
    }, { 
      status: 500 
    });
  }
}
