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

    // Test Mailchimp connection
    console.log('Checking Mailchimp API connection...');
    const response = await mailchimp.ping.get();
    console.log('Mailchimp ping response:', response);

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

    // Send test email
    console.log('Sending test email to:', process.env.TEST_EMAIL);
    await mailchimp.campaigns.sendTestEmail(campaign.id, {
      test_emails: [process.env.TEST_EMAIL],
      send_type: 'html'
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      campaignId: campaign.id,
      mailchimpHealth: response,
      debug: {
        server: process.env.MAILCHIMP_SERVER_PREFIX,
        testEmail: process.env.TEST_EMAIL,
        hasApiKey: !!process.env.MAILCHIMP_API_KEY
      }
    });
  } catch (error: any) {
    console.error('Mailchimp test failed:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack,
      details: error.response?.body || error.response || 'No additional details',
      debug: {
        server: process.env.MAILCHIMP_SERVER_PREFIX,
        testEmail: process.env.TEST_EMAIL,
        hasApiKey: !!process.env.MAILCHIMP_API_KEY
      }
    }, { 
      status: 500 
    });
  }
} 