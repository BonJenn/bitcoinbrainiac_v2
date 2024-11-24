import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { getBitcoinPrice } from '@/lib/price';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import ErrorLog from './error-log';
import { logError } from '@/lib/logger';
import mailchimp from '@mailchimp/mailchimp_marketing';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function createMailchimpCampaign(bitcoinPrice: number, content: string, articles: any[]) {
  console.log('Setting up Mailchimp with price:', bitcoinPrice);
  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
  });

  const mainStory = findMainStory(articles);
  const formattedPrice = Number(bitcoinPrice).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const title = `${mainStory.headline} - Today's Price: ${formattedPrice}`;
  console.log('Creating campaign with title:', title);
  
  const campaign = await mailchimp.campaigns.create({
    type: 'regular',
    recipients: { list_id: process.env.MAILCHIMP_LIST_ID },
    settings: {
      subject_line: title,
      title,
      from_name: 'Bitcoin Brainiac',
      reply_to: process.env.MAILCHIMP_REPLY_TO,
    },
  });

  await mailchimp.campaigns.setContent(campaign.id, { html: content });
  await mailchimp.campaigns.send(campaign.id);

  return campaign;
}

function findMainStory(articles: any[]) {
  const priorityKeywords = [
    'etf', 'sec', 'federal', 'halving', 
    'record', 'crash', 'major', 'breaking', 'all-time high', 
    'all-time low', 'record high', 'record low',  'all-time highs'
  ];
  
  let topScore = 0;
  let mainStory = {
    headline: 'Bitcoin Daily Update',
    score: 0
  };

  articles.forEach((article, index) => {
    let score = (articles.length - index) * 10;
    
    priorityKeywords.forEach(keyword => {
      if (article.title.toLowerCase().includes(keyword)) {
        score += 20;
      }
      if (article.summary.toLowerCase().includes(keyword)) {
        score += 10;
      }
    });

    if (score > topScore) {
      topScore = score;
      let headline = article.title
        .replace(/^Breaking:?\s*/i, '')
        .replace(/^Just In:?\s*/i, '')
        .replace(/^Report:?\s*/i, '')
        .split(' ')
        .slice(0, 5)
        .join(' ');
      
      if (headline.length < article.title.length) {
        headline += '...';
      }

      mainStory = {
        headline,
        score
      };
    }
  });

  return mainStory;
}

async function storeNewsletter(campaignId: string, content: string, bitcoinPrice: number) {
  try {
    console.log('Storing newsletter with price:', bitcoinPrice);
    
    const newsletter = new Newsletter({
      id: new mongoose.Types.ObjectId().toString(),
      title: 'Bitcoin Newsletter',
      subtitle: 'Daily Bitcoin Market Update',
      content,
      sentAt: new Date(),
      bitcoinPrice,
      campaignId,
      priceChange: 0
    });
    
    const saved = await newsletter.save();
    return saved;
  } catch (error) {
    console.error('Failed to store newsletter:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const context = 'Newsletter Generation';
  const metadata: any = {};
  
  try {
    console.log('🚀 Starting newsletter generation:', new Date().toISOString());
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected');
    metadata.dbConnection = 'success';
    
    // Scrape articles
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_BASE_URL;
    const scrapeUrl = `${baseUrl}/api/scrape`;
    console.log('Fetching articles from:', scrapeUrl);
    const scrapeRes = await fetch(scrapeUrl);
    const data = await scrapeRes.json();
    
    if (!scrapeRes.ok || data.error) {
      console.error('Scrape response error:', data);
      throw new Error(data.error || 'Failed to scrape articles');
    }
    
    if (!data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
      console.error('Invalid articles data:', data);
      throw new Error('No articles found');
    }
    
    metadata.articlesCount = data.articles.length;
    console.log(`Found ${data.articles.length} articles`);
    
    // Get Bitcoin price
    const bitcoinData = await getBitcoinPrice();
    metadata.bitcoinPrice = bitcoinData;

    if (!bitcoinData?.price) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    // Generate newsletter
    const newsletterContent = await generateNewsletter(data.articles, {
      price: Number(bitcoinData.price),
      change24h: Number(bitcoinData.change24h)
    });
    metadata.contentGenerated = !!newsletterContent;
    
    if (!newsletterContent) {
      throw new Error('Failed to generate newsletter content');
    }

    // Create and send campaign
    const campaign = await createMailchimpCampaign(bitcoinData.price, newsletterContent, data.articles);
    metadata.campaignId = campaign.id;
    
    // Before storing newsletter
    console.log('💾 About to store newsletter with:', {
      campaignId: campaign.id,
      contentLength: newsletterContent?.length,
      bitcoinPrice: bitcoinData.price
    });
    
    const newsletter = await storeNewsletter(campaign.id, newsletterContent, bitcoinData.price);
    console.log('✅ Newsletter stored:', newsletter);

    return NextResponse.json({ 
      success: true,
      campaignId: campaign.id,
      newsletterId: newsletter.id
    });
    
  } catch (error: any) {
    console.error('❌ Newsletter generation failed:', error);
    await logError(error, context, metadata);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
