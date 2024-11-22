import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

interface RouteParams {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    await connectToDatabase();
    
    const newsletter = await Newsletter.findOne({ id: params.id });
    
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