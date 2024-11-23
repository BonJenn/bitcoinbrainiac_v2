import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET() {
  console.log('Newsletter list API endpoint hit');
  console.log('Current timestamp:', new Date().toISOString());
  
  try {
    console.log('Attempting database connection...');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    console.log('Querying newsletters...');
    const newsletters = await Newsletter.find()
      .sort({ sentAt: -1 })
      .limit(50)
      .lean()
      .then(docs => docs.map(doc => ({
        ...doc,
        id: doc.id || doc._id.toString()
      })));
    
    console.log(`Found ${newsletters.length} newsletters`);
    if (newsletters.length > 0) {
      console.log('Sample newsletter:', newsletters[0]);
    }
    
    return NextResponse.json(newsletters);
  } catch (error: any) {
    console.error('Newsletter API error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}