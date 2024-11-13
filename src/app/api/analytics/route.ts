import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    // Fetch campaign reports from Mailchimp
    const reportsResponse = await fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/reports`, {
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!reportsResponse.ok) {
      throw new Error('Failed to fetch campaign reports');
    }

    const reportsData = await reportsResponse.json();

    // Fetch list growth
    const listResponse = await fetch(`https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/growth-history`, {
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!listResponse.ok) {
      throw new Error('Failed to fetch list growth data');
    }

    const listData = await listResponse.json();

    return NextResponse.json({
      campaigns: reportsData,
      growth: listData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
