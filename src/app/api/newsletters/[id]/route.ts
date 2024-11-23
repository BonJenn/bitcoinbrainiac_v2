import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params; // Extract `id` from `params`

  console.log('Newsletter detail API hit for ID:', id);

  try {
    // Connect to the database
    await connectToDatabase();

    // Check if the ID is provided
    if (!id) {
      console.log('Invalid newsletter ID provided');
      return NextResponse.json(
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    // Fetch the newsletter from the database by ID (or ObjectId)
    const newsletter = await Newsletter.findOne({
      $or: [{ id }, { _id: id }],
    }).lean();

    // If the newsletter isn't found, return a 404 error
    if (!newsletter) {
      console.log('Newsletter not found for ID:', id);
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Format the newsletter data for the response
    const formattedNewsletter = {
      id: newsletter.id || newsletter._id.toString(),
      title: newsletter.title,
      subtitle: newsletter.subtitle,
      content: newsletter.content,
      sentAt: newsletter.sentAt,
      bitcoinPrice: newsletter.bitcoinPrice,
      priceChange: newsletter.priceChange,
    };

    // Return the formatted newsletter as a JSON response
    return NextResponse.json(formattedNewsletter);
  } catch (error: any) {
    // Catch any errors and return a 500 response with the error message
    console.error('Error fetching newsletter:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch newsletter' },
      { status: 500 }
    );
  }
}
