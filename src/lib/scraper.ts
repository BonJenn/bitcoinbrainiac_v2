import axios from 'axios';
import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';

export async function scrapeBitcoinNews() {
  console.log('Starting RSS feed fetch...');
  
  try {
    // Try RSS feed first
    const response = await axios.get('https://cointelegraph.com/rss/tag/bitcoin', {
      headers: {
        'User-Agent': 'Bitcoin Brainiac Newsletter/1.0',
        'Accept': 'application/rss+xml,application/xml;q=0.9',
      },
      timeout: 15000,
      responseType: 'text'
    });

    const result = await parseStringPromise(response.data);
    const items = result.rss.channel[0].item;
    
    const articles = items.map((item: any) => ({
      title: item.title[0],
      summary: item.description[0].replace(/<[^>]*>/g, ''), // Remove HTML tags
      source: 'Cointelegraph',
      timestamp: new Date(item.pubDate[0]).toISOString(),
      fullText: `${item.title[0]} ${item.description[0].replace(/<[^>]*>/g, '')}`
    }));

    if (articles.length === 0) {
      throw new Error('No articles found in RSS feed');
    }

    console.log(`Successfully fetched ${articles.length} articles from RSS`);
    return articles.slice(0, 3);

  } catch (error: any) {
    // Fallback to Bitcoin Magazine RSS if Cointelegraph fails
    try {
      console.log('Falling back to Bitcoin Magazine RSS...');
      const response = await axios.get('https://bitcoinmagazine.com/.rss/full/', {
        headers: {
          'User-Agent': 'Bitcoin Brainiac Newsletter/1.0',
          'Accept': 'application/rss+xml,application/xml;q=0.9',
        },
        timeout: 15000,
        responseType: 'text'
      });

      const result = await parseStringPromise(response.data);
      const items = result.rss.channel[0].item;
      
      const articles = items.map((item: any) => ({
        title: item.title[0],
        summary: item.description[0].replace(/<[^>]*>/g, ''),
        source: 'Bitcoin Magazine',
        timestamp: new Date(item.pubDate[0]).toISOString(),
        fullText: `${item.title[0]} ${item.description[0].replace(/<[^>]*>/g, '')}`
      }));

      if (articles.length === 0) {
        throw new Error('No articles found in Bitcoin Magazine RSS');
      }

      console.log(`Successfully fetched ${articles.length} articles from Bitcoin Magazine RSS`);
      return articles.slice(0, 3);
    } catch (error: any) {
      console.error('Detailed scraper error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }
}
