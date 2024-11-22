import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import { type NextRequest } from 'next/server';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await connectToDatabase();
    
    const newsletter = await Newsletter.findOne({ id: context.params.id });
    
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