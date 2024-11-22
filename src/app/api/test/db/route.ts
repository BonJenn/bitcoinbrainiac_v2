import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    
    if (!conn.connection.db) {
      throw new Error('Database connection not established');
    }

    // Simple test query
    const collections = await conn.connection.db.listCollections().toArray();
    
    return NextResponse.json({ 
      status: 'Connected successfully!',
      connectionState: mongoose.connection.readyState,
      collections: collections.map(c => c.name),
      databaseName: conn.connection.db.databaseName
    });
  } catch (error: any) {
    console.error('Database test failed:', error);
    return NextResponse.json({ 
      status: 'Connection failed', 
      error: error.message 
    }, { 
      status: 500 
    });
  }
}