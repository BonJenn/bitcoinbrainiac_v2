import { NextResponse } from 'next/server';
import { scrapeBitcoinNews } from '@/lib/scraper';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const articles = await scrapeBitcoinNews();
    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
