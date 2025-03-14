import { connectToDatabase } from '@/lib/db';
import { generateNewsletter } from '@/lib/openai';
import Newsletter from '@/models/Newsletter';
import mailchimp from '@mailchimp/mailchimp_marketing';
import mongoose from 'mongoose';
import { fetchArticles, fetchBitcoinData } from '@/lib/data';
import { postDailyTweets } from '@/lib/social';
import { scrapeBitcoinNews } from '@/lib/scraper';
import cron from 'node-cron';

async function createMailchimpCampaign(bitcoinPrice: number, content: string, articles: any[]) {
  try {
    console.log('🔄 Configuring Mailchimp...');
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    // Get the main story from the first article
    const mainStory = articles[0]?.title || 'Bitcoin News';
    const today = new Date().toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    console.log('📧 Creating Mailchimp campaign...');
    const campaign = await mailchimp.campaigns.create({
      type: "regular",
      recipients: {
        list_id: process.env.MAILCHIMP_LIST_ID,
      },
      settings: {
        subject_line: `${mainStory} | BTC $${bitcoinPrice.toLocaleString()}`,
        preview_text: "Your daily dose of Bitcoin news and analysis",
        title: `Bitcoin Brainiac Daily - ${today}`,
        from_name: "Bitcoin Brainiac",
        reply_to: "hello@bitcoinbrainiac.net",
        template_id: parseInt(process.env.MAILCHIMP_TEMPLATE_ID || "0"),
      },
    });
    
    // Set the campaign content
    console.log('📝 Setting campaign content...');
    await mailchimp.campaigns.setContent(campaign.id, {
      html: content
    });
    
    console.log('✅ Campaign created and content set:', campaign.id);
    return campaign;
  } catch (error) {
    console.error('❌ Failed to create Mailchimp campaign:', error);
    throw error;
  }
}

export async function createNewsletter() {
  try {
    await connectToDatabase();
    
    const articles = await fetchArticles();
    const bitcoinData = await fetchBitcoinData();

    if (!bitcoinData) {
      throw new Error('Failed to fetch Bitcoin data');
    }

    const content = await generateNewsletter(articles, bitcoinData);
    
    if (!content) {
      throw new Error('Failed to generate newsletter content');
    }

    const campaign = await createMailchimpCampaign(bitcoinData.price, content, articles);

    return { campaign, content, bitcoinData, articles };
  } catch (error) {
    console.error('Failed to create newsletter:', error);
    throw error;
  }
}

export async function sendNewsletter() {
  try {
    await connectToDatabase();
    
    // Find the latest unsent newsletter
    const newsletter = await Newsletter.findOne({ sent: false }).sort({ createdAt: -1 });
    
    if (!newsletter) {
      throw new Error('No unsent newsletter found');
    }

    // Send via Mailchimp
    const campaign = await mailchimp.campaigns.send(newsletter.campaignId);
    
    // Update newsletter status
    await Newsletter.findByIdAndUpdate(newsletter._id, {
      sent: true,
      sentAt: new Date(),
      mailchimpResponse: campaign
    });

    return campaign;
  } catch (error) {
    console.error('Failed to send newsletter:', error);
    throw error;
  }
}

export function initializeCronJobs() {
  // Create newsletter at 5:00 AM PST
  cron.schedule('0 5 * * *', async () => {
    try {
      await createNewsletter();
    } catch (error) {
      console.error('Newsletter creation failed:', error);
    }
  }, {
    timezone: "America/Los_Angeles"
  });

  // Send newsletter at 5:30 AM PST
  cron.schedule('30 5 * * *', async () => {
    try {
      await sendNewsletter();
    } catch (error) {
      console.error('Newsletter sending failed:', error);
    }
  }, {
    timezone: "America/Los_Angeles"
  });

  // Existing tweet job at 6:05 AM PST
  cron.schedule('5 6 * * *', async () => {
    try {
      await connectToDatabase();
      const latestNewsletter = await Newsletter.findOne().sort({ sentAt: -1 });
      const articles = await scrapeBitcoinNews();
      await postDailyTweets(latestNewsletter, articles);
    } catch (error) {
      console.error('Tweet posting failed:', error);
    }
  }, {
    timezone: "America/Los_Angeles"
  });
}