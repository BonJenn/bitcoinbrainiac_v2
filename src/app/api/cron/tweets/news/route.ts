import { NextResponse } from 'next/server';
import { xClient } from '@/lib/x';
import { scrapeBitcoinNews } from '@/lib/scraper';
import { generateNewsComment, getRandomBitcoinMeme } from '@/lib/social';
import axios from 'axios';

export async function GET() {
  try {
    const articles = await scrapeBitcoinNews();
    if (!articles || articles.length === 0) {
      throw new Error('No articles found');
    }

    const mainArticle = articles[0];
    const newsComment = await generateNewsComment(mainArticle);

    // Get a Bitcoin-related image instead of article image
    let mediaId;
    try {
      const meme = await getRandomBitcoinMeme();
      console.log('Using Bitcoin image:', meme.url);
      
      const imageResponse = await axios.get(meme.url, { 
        responseType: 'arraybuffer'
      });
      
      const imageBuffer = Buffer.from(imageResponse.data);
      mediaId = await xClient.v1.uploadMedia(imageBuffer, { 
        mimeType: 'image/gif',
        target: 'tweet'
      });
      console.log('Image uploaded to Twitter, mediaId:', mediaId);
    } catch (imageError) {
      console.error('Failed to process image:', imageError);
    }

    // Format tweet with comment, hashtags, and URL each on new lines
    const tweetParams: any = {
      text: `${newsComment}\n\n${mainArticle.url}`
    };

    if (mediaId) {
      tweetParams.media = { media_ids: [mediaId] };
      console.log('Adding media to tweet:', mediaId);
    }

    const tweet = await xClient.v2.tweet(tweetParams);

    return NextResponse.json({ 
      success: true, 
      tweetId: tweet.data.id,
      article: {
        title: mainArticle.title,
        url: mainArticle.url,
        comment: newsComment,
        hasImage: !!mediaId
      }
    });
  } catch (error: any) {
    console.error('News tweet failed:', error);
    return NextResponse.json({ 
      error: error.message,
      articleData: error.articleData || 'No article data available'
    }, { 
      status: 500 
    });
  }
} 