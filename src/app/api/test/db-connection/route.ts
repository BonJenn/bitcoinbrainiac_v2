import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    
    return NextResponse.json({
      success: true,
      connectionState: mongoose.connection.readyState,
      databaseName: mongoose.connection.db?.databaseName || 'Not connected'
    });
  } catch (error: any) {
    console.error('Connection test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { 
      status: 500 
    });
  }
}
