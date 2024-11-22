import { NextResponse } from 'next/server';
import { scrapeBitcoinNews } from '@/lib/scraper';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Starting scraping process...');
    const articles = await scrapeBitcoinNews();
    
    if (!articles || articles.length === 0) {
      console.error('No articles found during scraping');
      return NextResponse.json({ 
        error: 'No articles were found',
        articles: [] 
      }, { status: 404 });
    }
    
    console.log('Successfully scraped articles:', articles);
    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Scraping failed:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({ 
      error: error.message || 'Failed to scrape articles',
      details: error.stack
    }, { status: 500 });
  }
}
