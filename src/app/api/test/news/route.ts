import { NextResponse } from 'next/server';
import { scrapeBitcoinNews } from '@/lib/scraper';

export async function GET() {
  try {
    const articles = await scrapeBitcoinNews();
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to scrape news' }, { status: 500 });
  }
} 