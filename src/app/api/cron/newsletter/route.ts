import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { getBitcoinPrice } from '@/lib/price';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const scrapeRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/scrape`);
    if (!scrapeRes.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    const { articles } = await scrapeRes.json();
    const bitcoinPrice = await getBitcoinPrice();
    
    if (!bitcoinPrice) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    const newsletterContent = await generateNewsletter(articles, bitcoinPrice);
    
    if (!newsletterContent) {
      throw new Error('Failed to generate newsletter content');
    }

    // Create campaign
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
        },
        settings: {
          subject_line: `Bitcoin Daily: BTC at $${bitcoinPrice.toLocaleString()}`,
          preview_text: 'Your daily dose of Bitcoin news',
          title: `Bitcoin Newsletter - ${new Date().toLocaleDateString()}`,
          from_name: 'Bitcoin Brainiac',
          reply_to: process.env.MAILCHIMP_REPLY_TO,
        },
      }),
    });

    const campaignData = await campaign.json();

    // Set campaign content
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
            <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
              ${newsletterContent.replace(/\n/g, '<br>')}
            </body>
          </html>
        `,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
