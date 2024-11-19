import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

export const runtime = 'nodejs';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    const response = await mailchimp.lists.getListMember(
      process.env.MAILCHIMP_LIST_ID!,
      email.toLowerCase()
    );

    if (response.status === 'subscribed') {
      await mailchimp.lists.updateListMember(
        process.env.MAILCHIMP_LIST_ID!,
        email.toLowerCase(),
        {
          status: 'unsubscribed'
        }
      );
      return NextResponse.json({ 
        success: true,
        message: 'Successfully unsubscribed from the newsletter.' 
      });
    } else {
      return NextResponse.json(
        { error: 'This email is not currently subscribed.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'This email is not currently subscribed.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request.' },
      { status: 500 }
    );
  }
}