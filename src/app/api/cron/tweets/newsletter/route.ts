import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import { xClient } from '@/lib/x';
import { getRandomBitcoinMeme } from '@/lib/social';
import axios from 'axios';

export async function GET(request: Request) {
  // Check for scheduled run
  const authHeader = request.headers.get('x-cron-auth');
  const isScheduledRun = authHeader === process.env.CRON_SECRET;

  if (!isScheduledRun) {
    return NextResponse.json({ message: 'Not a scheduled run' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const newsletter = await Newsletter.findOne().sort({ sentAt: -1 });
    
    if (!newsletter) {
      throw new Error('No newsletter found');
    }

    const newsletterUrl = `https://bitcoinbrainiac.net/newsletters/${newsletter.id}`;
    const meme = await getRandomBitcoinMeme();
    
    // Download and upload meme
    const response = await axios.get(meme.url, { responseType: 'arraybuffer' });
    const memeImage = Buffer.from(response.data, 'binary');
    const mediaId = await xClient.v1.uploadMedia(memeImage, { 
      mimeType: 'image/gif',
      target: 'tweet'
    });

    // Post tweet
    const tweet = await xClient.v2.tweet({
      text: `${newsletter.title}\n\nRead today's newsletter: ${newsletterUrl}`,
      media: { media_ids: [mediaId] }
    });

    return NextResponse.json({ success: true, tweetId: tweet.data.id });
  } catch (error: any) {
    console.error('Newsletter tweet failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 