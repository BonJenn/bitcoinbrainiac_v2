import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import ErrorLog from '@/app/api/cron/newsletter/error-log';

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch Mailchimp stats
    const [campaignStats, listStats] = await Promise.all([
      fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/reports`, {
        headers: {
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
      
      fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json())
    ]);

    // Get newsletter stats from our database
    const [
      totalNewsletters,
      recentErrors,
      lastNewsletter,
      averageBitcoinPrice
    ] = await Promise.all([
      Newsletter.countDocuments(),
      ErrorLog.find().sort({ timestamp: -1 }).limit(5),
      Newsletter.findOne().sort({ sentAt: -1 }),
      Newsletter.aggregate([
        {
          $group: {
            _id: null,
            avgPrice: { $avg: '$bitcoinPrice' }
          }
        }
      ])
    ]);

    return NextResponse.json({
      mailchimp: {
        subscribers: listStats.stats.member_count,
        averageOpenRate: campaignStats.average_open_rate,
        averageClickRate: campaignStats.average_click_rate,
        recentCampaigns: campaignStats.campaigns?.slice(0, 5)
      },
      newsletters: {
        total: totalNewsletters,
        lastSent: lastNewsletter?.sentAt,
        averageBitcoinPrice: averageBitcoinPrice[0]?.avgPrice
      },
      errors: {
        recent: recentErrors,
        count: await ErrorLog.countDocuments()
      },
      status: {
        healthy: recentErrors.length === 0,
        lastError: recentErrors[0]?.timestamp
      }
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
