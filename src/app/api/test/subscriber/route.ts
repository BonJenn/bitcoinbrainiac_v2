import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

export async function GET() {
  try {
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX) {
      throw new Error('Missing required Mailchimp configuration');
    }

    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    if (!process.env.MAILCHIMP_LIST_ID || !process.env.TEST_EMAIL) {
      throw new Error('Missing required Mailchimp list or test email configuration');
    }

    const response = await mailchimp.lists.getListMember(
      process.env.MAILCHIMP_LIST_ID,
      process.env.TEST_EMAIL.toLowerCase()
    );

    return NextResponse.json({ 
      status: response.status,
      email: response.email_address 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      status: error.status 
    }, { 
      status: 500 
    });
  }
}