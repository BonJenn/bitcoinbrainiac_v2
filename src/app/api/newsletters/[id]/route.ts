import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // Extract the 'id' from the URL

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    const newsletter = await Newsletter.findOne({ id });
    
    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(newsletter);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch newsletter' },
      { status: 500 }
    );
  }
}