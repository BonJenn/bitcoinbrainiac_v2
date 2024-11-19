import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';
import md5 from 'js-md5';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const subscriberHash = md5(email.toLowerCase());

    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX) {
      throw new Error('Missing required Mailchimp configuration');
    }

    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });
    
    try {
      const response = await mailchimp.lists.getListMember(
        process.env.MAILCHIMP_LIST_ID!,
        subscriberHash
      );

      console.log('Member status before unsubscribe:', response.status);

      if (response.status === 'subscribed') {
        await mailchimp.lists.updateListMember(
          process.env.MAILCHIMP_LIST_ID!,
          subscriberHash,
          {
            status: 'unsubscribed',
            email_address: email.toLowerCase()
          }
        );
        console.log('Successfully unsubscribed member');
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
      throw error;
    }
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process unsubscribe request.' },
      { status: 500 }
    );
  }
}