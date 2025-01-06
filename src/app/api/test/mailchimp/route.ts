import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

export async function GET() {
  try {
    console.log('Testing Mailchimp connection...');
    
    if (!process.env.TEST_EMAIL) {
      throw new Error('TEST_EMAIL environment variable not set');
    }

    // Setup Mailchimp
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    // Test Mailchimp connection by listing audiences
    console.log('Checking Mailchimp API connection...');
    const response = await mailchimp.lists.list();
    console.log('Mailchimp lists response:', response);

    // Create a simple test campaign
    console.log('Creating test campaign...');
    const campaign = await mailchimp.campaigns.create({
      type: 'regular',
      settings: {
        subject_line: 'Simple Test Email',
        preview_text: 'Testing Mailchimp Integration',
        title: 'Test Campaign',
        from_name: 'Bitcoin Brainiac',
        reply_to: process.env.TEST_EMAIL,
      }
    });

    // Set simple content
    await mailchimp.campaigns.setContent(campaign.id, {
      html: '<h1>Test Email</h1><p>If you see this, the Mailchimp integration is working!</p>'
    });

    return NextResponse.json({ 
      success: true,
      campaign: campaign.id
    });
  } catch (error: any) {
    console.error('Mailchimp test failed:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.response?.body || 'No additional details'
    }, { 
      status: 500 
    });
  }
} 