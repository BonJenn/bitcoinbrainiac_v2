import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import type { Newsletter as NewsletterType } from '@/types/newsletter';
import mongoose from 'mongoose';

interface MongoNewsletter {
  _id: mongoose.Types.ObjectId | string;
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  sentAt: Date;
  bitcoinPrice: number;
  priceChange: number;
  __v?: number;
}

export async function GET(request: Request) {
  const id = request.url.split('/').pop();
  console.log('Newsletter detail API hit for ID:', id);
  
  try {
    await connectToDatabase();
    
    if (!id) {
      console.log('Invalid newsletter ID provided');
      return NextResponse.json(
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    const newsletter = await Newsletter.findOne({
      $or: [
        { id },
        { _id: id }
      ]
    }).lean().exec() as unknown as MongoNewsletter;
    
    if (!newsletter) {
      console.log('Newsletter not found for ID:', id);
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }
    
    const formattedNewsletter: NewsletterType = {
      id: newsletter.id || newsletter._id.toString(),
      title: newsletter.title,
      subtitle: newsletter.subtitle,
      content: newsletter.content,
      sentAt: newsletter.sentAt,
      bitcoinPrice: newsletter.bitcoinPrice,
      priceChange: newsletter.priceChange
    };
    
    return NextResponse.json(formattedNewsletter);
  } catch (error: any) {
    console.error('Error fetching newsletter:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch newsletter' },
      { status: 500 }
    );
  }
}
