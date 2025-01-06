import cron from 'node-cron';
import { postDailyTweets } from './social';
import { connectToDatabase } from './db';
import Newsletter from '@/models/Newsletter';
import { scrapeBitcoinNews } from './scraper';

export function initializeCronJobs() {
  // 6:05 AM PST
  cron.schedule('5 6 * * *', async () => {
    try {
      await connectToDatabase();
      const latestNewsletter = await Newsletter.findOne().sort({ sentAt: -1 });
      const articles = await scrapeBitcoinNews();
      await postDailyTweets(latestNewsletter, articles);
    } catch (error) {
      console.error('Cron job failed:', error);
    }
  }, {
    timezone: "America/Los_Angeles"
  });
} 