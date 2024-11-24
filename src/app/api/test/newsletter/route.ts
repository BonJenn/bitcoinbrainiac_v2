import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { getBitcoinPrice } from '@/lib/price';
import { createMailchimpCampaign } from '@/app/api/cron/newsletter/route';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    console.log('Starting newsletter test...');
    
    const [articles, bitcoinData] = await Promise.all([
      scrapeBitcoinNews(),
      getBitcoinPrice(),
    ]);

    if (!bitcoinData) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    console.log('Generating newsletter content...');
    const content = await generateNewsletter(articles, bitcoinData);
    
    if (!content) throw new Error('Failed to generate newsletter content');

    // Use the same campaign creation function as production
    const campaign = await createMailchimpCampaign(bitcoinData.price, content, articles);
    
    return NextResponse.json({ 
      success: true,
      message: 'Test newsletter sent successfully',
      campaignId: campaign.id
    });
  } catch (error: any) {
    console.error('Newsletter test failed:', error);
    return NextResponse.json({ 
      error: 'Failed to send test newsletter',
      details: error.message
    }, { 
      status: 500 
    });
  }
}
