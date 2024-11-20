import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import ErrorLog from '@/app/api/cron/newsletter/error-log';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    await connectToDatabase();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Gather 24h stats
    const [
      newsletterCount,
      errors,
      serviceChecks
    ] = await Promise.all([
      Newsletter.countDocuments({ sentAt: { $gte: yesterday } }),
      ErrorLog.find({ timestamp: { $gte: yesterday } }),
      // Add your service check collection here
    ]);

    // Calculate uptime
    const uptimePercentage = 100; // Replace with actual uptime calculation

    await sendNotification({
      subject: 'Daily Health Report',
      context: 'System Health',
      template: 'dailyHealth',
      priority: 'low',
      metadata: {
        uptime: uptimePercentage,
        newslettersSent: newsletterCount,
        recentErrors: errors,
        services: {
          database: true, // Replace with actual service status
          scraper: true,
          mailchimp: true,
          priceApi: true
        },
        avgResponseTime: 150 // Replace with actual response time
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to generate health report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
