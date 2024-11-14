import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    const response = await fetch(
      `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/${Buffer.from(email.toLowerCase()).toString('hex')}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (error.status === 404) {
        return NextResponse.json(
          { error: "This email is not subscribed to our newsletter." },
          { status: 404 }
        );
      }
      throw new Error(error.detail || 'Failed to unsubscribe');
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully unsubscribed from the newsletter.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error processing unsubscribe request' },
      { status: 500 }
    );
  }
}