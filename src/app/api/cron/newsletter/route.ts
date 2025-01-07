import { NextResponse } from 'next/server';
import { createNewsletter } from '@/lib/newsletter';

export async function GET(request: Request) {
  // Check for scheduled run
  const authHeader = request.headers.get('x-cron-auth');
  const isScheduledRun = authHeader === process.env.CRON_SECRET;

  if (!isScheduledRun) {
    console.log('Unauthorized newsletter creation attempt');
    return NextResponse.json({ message: 'Not a scheduled run' }, { status: 400 });
  }

  try {
    // Move your newsletter creation logic to a separate function in lib/newsletter.ts
    const result = await createNewsletter();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Newsletter creation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
