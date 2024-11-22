import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

type Context = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function GET(
  request: Request,
  context: Context
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