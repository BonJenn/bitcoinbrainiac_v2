import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    
    // Simple test query
    const collections = await conn.connection.db.listCollections().toArray();
    
    return NextResponse.json({ 
      status: 'Connected successfully!',
      collections: collections.map(c => c.name)
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      error: 'Failed to connect to database',
      details: error.message
    }, { 
      status: 500 
    });
  }
}