import { NextResponse } from 'next/server';
import { generateNewsletter, generateTitle, generateSubtitle } from '@/lib/openai';
import { getBitcoinPrice } from '@/lib/price';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import ErrorLog from './error-log';
import { logError } from '@/lib/logger';
import mailchimp from '@mailchimp/mailchimp_marketing';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const context = 'Newsletter Generation';
  const metadata: any = {};
  
  try {
    console.log('Starting newsletter generation:', new Date().toISOString());
    
    // Connect to database
    await connectToDatabase();
    metadata.dbConnection = 'success';
    
    // Scrape articles
    const scrapeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/scrape`;
    console.log('Fetching articles from:', scrapeUrl);
    const scrapeRes = await fetch(scrapeUrl);
    
    if (!scrapeRes.ok) {
      const errorData = await scrapeRes.json();
      metadata.scrapeError = errorData;
      throw new Error(`Failed to fetch articles: ${JSON.stringify(errorData)}`);
    }
    
    const data = await scrapeRes.json();
    metadata.articlesCount = data.articles?.length;
    
    if (!data.articles || !Array.isArray(data.articles)) {
      metadata.invalidData = data;
      throw new Error(`Invalid articles data`);
    }
    
    // Get Bitcoin price
    const bitcoinPrice = await getBitcoinPrice();
    metadata.bitcoinPrice = bitcoinPrice;
    
    if (!bitcoinPrice) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    // Generate newsletter
    const newsletterContent = await generateNewsletter(data.articles, bitcoinPrice);
    metadata.contentGenerated = !!newsletterContent;
    
    if (!newsletterContent) {
      throw new Error('Failed to generate newsletter content');
    }

    // Create and send campaign
    const campaign = await createMailchimpCampaign(bitcoinPrice, newsletterContent);
    metadata.campaignId = campaign.id;
    
    // Store newsletter
    const newsletter = await storeNewsletter(campaign.id, newsletterContent, bitcoinPrice);
    metadata.newsletterId = newsletter.id;

    return NextResponse.json({ 
      success: true,
      campaignId: campaign.id,
      newsletterId: newsletter.id
    });
    
  } catch (error: any) {
    await logError(error, context, metadata);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

export async function sendNewsletter() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Generate newsletter content
    const articles = await fetchArticles(); // Implement this function to fetch articles
    const bitcoinData = await fetchBitcoinData(); // Implement this function to fetch Bitcoin data
    const content = await generateNewsletter(articles, bitcoinData);

    // Create Mailchimp campaign
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    const campaign = await mailchimp.campaigns.create({
      type: 'regular',
      recipients: { list_id: process.env.MAILCHIMP_LIST_ID },
      settings: {
        subject_line: 'Your Bitcoin Newsletter',
        title: 'Bitcoin Newsletter',
        from_name: 'Bitcoin Brainiac',
        reply_to: process.env.MAILCHIMP_REPLY_TO,
      },
    });

    // Set campaign content
    await mailchimp.campaigns.setContent(campaign.id, {
      html: content,
    });

    // Send the campaign
    await mailchimp.campaigns.send(campaign.id);

    // Store the newsletter in the database
    const newsletter = new Newsletter({
      title: 'Bitcoin Newsletter',
      content,
      sentAt: new Date(),
      bitcoinPrice: bitcoinData.price,
      priceChange: bitcoinData.change24h,
    });
    await newsletter.save();

    console.log('Newsletter sent and stored successfully');
  } catch (error) {
    console.error('Failed to send newsletter:', error);
  }
}
