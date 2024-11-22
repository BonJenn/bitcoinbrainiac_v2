import { NextResponse } from 'next/server';
import { sendNewsletter } from '@/lib/newsletter';
import { logError } from '@/lib/logger';

export const maxDuration = 60;

export async function GET() {
  console.log('🚀 Newsletter send endpoint hit');
  try {
    console.log('Calling sendNewsletter function...');
    const result = await sendNewsletter();
    console.log('sendNewsletter result:', result);
    return NextResponse.json({ success: true, message: 'Newsletter sent successfully' });
  } catch (error: any) {
    console.error('💥 Error sending newsletter:', error);
    await logError(error, 'Newsletter Cron Job', {
      timestamp: new Date().toISOString(),
      endpoint: '/api/cron/newsletter/send'
    });
    return NextResponse.json({ error: error.message || 'Failed to send newsletter' }, { status: 500 });
  }
}
