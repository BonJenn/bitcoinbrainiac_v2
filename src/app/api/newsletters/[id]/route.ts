import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
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
    }).lean();
    
    if (!newsletter) {
      console.log('Newsletter not found for ID:', id);
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }
    
    const formattedNewsletter = {
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
