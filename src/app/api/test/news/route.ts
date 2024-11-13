import { NextResponse } from 'next/server';
import { scrapeBitcoinNews } from '@/lib/scraper';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Starting test news scrape...');
    const articles = await scrapeBitcoinNews();
    console.log('Test scrape successful:', articles);
    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Test scrape failed:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Failed to scrape news',
      details: error.message,
      stack: error.stack
    }, { 
      status: 500 
    });
  }
} 