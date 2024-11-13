import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { getBitcoinPrice } from '@/lib/price';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET() {
  try {
    console.log('Starting newsletter test...');
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), 280000)
    );

    const resultPromise = Promise.all([
      scrapeBitcoinNews(),
      getBitcoinPrice(),
    ]) as Promise<[any[], { price: number, change24h: number }]>;

    const [articles, bitcoinData] = await Promise.race([
      resultPromise,
      timeoutPromise
    ]);

    if (!bitcoinData) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    console.log('Generating newsletter content...');
    const content = await generateNewsletter(articles, bitcoinData);
    
    return NextResponse.json({ 
      success: true,
      content,
      articleCount: articles.length,
      bitcoinPrice: bitcoinData.price,
      priceChange: bitcoinData.change24h
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
