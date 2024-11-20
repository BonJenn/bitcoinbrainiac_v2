import { NextResponse } from 'next/server';
import { sendNewsletter } from './route'; // Adjust the import path if necessary

export async function GET() {
  try {
    await sendNewsletter();
    return NextResponse.json({ success: true, message: 'Newsletter sent successfully' });
  } catch (error: any) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json({ error: error.message || 'Failed to send newsletter' }, { status: 500 });
  }
}
