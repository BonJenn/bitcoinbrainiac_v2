import { xClient } from './x';
import { Newsletter } from '@/types/newsletter';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI();

// You'll need to add this to your .env.local:
// GIPHY_API_KEY=your_api_key_here

export async function getRandomBitcoinMeme(): Promise<{ url: string, source: string }> {
  if (!process.env.GIPHY_API_KEY) {
    throw new Error('GIPHY_API_KEY is not configured');
  }

  try {
    const response = await axios.get(
      `https://api.giphy.com/v1/gifs/search`,
      {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          q: 'bitcoin meme',
          limit: 50,
          rating: 'g'
        }
      }
    );

    if (!response.data.data || response.data.data.length === 0) {
      throw new Error('No memes found');
    }

    const randomMeme = response.data.data[Math.floor(Math.random() * response.data.data.length)];
    
    // Use the downsized version for better compatibility
    return {
      url: randomMeme.images.downsized.url,
      source: randomMeme.url
    };
  } catch (error) {
    console.error('Failed to fetch meme from Giphy:', error);
    // Fallback to a known working Bitcoin GIF
    return {
      url: 'https://media.giphy.com/media/L7X7JvEbKqwwU/giphy.gif',
      source: 'https://giphy.com/gifs/bitcoin-L7X7JvEbKqwwU'
    };
  }
}

async function downloadMeme(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

async function retryOpenAI(prompt: string, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        timeout: 30000, // 30 second timeout
      });
      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error(`OpenAI attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('All OpenAI retries failed');
}

export async function generateNewsComment(article: any) {
  const prompt = `As a Bitcoin enthusiast and market analyst on X (Twitter), write an engaging, personal take on this news:
  
  Title: "${article.title}"
  Summary: "${article.summary?.substring(0, 200)}..."

  Requirements:
  1. Express a clear personal opinion/analysis
  2. Write in a natural X style (but stay professional)
  3. Show expertise but be conversational
  4. Include 2-3 relevant Bitcoin hashtags ON A SEPARATE LINE
  5. Keep the main comment under 200 characters
  6. Don't mention "article" or "news"
  
  Format the response exactly like this:
  [Your analysis/opinion]

  #Bitcoin #BTC [other relevant hashtag]

  Example:
  This is exactly what I've been saying about institutional adoption! The flood of capital we're seeing is just the beginning. Expecting $100k to be the new floor by EOY 🚀

  #Bitcoin #BTC #Institutions`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a passionate Bitcoin analyst on X. You're knowledgeable but write in an engaging, personal style. You make clear arguments and aren't afraid to make bold predictions based on your analysis. Always format with hashtags on a new line."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Failed to generate news comment:', error);
    throw error;
  }
}

export async function generatePriceComment(price: number, change24h: number) {
  // Fallback content in case of API failure
  const fallbackComments = [
    `Bitcoin at $${price.toLocaleString()}! 🚀`,
    `BTC: $${price.toLocaleString()} | ${change24h > 0 ? '📈' : '📉'} ${change24h}%`,
    `Current Bitcoin price: $${price.toLocaleString()} 💪`,
    `Bitcoin update: $${price.toLocaleString()} ⚡️`
  ];

  try {
    const prompt = `You are a Bitcoin enthusiast. Write a casual, human-like tweet (max 240 chars) reacting to:
    Price: $${price.toLocaleString()}
    24h Change: ${change24h}%
    
    Make it sound authentic, maybe funny, but not cringe. Reference market sentiment.
    Don't use more than 2 emojis. Don't mention "not financial advice".
    If it's a longer tweet, start the second sentence on a new line.`;

    return await retryOpenAI(prompt);
  } catch (error) {
    console.error('Failed to generate price comment:', error);
    // Use a random fallback comment
    return fallbackComments[Math.floor(Math.random() * fallbackComments.length)];
  }
}

export async function generateMorningTweet() {
  return "GM 🌅";
}

// Add retry logic for Twitter API calls with better error logging
async function retryTwitter(fn: () => Promise<any>, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Add a small delay before each attempt (even the first one)
      if (i > 0) {
        const delay = Math.pow(2, i) * 5000; // 5s, 10s, 20s
        console.log(`Waiting ${delay/1000} seconds before retry ${i + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await fn();
      return result;

    } catch (error: any) {
      console.error(`Twitter API attempt ${i + 1} failed with error:`, {
        message: error.message,
        code: error.code,
        data: error.data,
        status: error?.data?.status,
        errors: error?.data?.errors,
        rateLimit: error?.rateLimit,
      });
      
      // If we hit rate limit
      if (error?.data?.status === 429) {
        const resetTime = error?.data?.reset_time || 15 * 60 * 1000;
        console.log(`Rate limited. Waiting ${resetTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, resetTime));
      } 
      // If it's the last retry, throw with details
      else if (i === maxRetries - 1) {
        throw new Error(`Twitter API failed after ${maxRetries} attempts: ${JSON.stringify({
          message: error.message,
          code: error.code,
          data: error.data,
          status: error?.data?.status
        })}`);
      }
    }
  }
  throw new Error('All Twitter API retries failed');
}

// Let's also create a simpler test function
export async function testTwitterApi() {
  try {
    // Try a simple tweet first
    const testTweet = await retryTwitter(() => 
      xClient.v2.tweet('Test tweet ' + new Date().toISOString())
    );
    console.log('Test tweet successful:', testTweet.data.id);
    return { success: true, tweetId: testTweet.data.id };
  } catch (error) {
    console.error('Twitter API test failed:', error);
    throw error;
  }
}

export async function postDailyTweets(newsletter: Newsletter, articles: any[]) {
  try {
    console.log('Starting daily tweet sequence...');

    // 1. Newsletter headline tweet (6:05 AM PST)
    const newsletterUrl = `https://bitcoinbrainiac.net/newsletters/${newsletter.id}`;
    const meme = await getRandomBitcoinMeme();
    const mediaId = await xClient.v1.uploadMedia(await downloadMeme(meme.url), { 
      mimeType: 'image/gif',
      target: 'tweet'
    });

    const headlineTweet = await xClient.v2.tweet({
      text: `${newsletter.title}\n\nRead today's newsletter: ${newsletterUrl}`,
      media: { media_ids: [mediaId] }
    });
    console.log('Posted newsletter tweet:', headlineTweet.data.id);

    // 2. GM tweet (8:05 AM PST)
    const morningTweet = await generateMorningTweet();
    const gmMeme = await getRandomBitcoinMeme();
    const gmMediaId = await xClient.v1.uploadMedia(await downloadMeme(gmMeme.url), { 
      mimeType: 'image/gif',
      target: 'tweet'
    });

    const gmTweet = await xClient.v2.tweet({
      text: morningTweet,
      media: { media_ids: [gmMediaId] }
    });
    console.log('Posted GM tweet:', gmTweet.data.id);

    // 3. News Commentary (12:05 PM PST)
    const mainArticle = articles[0];
    const newsComment = await generateNewsComment(mainArticle);
    const commentTweet = await xClient.v2.tweet(
      `${newsComment}\n\nSource: ${mainArticle.url}`
    );
    console.log('Posted news comment tweet:', commentTweet.data.id);

    // 4. Market Update (3:05 PM PST)
    const priceComment = await generatePriceComment(newsletter.bitcoinPrice, newsletter.priceChange);
    const priceTweet = await xClient.v2.tweet(priceComment);
    console.log('Posted price comment tweet:', priceTweet.data.id);

    return {
      success: true,
      tweets: {
        newsletter: headlineTweet.data.id,
        gm: gmTweet.data.id,
        news: commentTweet.data.id,
        price: priceTweet.data.id
      }
    };
  } catch (error) {
    console.error('Failed to post daily tweets:', error);
    throw error;
  }
}

async function generateWithGPT4(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7
    });
    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Failed to generate with GPT-4:', error);
    throw error;
  }
}