import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Direct MongoDB connection without any wrapper
const MONGODB_URI = process.env.DATABASE_URL;

export async function GET() {
  try {
    // Force a new connection
    await mongoose.disconnect();
    
    // Connect directly
    await mongoose.connect(MONGODB_URI as string);
    
    // Create a simple test collection and document
    const TestSchema = new mongoose.Schema({
      message: String,
      timestamp: Date
    });
    
    const TestModel = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    // Try to write
    const result = await TestModel.create({
      message: 'Test write at ' + new Date().toISOString(),
      timestamp: new Date()
    });
    
    return NextResponse.json({
      success: true,
      written: result
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { 
      status: 500 
    });
  }
}
