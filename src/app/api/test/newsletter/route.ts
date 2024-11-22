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
          preview_text: 'Test email - New format with larger text',
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
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.8; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <div style="border-bottom: 2px solid #ffa500; margin-bottom: 20px; padding-bottom: 20px;">
                <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">Bitcoin Daily Update</h1>
                <p style="color: #666; font-size: 16px; margin: 5px 0 0;">${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              ${content
                ?.replace('```html', '') // Remove any HTML markdown markers
                ?.replace('```', '')     // Remove closing markdown markers
                ?.split('\n\n')
                .map(paragraph => {
                  // Process headings
                  if (paragraph.startsWith('<h3>')) {
                    return paragraph;
                  }
                  // Process bullet points
                  if (paragraph.includes('<ul>')) {
                    return paragraph;
                  }
                  // Process regular paragraphs
                  const boldText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  return `<p style="margin: 0 0 15px; font-size: 16px; line-height: 1.8;">${boldText}</p>`;
                })
                .join('') || ''}
              <div style="border-top: 2px solid #ffa500; margin-top: 20px; padding-top: 20px; font-size: 14px; color: #666;">
                <p>Have thoughts about Bitcoin? Just hit reply!</p>
              </div>
            </body>
          </html>
        `
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
      details: error.message,
      stack: error.stack
    }, { 
      status: 500 
    });
  }
}
