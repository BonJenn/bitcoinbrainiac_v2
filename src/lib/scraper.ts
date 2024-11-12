import puppeteer from 'puppeteer';

function isBitcoinRelated(text: string): boolean {
  const bitcoinTerms = ['bitcoin', 'btc', 'satoshi', 'lightning network'];
  const text_lower = text.toLowerCase();
  return bitcoinTerms.some(term => text_lower.includes(term));
}

export async function scrapeBitcoinNews() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const allArticles = [];
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);

    // Scrape from CoinGecko
    try {
      await page.goto('https://www.coingecko.com/en/news/bitcoin', {
        waitUntil: 'networkidle0'
      });
      await page.waitForSelector('article');

      const coingeckoArticles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('article');
        return Array.from(articleElements, article => {
          const titleElement = article.querySelector('h2');
          const summaryElement = article.querySelector('p');
          const title = titleElement ? titleElement.textContent?.trim() : '';
          const summary = summaryElement ? summaryElement.textContent?.trim() : '';
          
          return {
            title,
            summary,
            source: 'CoinGecko News',
            timestamp: new Date().toISOString(),
            fullText: `${title} ${summary}`
          };
        });
      });

      // Filter for Bitcoin-related articles
      const bitcoinArticles = coingeckoArticles
        .filter(article => isBitcoinRelated(article.fullText))
        .slice(0, 3);

      allArticles.push(...bitcoinArticles);
    } catch (error) {
      console.error('Error scraping CoinGecko:', error);
    }

    // Scrape from Bitcoin.com
    try {
      await page.goto('https://www.bitcoin.com/news/', {
        waitUntil: 'networkidle0'
      });
      await page.waitForSelector('article');

      const bitcoinComArticles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('article');
        return Array.from(articleElements, article => {
          const titleElement = article.querySelector('h2, h3');
          const summaryElement = article.querySelector('p');
          const title = titleElement ? titleElement.textContent?.trim() : '';
          const summary = summaryElement ? summaryElement.textContent?.trim() : '';
          
          return {
            title,
            summary,
            source: 'Bitcoin.com',
            timestamp: new Date().toISOString(),
            fullText: `${title} ${summary}`
          };
        });
      });

      // Filter for Bitcoin-related articles
      const bitcoinArticles = bitcoinComArticles
        .filter(article => isBitcoinRelated(article.fullText))
        .slice(0, 3);

      allArticles.push(...bitcoinArticles);
    } catch (error) {
      console.error('Error scraping Bitcoin.com:', error);
    }

    // Remove fullText field before returning
    const cleanedArticles = allArticles.map(({ fullText, ...rest }) => rest);

    if (cleanedArticles.length === 0) {
      throw new Error('No Bitcoin-specific articles found');
    }

    return cleanedArticles;
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
