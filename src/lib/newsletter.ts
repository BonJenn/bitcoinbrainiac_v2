import { connectToDatabase } from '@/lib/db';
import { generateNewsletter } from '@/lib/openai';
import Newsletter from '@/models/Newsletter';
import mailchimp from '@mailchimp/mailchimp_marketing';
import mongoose from 'mongoose';
import { fetchArticles, fetchBitcoinData } from '@/lib/data';
import { createMailchimpCampaign } from '@/app/api/cron/newsletter/route';
import { postDailyTweets } from '@/lib/social';

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
    
    if (!content) {
      throw new Error('Failed to generate newsletter content');
    }
    
    console.log('Newsletter content generated');

    // Create Mailchimp campaign
    console.log('Creating Mailchimp campaign...');
    const campaign = await createMailchimpCampaign(bitcoinData.price, content, articles);

    // Save to database
    const newsletter = new Newsletter({
      id: new mongoose.Types.ObjectId().toString(),
      title: campaign.settings.subject_line,
      subtitle: campaign.settings.preview_text || 'Daily Bitcoin Market Update',
      content,
      sentAt: new Date(),
      bitcoinPrice: bitcoinData.price,
      priceChange: bitcoinData.change24h,
      campaignId: campaign.id,
      fearGreedIndex: bitcoinData.fearGreedIndex
    });
    
    const saved = await newsletter.save();

    // Post to X with articles
    await postDailyTweets(saved, articles);

    return { campaignId: campaign.id, newsletterId: saved.id };
  } catch (error) {
    console.error('💥 Failed to send newsletter:', error);
    throw error;
  }
}