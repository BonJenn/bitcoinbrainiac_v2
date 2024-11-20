import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import { getBitcoinPrice } from '@/lib/price';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  const status = {
    database: false,
    scraper: false,
    priceApi: false,
    mailchimp: false,
    lastNewsletter: null,
    systemHealth: 'degraded'
  };

  try {
    // Check database
    await connectToDatabase();
    status.database = true;

    // Check scraper
    const articles = await scrapeBitcoinNews();
    status.scraper = articles && articles.length > 0;

    // Check price API
    const price = await getBitcoinPrice();
    status.priceApi = !!price;

    // Check Mailchimp
    const mailchimpRes = await fetch(
      `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/ping`, {
        headers: {
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        },
      }
    );
    status.mailchimp = mailchimpRes.ok;

    // Get last newsletter
    const lastNewsletter = await Newsletter.findOne().sort({ sentAt: -1 });
    status.lastNewsletter = lastNewsletter?.sentAt;

    // Calculate system health
    const services = Object.values(status).filter(v => typeof v === 'boolean');
    const healthyServices = services.filter(Boolean).length;
    status.systemHealth = healthyServices === services.length ? 'healthy' : 
                         healthyServices > services.length / 2 ? 'degraded' : 
                         'critical';

    // Send notification if system health is not healthy
    if (status.systemHealth !== 'healthy') {
      const failedServices = Object.entries(status)
        .filter(([key, value]) => typeof value === 'boolean' && !value)
        .map(([key]) => key);

      await sendNotification({
        subject: 'System Health Alert',
        context: 'Status Check',
        priority: status.systemHealth === 'critical' ? 'critical' : 'high',
        metadata: {
          systemHealth: status.systemHealth,
          failedServices,
          lastNewsletter: status.lastNewsletter,
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json(status);
  } catch (error: any) {
    await sendNotification({
      subject: 'Status Check Failed',
      context: 'Status Check',
      priority: 'critical',
      error,
      metadata: { status }
    });
    
    return NextResponse.json(status, { status: 500 });
  }
}
