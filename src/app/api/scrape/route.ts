import { NextResponse } from 'next/server';
import { scrapeBitcoinNews } from '@/lib/scraper';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Starting scraping process...');
    const articles = await scrapeBitcoinNews();
    console.log('Scraped articles:', articles);
    
    if (!articles || articles.length === 0) {
      throw new Error('No articles were scraped');
    }
    
    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Detailed scraping error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
}
