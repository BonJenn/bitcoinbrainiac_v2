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

    // Set the content
    await mailchimp.campaigns.setContent(campaign.id, {
      html: content
    });

    // Send test email using direct API call
    const testResponse = await fetch(
      `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns/${campaign.id}/actions/test`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test_emails: ['jonathantbenn@gmail.com'],
          send_type: 'html'
        })
      }
    );

    if (!testResponse.ok) {
      const error = await testResponse.json();
      throw new Error(`Failed to send test email: ${error.detail || error.message || 'Unknown error'}`);
    }

    console.log('Test email sent successfully');
    
    // Clean up by deleting the test campaign
    await mailchimp.campaigns.remove(campaign.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Test newsletter sent successfully',
      campaignId: campaign.id
    });

  } catch (error: any) {
    console.error('Test newsletter error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
