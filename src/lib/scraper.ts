import axios from 'axios';
import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';

const NEWS_SOURCES = [
  {
    url: 'https://cointelegraph.com/rss/tag/bitcoin',
    name: 'Cointelegraph'
  },
  {
    url: 'https://bitcoinmagazine.com/.rss/full/',
    name: 'Bitcoin Magazine'
  },
  {
    url: 'https://news.bitcoin.com/feed/',
    name: 'Bitcoin.com'
  },
  {
    url: 'https://decrypt.co/feed',
    name: 'Decrypt'
  },
  {
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    name: 'CoinDesk'
  },
  {
    url: 'https://beincrypto.com/feed/',
    name: 'BeInCrypto'
  }
];

async function fetchRSSFeed(source: { url: string, name: string }) {
  try {
    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'Bitcoin Brainiac Newsletter/1.0',
        'Accept': 'application/rss+xml,application/xml;q=0.9',
      },
      timeout: 15000,
      responseType: 'text'
    });

    const result = await parseStringPromise(response.data);
    const items = result.rss.channel[0].item;
    
    return items.map((item: any) => {
      const image = 
        item['media:content']?.[0]?.$.url ||
        item['media:thumbnail']?.[0]?.$.url ||
        item.enclosure?.[0]?.$.url ||
        extractImageFromDescription(item.description[0]);

      return {
        title: item.title[0],
        summary: item.description[0].replace(/<[^>]*>/g, ''),
        url: item.link[0],
        source: source.name,
        timestamp: new Date(item.pubDate[0]).toISOString(),
        fullText: `${item.title[0]} ${item.description[0].replace(/<[^>]*>/g, '')}`,
        imageUrl: image,
        imageSource: source.name
      };
    });
  } catch (error: any) {
    console.error(`Failed to fetch from ${source.name}:`, error?.message || 'Unknown error');
    return [];
  }
}

function extractImageFromDescription(description: string): string | null {
  const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

export async function scrapeBitcoinNews() {
  console.log('Starting multi-source RSS feed fetch...');
  
  try {
    const allArticlesArrays = await Promise.all(
      NEWS_SOURCES.map(source => fetchRSSFeed(source))
    );

    // Combine all articles and filter for Bitcoin-only content
    const allArticles = allArticlesArrays
      .flat()
      .filter(article => {
        const content = (article.title + article.summary).toLowerCase();
        // Exclude articles about other cryptocurrencies
        const excludeTerms = ['ethereum', 'eth', 'altcoin', 'xrp', 'ripple', 'memecoin', 'dogecoin', 'shiba', 'solana', 'sol'];
        return !excludeTerms.some(term => content.includes(term)) &&
               content.includes('bitcoin');
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (allArticles.length === 0) {
      throw new Error('No Bitcoin-specific articles found');
    }

    console.log(`Successfully fetched ${allArticles.length} Bitcoin-focused articles`);
    return allArticles.slice(0, 5);
  } catch (error: any) {
    console.error('Scraping failed:', error);
    throw new Error(`Failed to fetch news: ${error.message}`);
  }
}
