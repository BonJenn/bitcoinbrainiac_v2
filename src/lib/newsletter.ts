import { connectToDatabase } from '@/lib/db';
import { generateNewsletter } from '@/lib/openai';
import Newsletter from '@/models/Newsletter';
import mailchimp from '@mailchimp/mailchimp_marketing';
import mongoose from 'mongoose';
import { fetchArticles, fetchBitcoinData } from '@/lib/data';

export async function sendNewsletter() {
  console.log('📨 Starting sendNewsletter function');
  try {
    // Connect to the database
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected');

    // Generate newsletter content
    console.log('Fetching articles and Bitcoin data...');
    const articles = await fetchArticles();
    const bitcoinData = await fetchBitcoinData();
    console.log('Data fetched:', { articlesCount: articles?.length, bitcoinPrice: bitcoinData?.price });

    if (!bitcoinData) {
      throw new Error('Failed to fetch Bitcoin data');
    }

    console.log('Generating newsletter content...');
    const content = await generateNewsletter(articles, bitcoinData);
    console.log('Newsletter content generated');

    // Create Mailchimp campaign
    console.log('Setting up Mailchimp...');
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    console.log('Creating Mailchimp campaign...');
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

    // Set campaign content and send
    await mailchimp.campaigns.setContent(campaign.id, { html: content });
    await mailchimp.campaigns.send(campaign.id);

    // Save to database
    const newsletter = new Newsletter({
      id: new mongoose.Types.ObjectId().toString(),
      title: 'Bitcoin Newsletter',
      subtitle: 'Daily Bitcoin Market Update',
      content,
      sentAt: new Date(),
      bitcoinPrice: bitcoinData.price,
      priceChange: bitcoinData.change24h,
      campaignId: campaign.id
    });
    
    const saved = await newsletter.save();
    return { campaignId: campaign.id, newsletterId: saved.id };
  } catch (error) {
    console.error('💥 Failed to send newsletter:', error);
    throw error;
  }
}