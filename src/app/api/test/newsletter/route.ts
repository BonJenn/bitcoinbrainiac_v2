import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { getBitcoinPrice } from '@/lib/price';
import { createMailchimpCampaign } from '@/app/api/cron/newsletter/route';
import mailchimp from '@mailchimp/mailchimp_marketing';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    console.log('Starting newsletter test...');
    
    // Configure Mailchimp
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX?.split('-')[0],
    });

    const [articles, bitcoinData] = await Promise.all([
      scrapeBitcoinNews(),
      getBitcoinPrice(),
    ]);

    if (!bitcoinData) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    console.log('Generating newsletter content...');
    const content = await generateNewsletter(articles, {
      price: Number(bitcoinData.price),
      change24h: Number(bitcoinData.change24h),
      fearGreedIndex: bitcoinData.fearGreedIndex
    });
    
    if (!content) throw new Error('Failed to generate newsletter content');

    // Override the campaign settings to use the correct email
    const formattedPrice = `$${bitcoinData.price.toLocaleString()}`;
    const subject = `${articles[0].title} | BTC Price: ${formattedPrice}`;

    const campaign = await mailchimp.campaigns.create({
      type: 'regular',
      settings: {
        subject_line: subject,
        preview_text: `Bitcoin is trading at ${formattedPrice}`,
        title: subject,
        from_name: 'Bitcoin Brainiac',
        reply_to: 'hello@bitcoinbrainiac.net',
        template_id: process.env.MAILCHIMP_TEMPLATE_ID
      },
      recipients: {
        list_id: process.env.MAILCHIMP_LIST_ID as string
      }
    });

    // Schedule the campaign if needed
    await mailchimp.campaigns.schedule(campaign.id, {
      schedule_time: '2023-10-10T14:00:00Z' // 6:00 AM PST in UTC
    });

    // Set campaign content
    await mailchimp.campaigns.setContent(campaign.id, {
      html: content
    });
    
    console.log('Campaign created:', campaign.id);
    console.log('Attempting to send campaign...');
    
    try {
      const sendResponse = await fetch(
        `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns/${campaign.id}/actions/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!sendResponse.ok) {
        const error = await sendResponse.json();
        throw new Error(`Failed to send campaign: ${error.detail || error.message || 'Unknown error'}`);
      }

      console.log('Campaign sent successfully');
    } catch (sendError: any) {
      console.error('Send error details:', sendError);
      throw new Error(`Failed to send campaign: ${sendError.message}`);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Test newsletter sent successfully',
      campaignId: campaign.id
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
