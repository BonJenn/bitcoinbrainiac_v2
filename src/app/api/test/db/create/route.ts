import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET() {
  try {
    await connectToDatabase();
    
    const testNewsletter = await Newsletter.create({
      id: 'test-001',
      title: 'Test Newsletter',
      subtitle: 'Testing Database Connection',
      content: 'This is a test newsletter to verify database operations.',
      sentAt: new Date(),
      bitcoinPrice: 45000,
      priceChange: 2.5
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Test newsletter created successfully',
      newsletter: testNewsletter
    });
  } catch (error: any) {
    console.error('Failed to create test newsletter:', error);
    return NextResponse.json({ 
      error: 'Failed to create test newsletter',
      details: error.message
    }, { 
      status: 500 
    });
  }
}