import { scrapeBitcoinNews } from './scraper';
import { getBitcoinPrice } from './price';

export async function fetchArticles() {
  return await scrapeBitcoinNews();
}

export async function fetchBitcoinData() {
  return await getBitcoinPrice();
}
