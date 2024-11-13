import { NextResponse } from 'next/server';
import { scrapeBitcoinNews } from '@/lib/scraper';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Starting scraping process...');
    const articles = await scrapeBitcoinNews();
    
    if (!articles || articles.length === 0) {
      console.error('No articles found during scraping');
      throw new Error('No articles were scraped');
    }
    
    console.log('Successfully scraped articles:', articles);
    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Scraping failed:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      fullError: error
    });
    
    return NextResponse.json({ 
      error: `Scraping failed: ${error.message}`,
      details: error.stack 
    }, { status: 500 });
  }
}
