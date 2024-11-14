import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format.' },
        { status: 400 }
      );
    }

    // Create MD5 hash of lowercase email
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

    // Update member status to unsubscribed
    const response = await fetch(
      `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'unsubscribed',
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Mailchimp API Error:', error);
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'This email is not subscribed to our newsletter.' },
          { status: 404 }
        );
      }
      throw new Error(error.detail || 'Failed to unsubscribe');
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from the newsletter.',
    });
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing unsubscribe request' },
      { status: 500 }
    );
  }
}