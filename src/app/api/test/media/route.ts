import { NextResponse } from 'next/server';
import { xClient } from '@/lib/x';
import axios from 'axios';

export async function GET() {
  try {
    console.log('Testing simple media upload...');

    // Use a known working GIF URL for testing
    const testImageUrl = 'https://media.giphy.com/media/L7X7JvEbKqwwU/giphy.gif';
    
    // Download the image
    console.log('Downloading test image...');
    const response = await axios.get(testImageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    
    // Log buffer details
    console.log('Image downloaded, size:', imageBuffer.length, 'bytes');

    // Upload to Twitter
    console.log('Uploading to Twitter...');
    const mediaId = await xClient.v1.uploadMedia(imageBuffer, { 
      mimeType: 'image/gif',
      target: 'tweet'
    });
    console.log('Media uploaded successfully, ID:', mediaId);

    // Try posting a tweet with the media
    console.log('Posting test tweet with media...');
    const tweet = await xClient.v2.tweet({
      text: '🧪 Testing media upload...',
      media: { media_ids: [mediaId] }
    });

    return NextResponse.json({
      success: true,
      mediaId,
      tweet: tweet.data,
      debug: {
        imageSize: imageBuffer.length,
        imageUrl: testImageUrl
      }
    });

  } catch (error: any) {
    console.error('Media test failed:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.data || 'No additional details',
      stack: error.stack,
      phase: error.phase || 'unknown'
    }, { 
      status: 500 
    });
  }
} 