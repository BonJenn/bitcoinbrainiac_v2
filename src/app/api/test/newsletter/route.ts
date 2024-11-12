import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { getBitcoinPrice } from '@/lib/price';

export async function GET() {
  try {
    const [articles, bitcoinPrice] = await Promise.all([
      scrapeBitcoinNews(),
      getBitcoinPrice(),
    ]);

    if (!bitcoinPrice) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    const content = await generateNewsletter(articles, bitcoinPrice);
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate newsletter' }, { status: 500 });
  }
}
