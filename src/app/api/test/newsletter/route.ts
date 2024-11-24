import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { getBitcoinPrice } from '@/lib/price';

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

    // Create test campaign
    const campaign = await fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'regular',
        recipients: {
          list_id: process.env.MAILCHIMP_LIST_ID,
          segment_opts: {
            conditions: [{
              field: 'email',
              op: 'is',
              value: process.env.TEST_EMAIL // Add TEST_EMAIL to your .env file
            }]
          }
        },
        settings: {
          subject_line: `[TEST] Bitcoin Daily: BTC at $${bitcoinData.price.toLocaleString()}`,
          preview_text: 'Test email - Daily Bitcoin Update',
          title: `Test Newsletter - ${new Date().toLocaleDateString()}`,
          from_name: 'Bitcoin Brainiac',
          reply_to: process.env.MAILCHIMP_REPLY_TO,
        },
      }),
    });

    if (!campaign.ok) {
      throw new Error('Failed to create test campaign');
    }

    const campaignData = await campaign.json();

    // Set the campaign content
    await fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns/${campaignData.id}/content`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: content
      }),
    });

    // Send the test campaign
    await fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns/${campaignData.id}/actions/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Test newsletter sent successfully'
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
