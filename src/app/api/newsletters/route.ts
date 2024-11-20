import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected successfully');
    
    console.log('Fetching newsletters...');
    const newsletters = await Newsletter.find()
      .sort({ sentAt: -1 })
      .limit(50);
    
    console.log('Newsletters found:', newsletters.length);
    return NextResponse.json(newsletters);
  } catch (error: any) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}