import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX) {
      throw new Error('Missing required Mailchimp configuration');
    }

    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    // Try to get the member's status first
    try {
      const existingMember = await mailchimp.lists.getListMember(
        process.env.MAILCHIMP_LIST_ID!,
        email.toLowerCase()
      );

      // If they're unsubscribed, update their status to pending
      if (existingMember.status === 'unsubscribed') {
        await mailchimp.lists.updateListMember(
          process.env.MAILCHIMP_LIST_ID!,
          email.toLowerCase(),
          {
            status: 'pending' // This triggers the opt-in email
          }
        );
      }
    } catch (error: any) {
      // If member doesn't exist (404), add them as new
      if (error.status === 404) {
        await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
          email_address: email.toLowerCase(),
          status: 'pending',
          merge_fields: {}
        });
      } else {
        throw error;
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Please check your email to confirm subscription.' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
