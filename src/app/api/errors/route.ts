import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import ErrorLog from '@/app/api/cron/newsletter/error-log';

export async function GET() {
  try {
    await connectToDatabase();
    const errors = await ErrorLog.find()
      .sort({ timestamp: -1 })
      .limit(20);
    
    return NextResponse.json(errors);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
