import { NextResponse } from 'next/server';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { generateNewsletter } from '@/lib/openai';
import { getBitcoinPrice } from '@/lib/price';
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

export async function GET(request: Request) {
  try {
    // 1. Gather content
    const [articles, bitcoinPrice] = await Promise.all([
      scrapeBitcoinNews(),
      getBitcoinPrice(),
    ]);

    if (!bitcoinPrice) {
      throw new Error('Failed to fetch Bitcoin price');
    }

    // 2. Generate newsletter content
    const newsletterContent = await generateNewsletter(articles, bitcoinPrice);

    // 3. Create and send campaign
    const campaign = await mailchimp.campaigns.create({
      type: 'regular',
      recipients: {
        list_id: process.env.MAILCHIMP_LIST_ID!,
      },
      settings: {
        subject_line: `Bitcoin Daily: BTC at $${bitcoinPrice.toLocaleString()}`,
        preview_text: 'Your daily dose of Bitcoin news',
        title: `Bitcoin Newsletter - ${new Date().toLocaleDateString()}`,
        from_name: 'Bitcoin Brainiac',
        reply_to: process.env.MAILCHIMP_REPLY_TO,
      },
    });

    await mailchimp.campaigns.setContent(campaign.id, {
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${newsletterContent.replace(/\n/g, '<br>')}
          </body>
        </html>
      `,
    });

    await mailchimp.campaigns.send(campaign.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
