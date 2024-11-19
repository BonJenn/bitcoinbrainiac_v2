import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

export async function GET() {
  try {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    const response = await mailchimp.lists.getListMember(
      process.env.MAILCHIMP_LIST_ID!,
      process.env.TEST_EMAIL!.toLowerCase()
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