import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import type { Newsletter as NewsletterType } from '@/types/newsletter';

export async function GET() {
  try {
    await connectToDatabase();
    
    const docs = await Newsletter.find()
      .sort({ sentAt: -1 })
      .limit(50);
    
    const newsletters = docs.map(doc => ({
      id: doc.id || doc._id.toString(),
      title: doc.title,
      subtitle: doc.subtitle,
      content: doc.content,
      sentAt: doc.sentAt,
      bitcoinPrice: doc.bitcoinPrice,
      priceChange: doc.priceChange
    } satisfies NewsletterType));
    
    return NextResponse.json(newsletters);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}