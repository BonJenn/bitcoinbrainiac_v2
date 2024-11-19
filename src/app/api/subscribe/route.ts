import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';
import md5 from 'js-md5';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const subscriberHash = md5.hex(email.toLowerCase());

    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX) {
      throw new Error('Missing required Mailchimp configuration');
    }

    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    try {
      const existingMember = await mailchimp.lists.getListMember(
        process.env.MAILCHIMP_LIST_ID!,
        subscriberHash
      );

      console.log('Existing member status:', existingMember.status);

      if (existingMember.status === 'unsubscribed') {
        await mailchimp.lists.deleteListMember(
          process.env.MAILCHIMP_LIST_ID!,
          subscriberHash
        );
        
        await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
          email_address: email.toLowerCase(),
          status: 'pending',
          merge_fields: {}
        });
        console.log('Deleted and re-added unsubscribed member');
      }
    } catch (error: any) {
      if (error.status === 404) {
        await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
          email_address: email.toLowerCase(),
          status: 'pending',
          merge_fields: {}
        });
        console.log('Added new member');
      } else {
        throw error;
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Please check your email to confirm subscription.' 
    });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
