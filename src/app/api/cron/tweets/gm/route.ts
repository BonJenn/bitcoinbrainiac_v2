import { NextResponse } from 'next/server';
import { xClient } from '@/lib/x';
import { getRandomBitcoinMeme, generateMorningTweet } from '@/lib/social';
import axios from 'axios';

export async function GET() {
  try {
    const morningTweet = await generateMorningTweet();
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
      text: morningTweet,
      media: { media_ids: [mediaId] }
    });

    return NextResponse.json({ success: true, tweetId: tweet.data.id });
  } catch (error: any) {
    console.error('GM tweet failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 