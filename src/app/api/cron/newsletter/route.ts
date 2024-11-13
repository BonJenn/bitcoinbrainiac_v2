import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/openai';
import { getBitcoinPrice } from '@/lib/price';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Fetch articles from the scraping endpoint
    const scrapeRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/scrape`);
    const { articles } = await scrapeRes.json();
    
    const bitcoinPrice = await getBitcoinPrice();
    
    const [newsletterContent] = await Promise.all([
      generateNewsletter(articles, bitcoinPrice),
    ]);

    // Rest of your newsletter sending logic...
    const response = await fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
              ${newsletterContent.replace(/\n/g, '<br>')}
            </body>
          </html>
        `,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
