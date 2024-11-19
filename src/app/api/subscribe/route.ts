import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Add your Mailchimp API integration here
    // For testing, we'll just return a success response
    return NextResponse.json({ 
      success: true,
      message: 'Subscription successful' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
