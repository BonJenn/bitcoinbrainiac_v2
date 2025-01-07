import { NextResponse } from 'next/server';
import { createNewsletter } from '@/lib/newsletter';

export async function GET(request: Request) {
  // Temporarily allow all runs
  try {
    console.log('📰 Starting newsletter creation...');
    const result = await createNewsletter();
    console.log('✅ Newsletter created successfully');
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('❌ Newsletter creation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
