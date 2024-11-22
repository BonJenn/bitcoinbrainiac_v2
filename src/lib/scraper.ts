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
    
    return items.map((item: any) => ({
      title: item.title[0],
      summary: item.description[0].replace(/<[^>]*>/g, ''),
      source: source.name,
      timestamp: new Date(item.pubDate[0]).toISOString(),
      fullText: `${item.title[0]} ${item.description[0].replace(/<[^>]*>/g, '')}`
    }));
  } catch (error) {
    console.error(`Failed to fetch from ${source.name}:`, error.message);
    return [];
  }
}

export async function scrapeBitcoinNews() {
  console.log('Starting multi-source RSS feed fetch...');
  
  try {
    // Fetch from all sources in parallel
    const allArticlesArrays = await Promise.all(
      NEWS_SOURCES.map(source => fetchRSSFeed(source))
    );

    // Combine all articles and sort by timestamp
    const allArticles = allArticlesArrays
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (allArticles.length === 0) {
      throw new Error('No articles found from any source');
    }

    console.log(`Successfully fetched ${allArticles.length} total articles from ${NEWS_SOURCES.length} sources`);
    
    // Return 5 most recent articles
    return allArticles.slice(0, 5);
  } catch (error: any) {
    console.error('Scraping failed:', error);
    throw new Error(`Failed to fetch news: ${error.message}`);
  }
}
