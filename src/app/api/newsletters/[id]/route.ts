import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import type { Newsletter as NewsletterType } from '@/types/newsletter';

export async function GET(request: Request) {
  const id = request.url.split('/').pop();
  
  try {
    await connectToDatabase();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    const doc = await Newsletter.findOne({
      $or: [
        { id },
        { _id: id }
      ]
    });

    if (!doc) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }
    
    // Convert to plain object and format
    const newsletter = {
      id: doc.id || doc._id.toString(),
      title: doc.title,
      subtitle: doc.subtitle,
      content: doc.content,
      sentAt: doc.sentAt,
      bitcoinPrice: doc.bitcoinPrice,
      priceChange: doc.priceChange
    } satisfies NewsletterType;
    
    return NextResponse.json(newsletter);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch newsletter' },
      { status: 500 }
    );
  }
}
