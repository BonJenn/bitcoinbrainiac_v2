import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { getBitcoinPrice } from '@/lib/price';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    console.log('Starting newsletter generation...');
    
    // Log the scraping URL we're trying to hit
    const scrapeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/scrape`;
    console.log('Fetching articles from:', scrapeUrl);
    
    const scrapeRes = await fetch(scrapeUrl);
    
    if (!scrapeRes.ok) {
      const errorData = await scrapeRes.json();
      throw new Error(`Failed to fetch articles: ${JSON.stringify(errorData)}`);
    }
    
    const data = await scrapeRes.json();
    
    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error(`Invalid articles data: ${JSON.stringify(data)}`);
    }
    
    console.log('Successfully fetched articles:', data.articles);
    
    const bitcoinPrice = await getBitcoinPrice();
    
    if (!bitcoinPrice) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    console.log('Bitcoin price:', bitcoinPrice);

    const newsletterContent = await generateNewsletter(data.articles, bitcoinPrice);
    if (!newsletterContent) {
      throw new Error('Failed to generate newsletter content');
    }

    // Create campaign with verified sender email
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
            saved_segment_id: process.env.MAILCHIMP_SEGMENT_ID // Optional: for targeting specific subscribers
          }
        },
        settings: {
          subject_line: `Bitcoin Daily: BTC at $${bitcoinPrice.price.toLocaleString()}`,
          preview_text: 'Your daily dose of Bitcoin news',
          title: `Bitcoin Newsletter - ${new Date().toLocaleDateString()}`,
          from_name: 'Bitcoin Brainiac',
          reply_to: process.env.MAILCHIMP_REPLY_TO, // Use environment variable instead of hardcoded email
        },
      }),
    });

    if (!campaign.ok) {
      const campaignError = await campaign.json();
      throw new Error(`Failed to create campaign: ${JSON.stringify(campaignError)}`);
    }

    const campaignData = await campaign.json();
    console.log('Campaign created:', campaignData);

    // Set campaign content
    const contentResponse = await fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns/${campaignData.id}/content`, {
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
              ${newsletterContent
                ?.split('\n\n')
                .map(paragraph => {
                  const boldText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  return `<p style="margin: 0 0 15px; font-size: 16px; line-height: 1.8;">${boldText}</p>`;
                })
                .join('') || ''}
              <div style="border-top: 2px solid #ffa500; margin-top: 20px; padding-top: 20px; font-size: 14px; color: #666;">
                <p>Always remember - not your keys, not your coins.</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!contentResponse.ok) {
      const contentError = await contentResponse.json();
      throw new Error(`Failed to set campaign content: ${JSON.stringify(contentError)}`);
    }

    // Send the campaign immediately
    const sendResponse = await fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns/${campaignData.id}/actions/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!sendResponse.ok) {
      const sendError = await sendResponse.json();
      throw new Error(`Failed to send campaign: ${JSON.stringify(sendError)}`);
    }

    console.log('Newsletter sent successfully');
    return NextResponse.json({ 
      success: true,
      message: 'Newsletter campaign created and sent successfully'
    });
    
  } catch (error: any) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate or send newsletter'
    }, { 
      status: 500 
    });
  }
}

async function logError(error: any, context: string) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    environment: process.env.NODE_ENV,
    service: 'newsletter-service'
  };

  console.error('Newsletter Error:', errorLog);

  // You could also send this to a logging service
  try {
    await fetch(`${process.env.ERROR_LOGGING_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorLog)
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}
