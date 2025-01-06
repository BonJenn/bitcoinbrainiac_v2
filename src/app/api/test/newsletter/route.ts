import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { getBitcoinPrice } from '@/lib/price';
import { postDailyTweets, generateNewsComment, generatePriceComment } from '@/lib/social';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET() {
  try {
    console.log('Starting test newsletter process...');
    
    if (!process.env.TEST_EMAIL) {
      throw new Error('TEST_EMAIL environment variable not set');
    }
    console.log('Using test email:', process.env.TEST_EMAIL);

    // Get real-time data
    console.log('Fetching articles and Bitcoin data...');
    const [articles, bitcoinData] = await Promise.all([
      scrapeBitcoinNews(),
      getBitcoinPrice()
    ]);
    console.log('Data fetched:', { 
      articlesCount: articles?.length, 
      bitcoinPrice: bitcoinData?.price 
    });

    // Generate newsletter content
    console.log('Generating newsletter content...');
    const content = await generateNewsletter(articles, bitcoinData);
    console.log('Newsletter content generated');

    // Setup Mailchimp
    console.log('Setting up Mailchimp...');
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    // Create test campaign
    console.log('Creating test campaign...');
    const campaign = await mailchimp.campaigns.create({
      type: 'regular',
      settings: {
        subject_line: `[TEST] Bitcoin Daily - ${new Date().toLocaleDateString()}`,
        preview_text: 'Test Newsletter - Do Not Share',
        title: `Test Newsletter ${new Date().toISOString()}`,
        from_name: 'Bitcoin Brainiac',
        reply_to: process.env.TEST_EMAIL,
        to_name: '*|FNAME|*'
      }
    });
    console.log('Campaign created:', campaign.id);

    // Set campaign content
    console.log('Setting campaign content...');
    await mailchimp.campaigns.setContent(campaign.id, {
      html: content
    });

    // Send test email
    console.log('Sending test email...');
    await mailchimp.campaigns.sendTestEmail(campaign.id, {
      test_emails: [process.env.TEST_EMAIL],
      send_type: 'html'
    });
    console.log('Test email sent');

    // Save to database with test flag
    console.log('Saving to database...');
    await connectToDatabase();
    const newsletter = new Newsletter({
      id: `test-${new Date().getTime()}`,
      title: '[TEST] Bitcoin Newsletter',
      subtitle: 'Test Preview',
      content,
      sentAt: new Date(),
      bitcoinPrice: bitcoinData.price,
      priceChange: bitcoinData.change24h,
      campaignId: campaign.id,
      fearGreedIndex: bitcoinData.fearGreedIndex,
      isTest: true
    });
    
    const saved = await newsletter.save();
    console.log('Newsletter saved to database');

    // Generate tweet previews
    console.log('Generating tweet previews...');
    const tweetPreviews = {
      newsletterTweet: `📰 ${newsletter.title}\n\nRead today's newsletter: https://bitcoinbrainiac.net/newsletters/${newsletter.id}`,
      newsComment: await generateNewsComment(articles[0]),
      priceComment: await generatePriceComment(bitcoinData.price, bitcoinData.change24h)
    };
    console.log('Tweet previews generated:', tweetPreviews);

    return NextResponse.json({
      success: true,
      message: `Test newsletter sent to ${process.env.TEST_EMAIL}`,
      campaignId: campaign.id,
      newsletterId: saved.id,
      tweetPreviews,
      debug: {
        mailchimpServer: process.env.MAILCHIMP_SERVER_PREFIX,
        hasMailchimpKey: !!process.env.MAILCHIMP_API_KEY,
        testEmail: process.env.TEST_EMAIL
      }
    });
  } catch (error: any) {
    console.error('Test newsletter failed:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack,
      debug: {
        mailchimpServer: process.env.MAILCHIMP_SERVER_PREFIX,
        hasMailchimpKey: !!process.env.MAILCHIMP_API_KEY,
        testEmail: process.env.TEST_EMAIL
      }
    }, { 
      status: 500 
    });
  }
}
